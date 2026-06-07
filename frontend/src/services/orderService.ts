import axios from "axios";

import axiosClient from "@/api/axiosClient";
import { cartService } from "@/services/cartService";
import { productService } from "@/services/productService";
import { mapBackendOrder, unwrapPage } from "@/services/api/backendMappers";
import type { Order, OrderCancellationReason, OrderStatus, ShippingAddress } from "@/shared/types/domain";

export interface PlaceOrderInput {
  userId: string;
  address: ShippingAddress;
  note?: string;
}

export interface CreatePaymentInput {
  userId: string;
  address: ShippingAddress;
  note?: string;
  method: string;
}

export interface PaymentSession {
  orderId: string;
  accountNumber?: string;
  bankCode?: string;
  amount?: number;
  description?: string;
  qrUrl?: string;
  paymentUrl?: string;
}

export type PaymentStatusEnum = "PENDING" | "SUCCESS" | "WRONG_AMOUNT" | "CANCELLED";

export interface PaymentStatusResult {
  orderId: string;
  status: PaymentStatusEnum;
  expectedAmount: number;
  receivedAmount: number | null;
  message: string;
  order: Order | null;
}

export interface CancelOrderInput {
  reason: OrderCancellationReason;
  note?: string;
}

const buildShippingAddress = (address: ShippingAddress) =>
  [address.detailAddress, address.ward, address.district, address.province]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");

const normalizeNote = (note?: string) => {
  const value = note?.trim();
  return value ? value : null;
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data as { message?: unknown } | undefined;
    if (typeof response?.message === "string" && response.message.trim()) {
      return response.message;
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
};

const hydrateOrderItemImages = async (order: Order): Promise<Order> => {
  const itemIdsNeedingImage = Array.from(
    new Set(order.items.filter((item) => !item.productImage).map((item) => item.productId).filter(Boolean)),
  );

  if (!itemIdsNeedingImage.length) {
    return order;
  }

  const products = await productService.getByIds(itemIdsNeedingImage);
  const imageByProductId = new Map(
    products
      .map((product) => [product.id, product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url ?? ""])
      .filter((entry): entry is [string, string] => Boolean(entry[0] && entry[1])),
  );

  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      productImage: item.productImage || imageByProductId.get(item.productId) || item.productImage,
    })),
  };
};

const buildOrderPayload = async (input: { userId: string; address: ShippingAddress; note?: string }) => {
  const cart = await cartService.getCart(input.userId);
  if (!cart || cart.items.length === 0) {
    throw new Error("Giỏ hàng đang trống.");
  }

  const selectedItemIds = cartService.getSelectedItemIds(input.userId);
  const selectedItemSet = new Set(selectedItemIds);
  const checkoutItems = cart.items.filter((item) => (selectedItemSet.size > 0 ? selectedItemSet.has(item.id) : true));

  if (checkoutItems.length === 0) {
    throw new Error("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
  }

  return {
    customerId: input.userId,
    note: normalizeNote(input.note),
    shippingAddress: buildShippingAddress(input.address),
    voucherCode: cart.voucherCode ?? null,
    items: checkoutItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    shipping: {
      fullName: input.address.fullName,
      phone: input.address.phone,
      province: input.address.province,
      district: input.address.district,
      ward: input.address.ward,
      detailAddress: input.address.detailAddress,
      carrierPhone: input.address.phone,
    },
  };
};

export const orderService = {
  async createPaymentSession(input: CreatePaymentInput): Promise<PaymentSession> {
    try {
      const payload = await buildOrderPayload(input);
      const { data } = await axiosClient.post("/orders/payment/prepare", { ...payload, method: input.method });
      const raw = data as Record<string, unknown>;
      return {
        orderId: String(raw.orderId ?? ""),
        accountNumber: raw.accountNumber ? String(raw.accountNumber) : undefined,
        bankCode: raw.bankCode ? String(raw.bankCode) : undefined,
        amount: raw.amount ? Number(raw.amount) : undefined,
        description: raw.description ? String(raw.description) : undefined,
        qrUrl: raw.qrUrl ? String(raw.qrUrl) : undefined,
        paymentUrl: raw.paymentUrl ? String(raw.paymentUrl) : undefined,
      };
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Không thể tạo phiên thanh toán."));
    }
  },

  async checkPayment(orderId: string, method: string): Promise<PaymentStatusResult> {
    try {
      const { data } = await axiosClient.post(`/orders/payment/${orderId}/verify`, null, {
        params: { method },
      });
      const raw = data as Record<string, unknown>;
      return {
        orderId: String(raw.orderId ?? orderId),
        status: String(raw.status ?? "PENDING") as PaymentStatusEnum,
        expectedAmount: Number(raw.expectedAmount ?? 0),
        receivedAmount: raw.receivedAmount === null || raw.receivedAmount === undefined ? null : Number(raw.receivedAmount),
        message: String(raw.message ?? ""),
        order: raw.order ? mapBackendOrder(raw.order as Record<string, unknown>) : null,
      };
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Không thể kiểm tra trạng thái thanh toán."));
    }
  },

  async cancelPaymentSession(orderId: string, method: string): Promise<void> {
    try {
      await axiosClient.delete(`/orders/payment/${orderId}`, {
        params: { method },
      });
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Không thể hủy phiên thanh toán."));
    }
  },

  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    const payload = await buildOrderPayload(input);
    try {
      const { data } = await axiosClient.post("/orders", {
        ...payload,
        payment: {
          method: "BANK_TRANSFER",
          status: "COMPLETED",
          isPaid: true,
          paymentDate: new Date().toISOString(),
        },
      });
      return mapBackendOrder(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Không thể tạo đơn hàng."));
    }
  },

  async getOrdersByUser(userId: string): Promise<Order[]> {
    try {
      const { data } = await axiosClient.get(`/orders/customer/${userId}`, {
        params: { page: 0, size: 200, sort: "orderDate,desc" },
      });
      return unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendOrder(item));
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Không thể tải danh sách đơn hàng."));
    }
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const { data } = await axiosClient.get("/orders", {
        params: { page: 0, size: 200, sort: "orderDate,desc" },
      });
      return unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendOrder(item));
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Không thể tải danh sách đơn hàng."));
    }
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data } = await axiosClient.get(`/orders/${orderId}`);
      const mapped = mapBackendOrder(data);
      return await hydrateOrderItemImages(mapped);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Không thể tải chi tiết đơn hàng."));
    }
  },

  async cancelOrder(orderId: string, _userId: string, input?: CancelOrderInput): Promise<Order> {
    const payload = input
      ? {
          reason: input.reason,
          note: normalizeNote(input.note),
        }
      : {};

    try {
      const { data } = await axiosClient.patch(`/orders/${orderId}/cancel`, payload);
      return mapBackendOrder(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Không thể hủy đơn hàng."));
    }
  },

  async requestCancel(orderId: string, _userId: string, input: CancelOrderInput): Promise<Order> {
    const payload = {
      reason: input.reason,
      note: normalizeNote(input.note),
    };

    try {
      const { data } = await axiosClient.patch(`/orders/${orderId}/cancel-request`, payload);
      return mapBackendOrder(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Không thể gửi yêu cầu hủy đơn."));
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, _staffNote?: string): Promise<Order> {
    try {
      await axiosClient.patch(`/orders/${orderId}/status`, null, {
        params: { status },
      });
      const refreshed = await this.getOrderById(orderId);
      if (!refreshed) {
        throw new Error("Không tìm thấy đơn hàng sau khi cập nhật.");
      }
      return refreshed;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Không thể cập nhật trạng thái đơn hàng."));
    }
  },
};
