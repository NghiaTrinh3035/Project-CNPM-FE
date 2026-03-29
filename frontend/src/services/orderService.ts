import { cartService } from "@/services/cartService";
import { delay } from "@/services/mock/delay";
import { getDb } from "@/mocks/data/database";
import type { Order, OrderStatus, PaymentMethod, ShippingAddress } from "@/shared/types/domain";

export interface PlaceOrderInput {
  userId: string;
  paymentMethod: PaymentMethod;
  address: ShippingAddress;
  note?: string;
}

const addNotification = (userId: string, title: string, message: string, href?: string) => {
  const db = getDb();
  db.notifications.unshift({
    id: `n-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    userId,
    title,
    message,
    type: "ORDER",
    href,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
};

const canTransition = (from: OrderStatus, to: OrderStatus) => {
  if (from === "CANCELLED" || from === "RETURNED") {
    return false;
  }
  const map: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["SHIPPING", "CANCELLED"],
    SHIPPING: ["DELIVERED", "RETURNED"],
    DELIVERED: ["COMPLETED", "RETURNED"],
    COMPLETED: [],
    CANCELLED: [],
    RETURNED: [],
  };
  return map[from].includes(to);
};

export const orderService = {
  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    await delay(350);
    const db = getDb();
    const cart = db.carts.find((item) => item.userId === input.userId);
    if (!cart || cart.items.length === 0) {
      throw new Error("Giỏ hàng đang trống.");
    }
    const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const voucher = cart.voucherCode ? db.vouchers.find((item) => item.code === cart.voucherCode) : undefined;
    const discount = voucher ? Math.round((subtotal * voucher.discountPercent) / 100) : 0;
    const total = subtotal - discount;

    const order: Order = {
      id: `o-${Date.now()}`,
      userId: input.userId,
      items: cart.items.map((item) => {
        const product = db.products.find((value) => value.id === item.productId);
        if (!product) {
          throw new Error("Sản phẩm trong giỏ hàng không hợp lệ.");
        }
        product.stockQuantity -= item.quantity;
        if (product.stockQuantity <= 0) {
          product.status = "OUT_OF_STOCK";
        }
        return {
          id: `oi-${Date.now()}-${item.id}`,
          productId: item.productId,
          productName: product.name,
          productImage: product.images[0]?.url ?? "",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        };
      }),
      status: "PENDING",
      timeline: [{ status: "PENDING", at: new Date().toISOString() }],
      subtotal,
      discount,
      shippingFee: 0,
      total,
      voucherCode: cart.voucherCode,
      payment: {
        method: input.paymentMethod,
        status: input.paymentMethod === "COD" ? "UNPAID" : "PAID",
        paidAt: input.paymentMethod === "COD" ? undefined : new Date().toISOString(),
      },
      shipping: {
        address: input.address,
        note: input.note,
      },
      createdAt: new Date().toISOString(),
    };

    db.orders.unshift(order);
    await cartService.clearCart(input.userId);
    addNotification(input.userId, `Đặt hàng thành công #${order.id}`, "Đơn hàng của bạn đang chờ xác nhận.", `/orders/${order.id}`);
    return structuredClone(order);
  },

  async getOrdersByUser(userId: string): Promise<Order[]> {
    await delay(220);
    const db = getDb();
    return db.orders
      .filter((item) => item.userId === userId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  },

  async getAllOrders(): Promise<Order[]> {
    await delay(220);
    return getDb().orders.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    await delay(180);
    return getDb().orders.find((item) => item.id === orderId) ?? null;
  },

  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    await delay(260);
    const db = getDb();
    const order = db.orders.find((item) => item.id === orderId && item.userId === userId);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng.");
    }
    if (order.status !== "PENDING") {
      throw new Error("Chỉ có thể hủy đơn đang chờ xác nhận.");
    }
    order.status = "CANCELLED";
    order.timeline.push({
      status: "CANCELLED",
      at: new Date().toISOString(),
      note: "Khách hàng hủy đơn.",
    });
    addNotification(userId, `Đơn #${order.id} đã hủy`, "Bạn đã hủy đơn hàng thành công.", `/orders/${order.id}`);
    return structuredClone(order);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, staffNote?: string): Promise<Order> {
    await delay(260);
    const db = getDb();
    const order = db.orders.find((item) => item.id === orderId);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng.");
    }
    if (!canTransition(order.status, status)) {
      throw new Error("Không thể chuyển trạng thái đơn hàng theo luồng hiện tại.");
    }
    order.status = status;
    order.timeline.push({
      status,
      at: new Date().toISOString(),
      note: staffNote,
    });
    addNotification(
      order.userId,
      `Đơn #${order.id} cập nhật trạng thái`,
      `Trạng thái mới: ${status}`,
      `/orders/${order.id}`,
    );
    return structuredClone(order);
  },
};
