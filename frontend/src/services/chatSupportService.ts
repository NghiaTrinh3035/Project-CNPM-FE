import type { AxiosError } from "axios";

import axiosClient from "@/api/axiosClient";

export interface SupportChat {
  id: string;
  customerId: string;
  customerName: string;
  startDate: string;
  endDate?: string | null;
  contentLog: string;
  aiHandled: boolean;
}

export interface SupportChatsPage {
  items: SupportChat[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type SupportChatStatus = "OPEN" | "CLOSED" | "ALL";

const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? (error instanceof Error ? error.message : fallback);
};

export const chatSupportService = {
  async listAll(params: {
    page: number;
    pageSize: number;
    status: SupportChatStatus;
  }): Promise<SupportChatsPage> {
    try {
      const { data } = await axiosClient.get<SupportChatsPage>("/chat/support/all", {
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

  async listPending(): Promise<SupportChat[]> {
    try {
      const { data } = await axiosClient.get<SupportChat[]>("/chat/support/pending");
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Không thể tải danh sách hỗ trợ."));
    }
  },

  async reply(chatId: string, message: string): Promise<void> {
    try {
      await axiosClient.post(`/chat/support/${chatId}/reply`, { message });
    } catch (error) {
      throw new Error(getErrorMessage(error, "Không thể gửi phản hồi."));
    }
  },

  async close(chatId: string): Promise<void> {
    try {
      await axiosClient.post(`/chat/support/${chatId}/close`);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Không thể đóng phiên hỗ trợ."));
    }
  },
};
