import axiosClient from "@/api/axiosClient";
import { getDb } from "@/mocks/data/database";
import { delay } from "@/services/mock/delay";
import type { Notification } from "@/shared/types/domain";

type NotificationListStrategy = (userId: string) => Promise<unknown>;
type NotificationActionStrategy = (userId: string, notificationId?: string) => Promise<void>;

type RawNotification = {
  id?: unknown;
  title?: unknown;
  content?: unknown;
  message?: unknown;
  body?: unknown;
  type?: unknown;
  href?: unknown;
  isRead?: unknown;
  read?: unknown;
  timeCreated?: unknown;
  createdAt?: unknown;
  receiver?: { id?: unknown } | null;
  userId?: unknown;
  receiverId?: unknown;
};

const NOTIFICATION_TYPE_SET = new Set<Notification["type"]>([
  "ORDER",
  "WARRANTY",
  "PROMOTION",
  "SUPPORT",
  "SYSTEM",
]);

const listStrategies: NotificationListStrategy[] = [
  async (userId) => {
    const { data } = await axiosClient.get(`/notifications/user/${userId}`);
    return data;
  },
  async (userId) => {
    const { data } = await axiosClient.get(`/notifications/receiver/${userId}`);
    return data;
  },
  async (userId) => {
    const { data } = await axiosClient.get(`/notifications`, { params: { userId } });
    return data;
  },
];

const markOneStrategies: NotificationActionStrategy[] = [
  async (userId, notificationId) => {
    await axiosClient.patch(`/notifications/${notificationId}/read`, { userId });
  },
  async (userId, notificationId) => {
    await axiosClient.patch(`/notifications/${notificationId}/read`, null, { params: { userId } });
  },
  async (userId, notificationId) => {
    await axiosClient.put(`/notifications/${notificationId}/read`, { userId });
  },
  async (userId, notificationId) => {
    await axiosClient.patch(`/notifications/read/${notificationId}`, { userId });
  },
];

const markAllStrategies: NotificationActionStrategy[] = [
  async (userId) => {
    await axiosClient.patch(`/notifications/user/${userId}/read-all`);
  },
  async (userId) => {
    await axiosClient.patch(`/notifications/read-all`, { userId });
  },
  async (userId) => {
    await axiosClient.patch(`/notifications/read-all`, null, { params: { userId } });
  },
];

let selectedListStrategy: NotificationListStrategy | null | undefined;
let selectedMarkOneStrategy: NotificationActionStrategy | null | undefined;
let selectedMarkAllStrategy: NotificationActionStrategy | null | undefined;

let listUnavailableAt = 0;
let markOneUnavailableAt = 0;
let markAllUnavailableAt = 0;

const STRATEGY_RETRY_COOLDOWN_MS = 30_000;

const pickString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

const toIso = (value: unknown, fallback = new Date().toISOString()) => {
  if (typeof value === "string" || typeof value === "number" || value instanceof Date) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return fallback;
};

const normalizeType = (type: unknown): Notification["type"] => {
  const value = pickString(type).toUpperCase() as Notification["type"];
  return NOTIFICATION_TYPE_SET.has(value) ? value : "SYSTEM";
};

const toRawNotificationArray = (value: unknown): RawNotification[] => {
  if (Array.isArray(value)) {
    return value as RawNotification[];
  }
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    if (Array.isArray(source.content)) {
      return source.content as RawNotification[];
    }
    if (Array.isArray(source.notifications)) {
      return source.notifications as RawNotification[];
    }
    if (Array.isArray(source.data)) {
      return source.data as RawNotification[];
    }
  }
  return [];
};

const mapRawNotification = (raw: RawNotification, fallbackUserId: string): Notification => ({
  id: pickString(raw.id, `n-${Date.now()}`),
  userId: pickString(raw.receiver?.id ?? raw.userId ?? raw.receiverId, fallbackUserId),
  title: pickString(raw.title, "Thông báo"),
  message: pickString(raw.content ?? raw.message ?? raw.body),
  type: normalizeType(raw.type),
  href: pickString(raw.href) || undefined,
  isRead: Boolean(raw.isRead ?? raw.read ?? false),
  createdAt: toIso(raw.timeCreated ?? raw.createdAt),
});

