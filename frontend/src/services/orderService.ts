import axiosClient from "@/api/axiosClient";
import { getDb } from "@/mocks/data/database";
import { cartService } from "@/services/cartService";
import { mapBackendOrder, mapBackendUser, unwrapPage } from "@/services/api/backendMappers";
import { delay } from "@/services/mock/delay";
import { productService } from "@/services/productService";
import type { Order, OrderStatus, PaymentMethod, ShippingAddress } from "@/shared/types/domain";

export interface PlaceOrderInput {
  userId: string;
  paymentMethod: PaymentMethod;
  address: ShippingAddress;
  note?: string;
}

const localOrders: Order[] = [];

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

const mergeOrders = (primary: Order[], secondary: Order[]) => {
  const map = new Map<string, Order>();
  [...primary, ...secondary].forEach((order) => {
    map.set(order.id, order);
  });
  return Array.from(map.values()).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
};

const findLocalOrder = (orderId: string) => localOrders.find((order) => order.id === orderId);

const upsertLocalOrder = (order: Order) => {
  const index = localOrders.findIndex((entry) => entry.id === order.id);
  if (index >= 0) {
    localOrders[index] = order;
  } else {
    localOrders.unshift(order);
  }
};

const fallbackOrders = () => {
  const dbOrders = getDb().orders;
  return mergeOrders(localOrders, dbOrders);
};

const fetchOrdersByCustomerFromApi = async (customerId: string): Promise<Order[]> => {
  const { data } = await axiosClient.get(`/orders/customer/${customerId}`, {
    params: { page: 0, size: 200, sort: "orderDate,desc" },
  });
  return unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendOrder(item));
};

const fetchAllOrdersFromApi = async (): Promise<Order[]> => {
  const { data } = await axiosClient.get("/users/role/CUSTOMER");
  const customers = unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendUser(item));
  const grouped = await Promise.all(
    customers.map(async (customer) => {
      try {
        return await fetchOrdersByCustomerFromApi(customer.id);
      } catch {
        return [];
      }
    }),
  );
  return grouped.flat();
};

const canTransition = (from: OrderStatus, to: OrderStatus) => {
  if (from === "CANCELLED" || from === "RETURNED") {
    return false;
  }
  const map: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["DELIVERED", "CANCELLED"],
    DELIVERED: ["COMPLETED", "RETURNED"],
    COMPLETED: [],
    CANCELLED: [],
    RETURNED: [],
  };
  return map[from].includes(to);
};

