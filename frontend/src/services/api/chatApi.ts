import type { AxiosError } from "axios";

import axiosClient from "@/api/axiosClient";

export interface ChatAskRequest {
  message: string;
}

export interface ChatAskResponse {
  sender: string;
  message: string;
  handledBy?: string;
}

export interface ChatHistoryMessageResponse {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  handledBy: "AI" | "STAFF";
}

export interface MyActiveSupportResponse {
  id: string;
  customerId: string;
  customerName: string;
  startDate: string;
  endDate?: string | null;
  contentLog: string;
  aiHandled: boolean;
}

const base = "/chat";

const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? (error instanceof Error ? error.message : fallback);
};

export const chatApi = {
  ask: async (payload: ChatAskRequest): Promise<ChatAskResponse> => {
    try {
      const { data } = await axiosClient.post<ChatAskResponse>(`${base}/ask`, payload);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Không thể lấy phản hồi từ AI."));
    }
  },

  escalate: async (): Promise<ChatAskResponse> => {
    try {
      const { data } = await axiosClient.post<ChatAskResponse>(`${base}/escalate`);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Không thể chuyển cho nhân viên hỗ trợ."));
    }
  },

  myActiveSupport: async (): Promise<MyActiveSupportResponse | null> => {
    try {
      const { data } = await axiosClient.get<MyActiveSupportResponse | null>(`${base}/support/my-active`);
      return data ?? null;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Không thể đồng bộ hỗ trợ trực tuyến."));
    }
  },

  history: async (): Promise<ChatHistoryMessageResponse[]> => {
    try {
      const { data } = await axiosClient.get<ChatHistoryMessageResponse[]>(`${base}/history`);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Không thể tải lịch sử trò chuyện."));
    }
  },
};
