import axios from "axios";

import axiosClient from "@/api/axiosClient";
import { mapBackendCategory, mapBackendProduct, unwrapPage } from "@/services/api/backendMappers";
import { productApi, type ProductCreateRequest, type ProductSearchRequest, type ProductUpdateRequest } from "@/services/api/productApi";
import type { Category, Product, ProductImage, ProductStatus } from "@/shared/types/domain";

export interface ProductAdminListParams {
  keyword?: string;
  status?: ProductStatus | null;
  page?: number;
  pageSize?: number;
}

export interface ProductAdminListResult {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
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

const mapProductImage = (raw: Record<string, unknown>): ProductImage => ({
  id: String(raw["id"] ?? ""),
  url: String(raw["imageUrl"] ?? raw["url"] ?? ""),
  alt: "",
  isPrimary: Boolean(raw["isThumbnail"]),
});

const toPage = (data: unknown, page: number, pageSize: number): ProductAdminListResult => {
  const content = unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendProduct(item));
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

export const productAdminService = {
  async list(params: ProductAdminListParams = {}): Promise<ProductAdminListResult> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, params.pageSize ?? 10);

    const query: ProductSearchRequest = {
      page: page - 1,
      size: pageSize,
      ...(params.keyword?.trim() ? { name: params.keyword.trim() } : {}),
      ...(params.status ? { status: params.status } : {}),
    };

    try {
      const data = await productApi.searchProducts(query);
      return toPage(data, page, pageSize);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể tải danh sách sản phẩm."));
    }
  },

  async getById(productId: string): Promise<Product | null> {
    try {
      const data = await productApi.getProductById(productId);
      return mapBackendProduct(data as unknown as Record<string, unknown>);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(toApiErrorMessage(error, "Không thể tải chi tiết sản phẩm."));
    }
  },

  async create(payload: ProductCreateRequest): Promise<Product> {
    try {
      const data = await productApi.createProduct(payload);
      return mapBackendProduct(data as unknown as Record<string, unknown>);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể tạo sản phẩm."));
    }
  },

  async update(productId: string, payload: ProductUpdateRequest): Promise<Product> {
    try {
      const data = await productApi.updateProduct(productId, payload);
      return mapBackendProduct(data as unknown as Record<string, unknown>);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể cập nhật sản phẩm."));
    }
  },

  async remove(productId: string): Promise<void> {
    try {
      await productApi.deleteProduct(productId);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể xóa sản phẩm."));
    }
  },

  async listCategories(): Promise<Category[]> {
    try {
      const { data } = await axiosClient.get("/categories");
      return unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendCategory(item));
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể tải danh mục."));
    }
  },

  async getImages(productId: string): Promise<ProductImage[]> {
    try {
      const data = await productApi.getImages(productId);
      return Array.isArray(data) ? data.map((item) => mapProductImage(item as unknown as Record<string, unknown>)) : [];
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể tải danh sách ảnh sản phẩm."));
    }
  },

  async uploadImage(productId: string, file: File, isPrimary = false): Promise<ProductImage> {
    try {
      const data = await productApi.uploadImage(productId, { file, isThumbnail: isPrimary });
      return mapProductImage(data as unknown as Record<string, unknown>);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể upload ảnh sản phẩm."));
    }
  },

  async deleteImage(productId: string, imageId: string): Promise<void> {
    try {
      await productApi.deleteImage(productId, imageId);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể xóa ảnh sản phẩm."));
    }
  },

  async setImageAvatar(productId: string, imageId: string): Promise<ProductImage> {
    try {
      const data = await productApi.setImageThumbnail(productId, imageId);
      return mapProductImage(data as unknown as Record<string, unknown>);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể cập nhật ảnh đại diện."));
    }
  },
};

