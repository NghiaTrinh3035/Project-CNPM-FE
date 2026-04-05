import axios, { type AxiosError } from "axios";

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

export interface DiscussionPageResponse {
  items: DiscussionComment[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
    return "AI đang trả lời chậm hơn dự kiến. Vui lòng chờ thêm và thử gửi lại nếu cần.";
  }

  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? (error instanceof Error ? error.message : fallback);
};

const DISCUSSION_CREATE_TIMEOUT_MS = 60_000;

export const discussionService = {
  async listAll(): Promise<DiscussionComment[]> {
    await delay(180);
    return getDb().discussions.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  },

  async listByProduct(
    productId: string,
    params: { page?: number; pageSize?: number } = {},
  ): Promise<DiscussionPageResponse> {
    try {
      const { data } = await axiosClient.get<DiscussionPageResponse>(`/products/${productId}/discussions`, {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 10,
        },
      });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Khong the tai thao luan cua san pham."));
    }
  },

  async create(input: DiscussionInput): Promise<DiscussionAskResponse> {
    try {
      const { data } = await axiosClient.post<DiscussionAskResponse>(`/products/${input.productId}/discussions`, {
        content: input.content,
      }, {
        timeout: DISCUSSION_CREATE_TIMEOUT_MS,
      });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Khong the gui cau hoi thao luan."));
    }
  },
};
