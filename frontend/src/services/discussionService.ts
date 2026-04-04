import type { AxiosError } from "axios";

import axiosClient from "@/api/axiosClient";
import { getDb } from "@/mocks/data/database";
import { delay } from "@/services/mock/delay";
import type { DiscussionComment } from "@/shared/types/domain";

export interface DiscussionInput {
  productId: string;
  content: string;
  parentId?: string;
}

export interface DiscussionAskResponse {
  question: DiscussionComment;
  answer: DiscussionComment;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? (error instanceof Error ? error.message : fallback);
};

export const discussionService = {
  async listAll(): Promise<DiscussionComment[]> {
    await delay(180);
    return getDb().discussions.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  },

  async listByProduct(productId: string): Promise<DiscussionComment[]> {
    try {
      const { data } = await axiosClient.get<DiscussionComment[]>(`/products/${productId}/discussions`);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Khong the tai thao luan cua san pham."));
    }
  },

  async create(input: DiscussionInput): Promise<DiscussionAskResponse> {
    try {
      const { data } = await axiosClient.post<DiscussionAskResponse>(`/products/${input.productId}/discussions`, {
        content: input.content,
      });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Khong the gui cau hoi thao luan."));
    }
  },
};
