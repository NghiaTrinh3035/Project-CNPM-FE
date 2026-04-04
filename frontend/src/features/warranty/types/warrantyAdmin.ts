import type { WarrantyStatus } from "@/shared/types/domain";

export interface WarrantyAdminItem {
  id: string;
  customerPhone: string;
  customerName: string;
  issueDescription: string;
  receivedDate: string;
  expectedReturnDate: string;
  status: WarrantyStatus;
  technicianNote: string | null;
  rejectReason: string | null;
  quantity: number;
  productId: string;
  productName: string | null;
}

export interface WarrantyListParams {
  keyword?: string;
  status?: WarrantyStatus | null;
  page?: number;
  pageSize?: number;
}

export interface WarrantyListResult {
  items: WarrantyAdminItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface WarrantyCreatePayload {
  customerName: string;
  customerPhone: string;
  issueDescription: string;
  receivedDate: string;
  expectedReturnDate: string;
  technicianNote: string;
  quantity: number;
  productId: string;
}

export interface WarrantyStatusUpdatePayload {
  status: WarrantyStatus;
  rejectReason: string;
  technicianNote: string;
}

