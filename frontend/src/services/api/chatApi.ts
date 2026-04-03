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
};

