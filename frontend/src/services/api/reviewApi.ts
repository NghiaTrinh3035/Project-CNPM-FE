import axiosClient from "@/api/axiosClient";
import { unwrapPage } from "@/services/api/backendMappers";

export interface ReviewRequest {
    customerId: string;
    productId: string;
    rating: number;
    comment: string;
}


export interface ReviewResponse {
    id: string;
    customerId: string;
    customerUsername: string;
    productId: string;
    productName: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

const base = "/reviews";

export const reviewApi = {
    listByProduct: async (productId: string): Promise<ReviewResponse[]> => {
        const { data } = await axiosClient.get(`${base}/product/${productId}`);
        return unwrapPage<ReviewResponse>(data);
    },

    createReview: async (payload: ReviewRequest): Promise<ReviewResponse> => {
        const { data } = await axiosClient.post<ReviewResponse>(`${base}/create`, payload);
        return data;
    },

    getAverageRating: async (productId: string): Promise<number> => {
        const { data } = await axiosClient.get<number>(`${base}/product/${productId}/average-rating`);
        return data;
    },

    update: async (reviewId: string, payload: ReviewRequest): Promise<ReviewResponse> => {
        const { data } = await axiosClient.put<ReviewResponse>(`${base}/${reviewId}`, payload);
        return data;
    },

    delete: async (reviewId: string): Promise<void> => {
        await axiosClient.delete(`${base}/${reviewId}`);
    }
};