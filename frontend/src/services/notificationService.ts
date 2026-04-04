import axios from "axios";

import axiosClient from "@/api/axiosClient";
import { getDb } from "@/mocks/data/database";
import { mapBackendNotification, unwrapPage } from "@/services/api/backendMappers";
import { delay } from "@/services/mock/delay";
import type { Notification } from "@/shared/types/domain";

const sortByCreatedAtDesc = (items: Notification[]) =>
  [...items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

const listFromMock = async (userId: string): Promise<Notification[]> => {
  await delay(180);
  return sortByCreatedAtDesc(getDb().notifications.filter((item) => item.userId === userId));
};

const markOneInMock = async (userId: string, notificationId: string) => {
  await delay(120);
  const notification = getDb().notifications.find((item) => item.userId === userId && item.id === notificationId);
  if (notification) {
    notification.isRead = true;
  }
};

const markAllInMock = async (userId: string) => {
  await delay(140);
  getDb()
    .notifications.filter((item) => item.userId === userId)
    .forEach((item) => {
      item.isRead = true;
    });
};

const deleteOneInMock = async (userId: string, notificationId: string) => {
  await delay(120);
  const db = getDb();
  db.notifications = db.notifications.filter((item) => !(item.userId === userId && item.id === notificationId));
};

const clearAllInMock = async (userId: string) => {
  await delay(120);
  const db = getDb();
  db.notifications = db.notifications.filter((item) => item.userId !== userId);
};

const canTryNextEndpoint = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return false;
  }
  const status = error.response?.status;
  return status === 404 || status === 405;
};

const shouldFallbackToMock = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return true;
  }
  const status = error.response?.status;
  if (status === undefined) {
    return true;
  }
  if (status === 401 || status === 403) {
    return false;
  }
  return status === 404 || status === 405 || status >= 500;
};

const runCandidateRequests = async <T>(candidates: Array<() => Promise<T>>): Promise<T> => {
  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      return await candidate();
    } catch (error) {
      lastError = error;
      if (!canTryNextEndpoint(error)) {
        break;
      }
    }
  }
  throw lastError ?? new Error("No notification endpoint candidate succeeded.");
};

const mapNotificationPayload = (payload: unknown, userId: string): Notification[] => {
  const mapped = unwrapPage<Record<string, unknown>>(payload).map((raw) => {
    const notification = mapBackendNotification(raw);
    return notification.userId ? notification : { ...notification, userId };
  });
  return sortByCreatedAtDesc(mapped.filter((item) => item.userId === userId));
};

export const notificationService = {
  async listByUser(userId: string): Promise<Notification[]> {
    try {
      const response = await runCandidateRequests([
        () => axiosClient.get(`/notifications/user/${userId}`),
        () => axiosClient.get(`/notifications/receiver/${userId}`),
        () => axiosClient.get("/notifications", { params: { userId } }),
        () => axiosClient.get("/notifications/me", { params: { userId } }),
      ]);
      return mapNotificationPayload(response.data, userId);
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error;
      }
      return listFromMock(userId);
    }
  },

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await runCandidateRequests([
        () =>
          axiosClient.patch(
            `/notifications/${notificationId}/read`,
            { userId },
            { params: { userId } },
          ),
        () =>
          axiosClient.patch(
            `/notifications/read/${notificationId}`,
            { userId },
            { params: { userId } },
          ),
        () =>
          axiosClient.put(
            `/notifications/${notificationId}/read`,
            { userId },
            { params: { userId } },
          ),
        () =>
          axiosClient.put(
            `/notifications/read/${notificationId}`,
            { userId },
            { params: { userId } },
          ),
      ]);
      return;
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error;
      }
      await markOneInMock(userId, notificationId);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await runCandidateRequests([
        () => axiosClient.patch(`/notifications/user/${userId}/read-all`),
        () => axiosClient.patch("/notifications/read-all", { userId }, { params: { userId } }),
        () => axiosClient.put(`/notifications/user/${userId}/read-all`),
        () => axiosClient.put("/notifications/read-all", { userId }, { params: { userId } }),
      ]);
      return;
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error;
      }
      await markAllInMock(userId);
    }
  },

  async deleteOne(userId: string, notificationId: string): Promise<void> {
    try {
      await runCandidateRequests([
        () => axiosClient.delete(`/notifications/${notificationId}`, { params: { userId } }),
        () => axiosClient.delete(`/notifications/delete/${notificationId}`, { params: { userId } }),
        () => axiosClient.delete(`/notifications/${notificationId}`, { data: { userId } }),
        () => axiosClient.delete(`/notifications/delete/${notificationId}`, { data: { userId } }),
      ]);
      return;
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error;
      }
      await deleteOneInMock(userId, notificationId);
    }
  },

  async clearAll(userId: string): Promise<void> {
    try {
      await runCandidateRequests([
        () => axiosClient.delete(`/notifications/user/${userId}`),
        () => axiosClient.delete("/notifications/clear-all", { params: { userId } }),
        () => axiosClient.delete(`/notifications/user/${userId}`, { data: { userId } }),
        () => axiosClient.delete("/notifications/clear-all", { data: { userId } }),
      ]);
      return;
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error;
      }
      await clearAllInMock(userId);
    }
  },
};
