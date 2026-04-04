import axios from "axios";

import axiosClient from "@/api/axiosClient";
import { cartService } from "@/services/cartService";
import { mapBackendOrder, unwrapPage } from "@/services/api/backendMappers";
import type {
  Order,
  OrderCancellationReason,
  OrderStatus,
  PaymentMethod,
  ShippingAddress,
} from "@/shared/types/domain";

export interface PlaceOrderInput {
  userId: string;
  paymentMethod: PaymentMethod;
  address: ShippingAddress;
  note?: string;
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

export const orderService = {
  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    const cart = await cartService.getCart(input.userId);
    if (!cart || cart.items.length === 0) {
      throw new Error("Giỏ hàng đang trống.");
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const total = Math.max(0, Math.round(subtotal));
    const isPaid = input.paymentMethod !== "COD";
    const payload = {
      customerId: input.userId,
      note: normalizeNote(input.note),
      shippingAddress: buildShippingAddress(input.address),
      voucherCode: cart.voucherCode ?? null,
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      payment: {
        amount: total,
        method: input.paymentMethod,
        status: isPaid ? "COMPLETED" : "RECEIVED",
        isPaid,
        paymentDate: isPaid ? new Date().toISOString() : null,
      },
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

    try {
      const { data } = await axiosClient.post("/orders", payload);
      const mapped = mapBackendOrder(data);
      try {
        await cartService.clearCart(input.userId);
      } catch {
        // Cart cleanup failure should not break successful order placement.
      }
      return mapped;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Không thể tạo đơn hàng. Vui lòng thử lại."));
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
      return mapBackendOrder(data);
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
