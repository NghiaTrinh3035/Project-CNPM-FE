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

const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? (error instanceof Error ? error.message : fallback);
};

export const chatSupportService = {
  async listAll(): Promise<SupportDiscussion[]> {
    try {
      const { data } = await axiosClient.get<SupportDiscussion[]>("/chat/support/all");
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