const createLocalOrder = async (input: PlaceOrderInput): Promise<Order> => {
  const cart = await cartService.getCart(input.userId);
  if (!cart || cart.items.length === 0) {
    throw new Error("Giỏ hàng đang trống.");
  }

  const products = await productService.getByIds(cart.items.map((item) => item.productId));
  const productMap = new Map(products.map((item) => [item.id, item]));

  const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = subtotal;
  const createdAt = new Date().toISOString();

  const order: Order = {
    id: `o-local-${Date.now()}`,
    userId: input.userId,
    items: cart.items.map((item) => ({
      id: `oi-local-${Date.now()}-${item.id}`,
      productId: item.productId,
      productName: productMap.get(item.productId)?.name ?? `Product ${item.productId}`,
      productImage: productMap.get(item.productId)?.images[0]?.url ?? "",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    status: "PENDING",
    timeline: [{ status: "PENDING", at: createdAt }],
    subtotal,
    discount: 0,
    shippingFee: 0,
    total,
    voucherCode: cart.voucherCode,
    payment: {
      method: input.paymentMethod,
      status: input.paymentMethod === "COD" ? "UNPAID" : "PAID",
      paidAt: input.paymentMethod === "COD" ? undefined : createdAt,
    },
    shipping: {
      address: input.address,
      note: input.note,
    },
    createdAt,
  };

  upsertLocalOrder(order);
  await cartService.clearCart(input.userId);
  addNotification(input.userId, `Đặt hàng thành công #${order.id}`, "Đơn hàng của bạn đang chờ xác nhận.", `/orders/${order.id}`);
  return order;
};

export const orderService = {
  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    const cart = await cartService.getCart(input.userId);
    if (!cart || cart.items.length === 0) {
      throw new Error("Giỏ hàng đang trống.");
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const total = subtotal;
    try {
      const payload = {
        customer: { id: input.userId },
        totalAmount: Math.round(total),
        note: input.note ?? null,
        status: "PENDING",
        voucher: cart.voucherCode ? { voucherCode: cart.voucherCode } : null,
        orderItems: cart.items.map((item) => ({
          product: { id: item.productId },
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
      upsertLocalOrder(mapped);
      await cartService.clearCart(input.userId);
      addNotification(input.userId, `Đặt hàng thành công #${mapped.id}`, "Đơn hàng của bạn đang chờ xác nhận.", `/orders/${mapped.id}`);
      return mapped;
    } catch {
      return createLocalOrder(input);
    }
  },

  async getOrdersByUser(userId: string): Promise<Order[]> {
    try {
      const apiOrders = await fetchOrdersByCustomerFromApi(userId);
      const local = localOrders.filter((item) => item.userId === userId);
      return mergeOrders(apiOrders, local);
    } catch {
      await delay(120);
      return fallbackOrders().filter((item) => item.userId === userId);
    }
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const apiOrders = await fetchAllOrdersFromApi();
      return mergeOrders(apiOrders, localOrders);
    } catch {
      await delay(120);
      return fallbackOrders();
    }
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    const local = findLocalOrder(orderId);
    try {
      const { data } = await axiosClient.get(`/orders/${orderId}`);
      const mapped = mapBackendOrder(data);
      upsertLocalOrder(mapped);
      return mapped;
    } catch {
      await delay(80);
      return local ?? fallbackOrders().find((item) => item.id === orderId) ?? null;
    }
  },

  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    const local = findLocalOrder(orderId);
    if (local) {
      if (local.userId !== userId) {
        throw new Error("Không tìm thấy đơn hàng.");
      }
      if (!["PENDING", "CONFIRMED"].includes(local.status)) {
        throw new Error("Chỉ có thể hủy đơn đang xử lý.");
      }
      const updated: Order = {
        ...local,
        status: "CANCELLED",
        timeline: [...local.timeline, { status: "CANCELLED", at: new Date().toISOString(), note: "Khách hàng hủy đơn." }],
      };
      upsertLocalOrder(updated);
      addNotification(userId, `Đơn #${updated.id} đã hủy`, "Bạn đã hủy đơn hàng thành công.", `/orders/${updated.id}`);
      return updated;
    }

    await axiosClient.patch(`/orders/${orderId}/cancel`);
    const refreshed = await this.getOrderById(orderId);
    if (!refreshed) {
      throw new Error("Không tìm thấy đơn hàng sau khi hủy.");
    }
    addNotification(userId, `Đơn #${refreshed.id} đã hủy`, "Bạn đã hủy đơn hàng thành công.", `/orders/${refreshed.id}`);
    return refreshed;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, staffNote?: string): Promise<Order> {
    const local = findLocalOrder(orderId);
    if (local) {
      if (!canTransition(local.status, status)) {
        throw new Error("Không thể chuyển trạng thái đơn hàng.");
      }
      const updated: Order = {
        ...local,
        status,
        timeline: [...local.timeline, { status, at: new Date().toISOString(), note: staffNote }],
      };
      upsertLocalOrder(updated);
      addNotification(
        updated.userId,
        `Đơn #${updated.id} cập nhật trạng thái`,
        `Trạng thái mới: ${updated.status}`,
        `/orders/${updated.id}`,
      );
      return updated;
    }

    await axiosClient.patch(`/orders/${orderId}/status`, null, {
      params: { status },
    });
    const refreshed = await this.getOrderById(orderId);
    if (!refreshed) {
      throw new Error("Không tìm thấy đơn hàng sau khi cập nhật.");
    }
    addNotification(
      refreshed.userId,
      `Đơn #${refreshed.id} cập nhật trạng thái`,
      `Trạng thái mới: ${refreshed.status}`,
      `/orders/${refreshed.id}`,
    );
    return refreshed;
  },
};
