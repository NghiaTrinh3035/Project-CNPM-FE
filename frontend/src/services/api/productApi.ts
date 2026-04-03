import axiosClient from "@/api/axiosClient";

export interface ProductCategoryResponse {
  id: string;
  name: string;
}

export interface ProductResponse {
  id: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  movementType: string;
  glassMaterial: string;
  faceSize: string;
  wireMaterial: string;
  waterResistance: string;
  faceColor: string;
  wireColor: string;
  caseColor: string;
  color: string;
  size: string;
  specs: string;
  status: string;
  categoryId?: string;
  categoryName?: string;
  categoryIds?: string[];
  categoryNames?: string[];
  categories?: ProductCategoryResponse[];
  imageUrls: string[];
  averageRating: number;
  updatedAt: string;
}

export interface ProductCreateRequest {
  brand: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryIds: string[];
  categoryId?: string;
  movementType: string;
  glassMaterial: string;
  faceSize: string;
  wireMaterial: string;
  waterResistance: string;
  faceColor: string;
  wireColor: string;
  caseColor: string;
  color: string;
  size: string;
  specs: string;
}

export interface ProductUpdateRequest {
  brand: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryIds: string[];
  categoryId?: string;
  movementType: string;
  glassMaterial: string;
  faceSize: string;
  wireMaterial: string;
  waterResistance: string;
  faceColor: string;
  wireColor: string;
  caseColor: string;
  color: string;
  size: string;
  specs: string;
  status: string;
}

export interface ProductSearchRequest {
  name?: string;
  brand?: string;
  color?: string;
  faceSize?: string;
  spec?: string;
  specs?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface ProductImageResponse {
  id: string;
  imageUrl?: string;
  url?: string;
  altText?: string;
  isThumbnail?: boolean;
}

export interface PageResponse<T> {
  content?: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

const base = "/products";

export const productApi = {
  getProducts: async (): Promise<ProductResponse[]> => {
    const { data } = await axiosClient.get<ProductResponse[]>(base);
    return data;
  },

  searchProducts: async (params: ProductSearchRequest): Promise<PageResponse<ProductResponse>> => {
    const { data } = await axiosClient.get<PageResponse<ProductResponse>>(`${base}/search`, { params });
    return data;
  },

  getProductById: async (id: string): Promise<ProductResponse> => {
    const { data } = await axiosClient.get<ProductResponse>(`${base}/${id}`);
    return data;
  },

  getByCategory: async (categoryId: string): Promise<ProductResponse[]> => {
    const { data } = await axiosClient.get<ProductResponse[]>(`${base}/category/${categoryId}`);
    return data;
  },

  createProduct: async (payload: ProductCreateRequest): Promise<ProductResponse> => {
    const { data } = await axiosClient.post<ProductResponse>(`${base}/create`, payload);
    return data;
  },

  updateProduct: async (id: string, payload: ProductUpdateRequest): Promise<ProductResponse> => {
    const { data } = await axiosClient.put<ProductResponse>(`${base}/${id}`, payload);
    return data;
  },

  uploadImages: async (id: string, files: File[], thumbnailIndex?: number): Promise<ProductResponse> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (thumbnailIndex !== undefined) {
      formData.append("thumbnailIndex", String(thumbnailIndex));
    }
    const { data } = await axiosClient.post<ProductResponse>(`${base}/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await axiosClient.delete(`${base}/${id}`);
  },

  getImages: async (id: string): Promise<ProductImageResponse[]> => {
    const { data } = await axiosClient.get<ProductImageResponse[]>(`${base}/${id}/images`);
    return data;
  },

  uploadImage: async (
    id: string,
    payload: { file: File; altText?: string; isThumbnail?: boolean },
  ): Promise<ProductImageResponse> => {
    const formData = new FormData();
    formData.append("file", payload.file);
    if (payload.altText?.trim()) {
      formData.append("altText", payload.altText.trim());
    }
    if (payload.isThumbnail !== undefined) {
      formData.append("isThumbnail", String(payload.isThumbnail));
    }
    const { data } = await axiosClient.post<ProductImageResponse>(`${base}/${id}/images/file`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  deleteImage: async (id: string, imageId: string): Promise<void> => {
    await axiosClient.delete(`${base}/${id}/images/${imageId}`);
  },

  compare: async (productAId: string, productBId: string): Promise<ProductResponse[]> => {
    const { data } = await axiosClient.get<ProductResponse[]>(`${base}/compare`, {
      params: { productAId, productBId },
    });
    return data;
  },
};
