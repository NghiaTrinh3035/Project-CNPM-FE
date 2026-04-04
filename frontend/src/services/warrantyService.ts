import { warrantyApi } from "@/services/api/warrantyApi";
import type { WarrantyRequest, WarrantyStatus } from "@/shared/types/domain";

type WarrantyListResponse = {
  content?: Array<{
    id?: string;
    userId?: string | null;
    orderId?: string | null;
    orderItemId?: string | null;
    customerPhone?: string;
    customerName?: string;
    issueDescription?: string;
    receivedDate?: string | number | Date;
    expectedReturnDate?: string | number | Date;
    createdAt?: string | number | Date;
    updatedAt?: string | number | Date;
    status?: WarrantyStatus | string;
    technicianNote?: string | null;
    rejectReason?: string | null;
    quantity?: number;
    productId?: string;
    productName?: string | null;
  }>;
};

const toIso = (value: unknown) => {
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const toWarrantyRequest = (raw: NonNullable<WarrantyListResponse["content"]>[number]): WarrantyRequest => ({
  id: String(raw.id ?? ""),
  userId: raw.userId ?? null,
  orderId: raw.orderId ?? null,
  orderItemId: raw.orderItemId ?? null,
  customerName: String(raw.customerName ?? ""),
  customerPhone: String(raw.customerPhone ?? ""),
  productId: String(raw.productId ?? ""),
  productName: raw.productName ?? null,
  quantity: Math.max(1, Number(raw.quantity ?? 1)),
  issueDescription: String(raw.issueDescription ?? ""),
  images: [],
  receivedDate: toIso(raw.receivedDate),
  expectedReturnDate: toIso(raw.expectedReturnDate),
  status: (String(raw.status ?? "RECEIVED").toUpperCase() as WarrantyStatus),
  technicianNote: raw.technicianNote ?? null,
  rejectReason: raw.rejectReason ?? null,
  createdAt: toIso(raw.createdAt),
  updatedAt: toIso(raw.updatedAt),
});

export const warrantyService = {
  async listByUser(_userId: string): Promise<WarrantyRequest[]> {
    const data = await warrantyApi.listByCurrentCustomer();
    return data.map((item) => toWarrantyRequest(item));
  },

  async listAll(): Promise<WarrantyRequest[]> {
    const data = await warrantyApi.listByCurrentCustomer();
    return data.map((item) => toWarrantyRequest(item));
  },

  async getById(id: string): Promise<WarrantyRequest | null> {
    try {
      const data = await warrantyApi.getById(id);
      return toWarrantyRequest(data);
    } catch {
      return null;
    }
  },

  async create(input: {
    orderId: string;
    orderItemId: string;
    issueDescription: string;
    images?: string[];
  }) {
    const data = await warrantyApi.createForCustomer({
      orderId: input.orderId,
      orderItemId: input.orderItemId,
      description: input.issueDescription,
      images: input.images ?? [],
    });
    return toWarrantyRequest(data);
  },

  async updateStatus(_id: string, _status: WarrantyStatus, _technicianNote?: string) {
    throw new Error("Customer warranty service does not support status updates.");
  },
};
