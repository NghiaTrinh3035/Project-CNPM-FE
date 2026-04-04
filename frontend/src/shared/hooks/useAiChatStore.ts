import type { AiChatMessage } from "@/services/adapters/aiAdapter";
import { create } from "zustand";

interface AiChatState {
  isOpen: boolean;
  status: "AI_HANDLED" | "ESCALATED_TO_STAFF";
  messages: AiChatMessage[];
  toggle: () => void;
  close: () => void;
  pushMessage: (message: AiChatMessage) => void;
  setMessages: (messages: AiChatMessage[]) => void;
  resetConversation: () => void;
  setStatus: (status: AiChatState["status"]) => void;
}

const createWelcomeMessage = (): AiChatMessage => ({
  id: "welcome-ai",
  role: "assistant",
  content:
    "Xin chào, mình là ChronoLux AI. Minh có thể giúp bạn chọn đồng hồ theo ngân sách, phong cách hoặc mục đích sử dụng.",
  createdAt: new Date().toISOString(),
  handledBy: "AI",
});

const withFallbackWelcome = (messages: AiChatMessage[]): AiChatMessage[] => {
  if (messages.length > 0) {
    return messages;
  }
  return [createWelcomeMessage()];
};

export const useAiChatStore = create<AiChatState>()((set, get) => ({
  isOpen: false,
  status: "AI_HANDLED",
  messages: [createWelcomeMessage()],
  toggle: () => set({ isOpen: !get().isOpen }),
  close: () => set({ isOpen: false }),
  pushMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setMessages: (messages) =>
    set({
      messages: withFallbackWelcome(messages),
    }),
  resetConversation: () =>
    set({
      status: "AI_HANDLED",
      messages: [createWelcomeMessage()],
    }),
  setStatus: (status) => set({ status }),
}));
