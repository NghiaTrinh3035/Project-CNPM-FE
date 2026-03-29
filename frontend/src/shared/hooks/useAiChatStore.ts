import type { AiChatMessage } from "@/services/adapters/aiAdapter";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AiChatState {
  isOpen: boolean;
  status: "AI_HANDLED" | "ESCALATED_TO_STAFF";
  messages: AiChatMessage[];
  toggle: () => void;
  close: () => void;
  pushMessage: (message: AiChatMessage) => void;
  setStatus: (status: AiChatState["status"]) => void;
  clearHistory: () => void;
}

export const useAiChatStore = create<AiChatState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      status: "AI_HANDLED",
      messages: [
        {
          id: "welcome-ai",
          role: "assistant",
          content:
            "Xin chào, mình là ChronoLux AI. Mình có thể giúp bạn chọn đồng hồ theo ngân sách, phong cách hoặc mục đích sử dụng.",
          createdAt: new Date().toISOString(),
          handledBy: "AI",
        },
      ],
      toggle: () => set({ isOpen: !get().isOpen }),
      close: () => set({ isOpen: false }),
      pushMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      setStatus: (status) => set({ status }),
      clearHistory: () =>
        set({
          status: "AI_HANDLED",
          messages: [
            {
              id: "welcome-ai-reset",
              role: "assistant",
              content:
                "Lịch sử trò chuyện đã được làm mới. Bạn muốn mình tư vấn theo tiêu chí nào trước?",
              createdAt: new Date().toISOString(),
              handledBy: "AI",
            },
          ],
        }),
    }),
    {
      name: "chrono-ai-chat",
    },
  ),
);
