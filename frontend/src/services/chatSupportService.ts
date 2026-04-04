import type { AxiosError } from "axios";

import axiosClient from "@/api/axiosClient";

export interface SupportDiscussion {
  id: string;
  customerId: string;
  customerName: string;
  startDate: string;
  endDate?: string | null;
  contentLog: string;
  aiHandled: boolean;
}

export interface SupportDiscussionsPage {
  items: SupportDiscussion[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type SupportDiscussionStatus = "OPEN" | "CLOSED" | "ALL";

const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? (error instanceof Error ? error.message : fallback);
};

export const chatSupportService = {
  async listAll(params: {
    page: number;
    pageSize: number;
    status: SupportDiscussionStatus;
  }): Promise<SupportDiscussionsPage> {
    try {
      const { data } = await axiosClient.get<SupportDiscussionsPage>("/chat/support/all", {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          status: params.status,
        },
      });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Không thể tải lịch sử hỗ trợ."));
    }
  },

  async listPending(): Promise<SupportDiscussion[]> {
    try {
      const { data } = await axiosClient.get<SupportDiscussion[]>("/chat/support/pending");
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Không thể tải danh sách hỗ trợ."));
    }
  },

  async reply(discussionId: string, message: string): Promise<void> {
    try {
      await axiosClient.post(`/chat/support/${discussionId}/reply`, { message });
    } catch (error) {
      throw new Error(getErrorMessage(error, "Không thể gửi phản hồi."));
    }
  },

  async close(discussionId: string): Promise<void> {
    try {
      await axiosClient.post(`/chat/support/${discussionId}/close`);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Không thể đóng phiên hỗ trợ."));
    }
  },
};
