import axiosClient from "@/api/axiosClient";
import { cartService } from "@/services/cartService";
import { mapBackendOrder, unwrapPage } from "@/services/api/backendMappers";
import type { Order, OrderStatus, PaymentMethod, ShippingAddress } from "@/shared/types/domain";

export interface PlaceOrderInput {
  userId: string;
  paymentMethod: PaymentMethod;
  address: ShippingAddress;
  note?: string;
}

export const orderService = {
  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    const cart = await cartService.getCart(input.userId);
    if (!cart || cart.items.length === 0) {
      throw new Error("Giỏ hàng đang trống.");
    }

    const checkoutNote = (input.note ?? cartService.getCheckoutNote(input.userId)).trim();
    const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const total = subtotal;
    const payload = {
      customerId: input.userId,
      totalAmount: Math.round(total),
      note: checkoutNote || null,
      status: "PENDING",
      voucherCode: cart.voucherCode ?? null,
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        subTotal: Math.round(item.unitPrice * item.quantity),
      })),
      payment: {
        amount: Math.round(total),
        method: input.paymentMethod,
        status: input.paymentMethod === "COD" ? "RECEIVED" : "COMPLETED",
        isPaid: input.paymentMethod !== "COD",
        paymentDate: input.paymentMethod === "COD" ? null : new Date().toISOString(),
      },
      shipping: {
        trackingNumber: null,
        carrierPhone: input.address.phone,
        estimatedDelivery: null,
      },
    };
    const { data } = await axiosClient.post("/orders", payload);
    const mapped = mapBackendOrder(data);
    await cartService.clearCart(input.userId, { restock: false });
    return mapped;
  },

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const { data } = await axiosClient.get(`/orders/customer/${userId}`, {
      params: { page: 0, size: 200, sort: "orderDate,desc" },
    });
    return unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendOrder(item));
  },

  async getAllOrders(): Promise<Order[]> {
    const { data } = await axiosClient.get("/orders", {
      params: { page: 0, size: 200, sort: "orderDate,desc" },
    });
    return unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendOrder(item));
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    const { data } = await axiosClient.get(`/orders/${orderId}`);
    return mapBackendOrder(data);
  },

  async cancelOrder(orderId: string, _userId: string): Promise<Order> {
    const { data } = await axiosClient.patch(`/orders/${orderId}/cancel`);
    return mapBackendOrder(data);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, _staffNote?: string): Promise<Order> {
    await axiosClient.patch(`/orders/${orderId}/status`, null, {
      params: { status },
    });
    const refreshed = await this.getOrderById(orderId);
    if (!refreshed) {
      throw new Error("Không tìm thấy đơn hàng sau khi cập nhật.");
    }
    return refreshed;
  },
};