const sortByCreatedAtDesc = (items: Notification[]) =>
  [...items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

const listMockByUser = async (userId: string): Promise<Notification[]> => {
  await delay(180);
  return sortByCreatedAtDesc(getDb().notifications.filter((item) => item.userId === userId));
};

const markMockAsRead = async (userId: string, notificationId: string): Promise<void> => {
  await delay(120);
  const db = getDb();
  const notification = db.notifications.find((item) => item.userId === userId && item.id === notificationId);
  if (notification) {
    notification.isRead = true;
  }
};

const markMockAllAsRead = async (userId: string): Promise<void> => {
  await delay(140);
  getDb()
    .notifications.filter((item) => item.userId === userId)
    .forEach((item) => {
      item.isRead = true;
    });
};

const executeListApi = async (userId: string): Promise<unknown> => {
  if (selectedListStrategy === null) {
    if (Date.now() - listUnavailableAt < STRATEGY_RETRY_COOLDOWN_MS) {
      throw new Error("Notification API is unavailable");
    }
    selectedListStrategy = undefined;
  }
  if (selectedListStrategy) {
    return selectedListStrategy(userId);
  }
  for (const strategy of listStrategies) {
    try {
      const data = await strategy(userId);
      selectedListStrategy = strategy;
      return data;
    } catch {
      // Try next strategy.
    }
  }
  selectedListStrategy = null;
  listUnavailableAt = Date.now();
  throw new Error("Notification API is unavailable");
};

const executeMarkOneApi = async (userId: string, notificationId: string): Promise<void> => {
  if (selectedMarkOneStrategy === null) {
    if (Date.now() - markOneUnavailableAt < STRATEGY_RETRY_COOLDOWN_MS) {
      throw new Error("Notification API is unavailable");
    }
    selectedMarkOneStrategy = undefined;
  }
  if (selectedMarkOneStrategy) {
    await selectedMarkOneStrategy(userId, notificationId);
    return;
  }
  for (const strategy of markOneStrategies) {
    try {
      await strategy(userId, notificationId);
      selectedMarkOneStrategy = strategy;
      return;
    } catch {
      // Try next strategy.
    }
  }
  selectedMarkOneStrategy = null;
  markOneUnavailableAt = Date.now();
  throw new Error("Notification API is unavailable");
};

const executeMarkAllApi = async (userId: string): Promise<void> => {
  if (selectedMarkAllStrategy === null) {
    if (Date.now() - markAllUnavailableAt < STRATEGY_RETRY_COOLDOWN_MS) {
      throw new Error("Notification API is unavailable");
    }
    selectedMarkAllStrategy = undefined;
  }
  if (selectedMarkAllStrategy) {
    await selectedMarkAllStrategy(userId);
    return;
  }
  for (const strategy of markAllStrategies) {
    try {
      await strategy(userId);
      selectedMarkAllStrategy = strategy;
      return;
    } catch {
      // Try next strategy.
    }
  }
  selectedMarkAllStrategy = null;
  markAllUnavailableAt = Date.now();
  throw new Error("Notification API is unavailable");
};

export const notificationService = {
  async listByUser(userId: string): Promise<Notification[]> {
    try {
      const data = await executeListApi(userId);
      const mapped = toRawNotificationArray(data).map((item) => mapRawNotification(item, userId));
      return sortByCreatedAtDesc(mapped);
    } catch {
      return listMockByUser(userId);
    }
  },

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await executeMarkOneApi(userId, notificationId);
      return;
    } catch {
      await markMockAsRead(userId, notificationId);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await executeMarkAllApi(userId);
      return;
    } catch {
      await markMockAllAsRead(userId);
    }
  },
};
