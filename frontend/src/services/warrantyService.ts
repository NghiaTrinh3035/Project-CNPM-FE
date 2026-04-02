import { getDb } from "@/mocks/data/database";
import { delay } from "@/services/mock/delay";
import type { WarrantyRequest, WarrantyStatus } from "@/shared/types/domain";

const pushWarrantyNotification = (userId: string, title: string, message: string) => {
  const db = getDb();
  db.notifications.unshift({
    id: `n-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    userId,
    title,
    message,
    type: "WARRANTY",
    href: "/warranty",
    isRead: false,
    createdAt: new Date().toISOString(),
  });
};

export const warrantyService = {
  async listByUser(userId: string): Promise<WarrantyRequest[]> {
    await delay(220);
    return getDb().warranties.filter((item) => item.userId === userId);
  },

  async listAll(): Promise<WarrantyRequest[]> {
    await delay(220);
    return getDb().warranties;
  },

  async getById(id: string): Promise<WarrantyRequest | null> {
    await delay(160);
    return getDb().warranties.find((item) => item.id === id) ?? null;
  },

  async create(input: Omit<WarrantyRequest, "id" | "status" | "updatedAt" | "createdAt">) {
    await delay(280);
    const db = getDb();
    const order = db.orders.find((item) => item.id === input.orderId && item.userId === input.userId);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng hợp lệ.");
    }
    if (!["DELIVERED", "COMPLETED"].includes(order.status)) {
      throw new Error("Chỉ tạo bảo hành cho đơn đã giao hoặc hoàn tất.");
    }
    const warranty: WarrantyRequest = {
      ...input,
      id: `w-${Date.now()}`,
      status: "RECEIVED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.warranties.unshift(warranty);
    pushWarrantyNotification(input.userId, "Yêu cầu bảo hành mới", "Shop đã tiếp nhận yêu cầu bảo hành của bạn.");
    return structuredClone(warranty);
  },

  async updateStatus(id: string, status: WarrantyStatus, technicianNote?: string) {
    await delay(260);
    const db = getDb();
    const item = db.warranties.find((value) => value.id === id);
    if (!item) {
      throw new Error("Không tìm thấy yêu cầu bảo hành.");
    }
    item.status = status;
    item.technicianNote = technicianNote;
    item.updatedAt = new Date().toISOString();
    pushWarrantyNotification(item.userId, `Bảo hành #${id} cập nhật`, `Trạng thái mới: ${status}`);
    return structuredClone(item);
  },
};
