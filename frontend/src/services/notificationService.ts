import { getDb } from "@/mocks/data/database";
import { delay } from "@/services/mock/delay";
import type { Notification } from "@/shared/types/domain";

export const notificationService = {
  async listByUser(userId: string): Promise<Notification[]> {
    await delay(180);
    return getDb()
      .notifications.filter((item) => item.userId === userId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  },

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await delay(120);
    const db = getDb();
    const notification = db.notifications.find(
      (item) => item.userId === userId && item.id === notificationId,
    );
    if (notification) {
      notification.isRead = true;
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    await delay(140);
    getDb().notifications
      .filter((item) => item.userId === userId)
      .forEach((item) => {
        item.isRead = true;
      });
  },
};
