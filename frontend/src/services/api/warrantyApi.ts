import axiosClient from "@/api/axiosClient";
import { unwrapPage } from "@/services/api/backendMappers";
import type { WarrantyCreatePayload, WarrantyStatusUpdatePayload } from "@/features/warranty/types/warrantyAdmin";

export interface WarrantyAdminListParams {
  keyword?: string;
  status?: string | null;
  page?: number;
  pageSize?: number;
}

export interface CustomerWarrantyCreateRequest {
  orderId: string;
  orderItemId: string;
  description: string;
  images: string[];
}

export interface WarrantyApiResponse {
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
  status?: string;
  technicianNote?: string | null;
  rejectReason?: string | null;
  quantity?: number;
  productId?: string;
  productName?: string | null;
}

const base = "/warranties";

export const warrantyApi = {
  listByCurrentCustomer: async (): Promise<WarrantyApiResponse[]> => {
    const { data } = await axiosClient.get(`${base}/customer`, {
      params: { page: 0, size: 200, sort: "createdAt,desc" },
    });
    return unwrapPage<WarrantyApiResponse>(data);
  },

  listForAdmin: async (params: WarrantyAdminListParams = {}) => {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, params.pageSize ?? 10);
    const keyword = params.keyword?.trim().toLowerCase() ?? "";
    const useSearchEndpoint = Boolean(keyword) || Boolean(params.status);
    const endpoint = useSearchEndpoint ? `${base}/search` : base;

    const { data } = await axiosClient.get(endpoint, {
      params: {
        page: page - 1,
        size: pageSize,
        ...(keyword ? { keyword } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    });

    return data;
  },

  getById: async (id: string): Promise<WarrantyApiResponse> => {
    const { data } = await axiosClient.get<WarrantyApiResponse>(`${base}/${id}`);
    return data;
  },

  updateStatus: async (id: string, payload: WarrantyStatusUpdatePayload): Promise<WarrantyApiResponse> => {
    const { data } = await axiosClient.patch<WarrantyApiResponse>(`${base}/${id}/status`, payload);
    return data;
  },

  createForCustomer: async (payload: CustomerWarrantyCreateRequest): Promise<WarrantyApiResponse> => {
    const { data } = await axiosClient.post<WarrantyApiResponse>(`${base}/customer/create`, payload);
    return data;
  },

  createForAdmin: async (payload: WarrantyCreatePayload): Promise<WarrantyApiResponse> => {
    const { data } = await axiosClient.post<WarrantyApiResponse>(`${base}/create`, payload);
    return data;
  },
};