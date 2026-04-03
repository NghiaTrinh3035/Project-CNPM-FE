import axios from "axios";

import axiosClient from "@/api/axiosClient";
import { mapBackendCategory, unwrapPage } from "@/services/api/backendMappers";
import type { Category } from "@/shared/types/domain";

export interface CategoryListParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface CategoryListResult {
  items: Category[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CategoryPayload {
  name: string;
  description: string | null;
}

const toApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    const message = (data as Record<string, unknown>)["message"];
    if (typeof message === "string" && message.trim()) {
      return message;
    }
    const errorText = (data as Record<string, unknown>)["error"];
    if (typeof errorText === "string" && errorText.trim()) {
      return errorText;
    }
  }

  return fallback;
};

const toCategoryPage = (data: unknown, page: number, pageSize: number): CategoryListResult => {
  const content = unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendCategory(item));
  const payload = data && typeof data === "object" ? (data as Record<string, unknown>) : {};

  const total = Number(payload["totalElements"] ?? content.length);
  const totalPages = Number(payload["totalPages"] ?? (content.length ? 1 : 0));
  const backendPage = Number(payload["number"] ?? page - 1);
  const backendSize = Number(payload["size"] ?? pageSize);

  return {
    items: content,
    page: Number.isFinite(backendPage) ? backendPage + 1 : page,
    pageSize: Number.isFinite(backendSize) ? backendSize : pageSize,
    total: Number.isFinite(total) ? total : content.length,
    totalPages: Number.isFinite(totalPages) ? totalPages : content.length ? 1 : 0,
  };
};

export const categoryAdminService = {
  async list(params: CategoryListParams = {}): Promise<CategoryListResult> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, params.pageSize ?? 10);
    const keyword = params.keyword?.trim() ?? "";

    try {
      const { data } = await axiosClient.get("/categories/search", {
        params: {
          page: page - 1,
          size: pageSize,
          ...(keyword ? { keyword } : {}),
        },
      });
      return toCategoryPage(data, page, pageSize);
    } catch {
      try {
        const { data } = await axiosClient.get("/categories");
        const all = unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendCategory(item));
        const normalizedKeyword = keyword.toLowerCase();
        const filtered = normalizedKeyword
          ? all.filter((item) => `${item.name} ${item.description ?? ""}`.toLowerCase().includes(normalizedKeyword))
          : all;
        const total = filtered.length;
        const totalPages = total ? Math.ceil(total / pageSize) : 0;
        const offset = (page - 1) * pageSize;
        return {
          items: filtered.slice(offset, offset + pageSize),
          page,
          pageSize,
          total,
          totalPages,
        };
      } catch {
        return {
          items: [],
          page,
          pageSize,
          total: 0,
          totalPages: 0,
        };
      }
    }
  },

  async create(payload: CategoryPayload): Promise<Category> {
    try {
      const { data } = await axiosClient.post("/categories", {
        name: payload.name.trim(),
        description: payload.description?.trim() ? payload.description.trim() : null,
      });
      return mapBackendCategory(data as Record<string, unknown>);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể tạo danh mục."));
    }
  },

  async update(categoryId: string, payload: CategoryPayload): Promise<Category> {
    try {
      const { data } = await axiosClient.put(`/categories/${categoryId}`, {
        name: payload.name.trim(),
        description: payload.description?.trim() ? payload.description.trim() : null,
      });
      return mapBackendCategory(data as Record<string, unknown>);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể cập nhật danh mục."));
    }
  },

  async remove(categoryId: string): Promise<void> {
    try {
      await axiosClient.delete(`/categories/${categoryId}`);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể xóa danh mục."));
    }
  },
};

