import type { AiChatMessage } from "@/services/adapters/aiAdapter";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_SESSION_KEY = "guest";

type AiChatStatus = "AI_HANDLED" | "ESCALATED_TO_STAFF";

interface AiChatSnapshot {
  status: AiChatStatus;
  messages: AiChatMessage[];
}

interface AiChatState {
  isOpen: boolean;
  status: AiChatStatus;
  messages: AiChatMessage[];
  activeSessionKey: string;
  sessions: Record<string, AiChatSnapshot>;
  toggle: () => void;
  close: () => void;
  pushMessage: (message: AiChatMessage) => void;
  setMessages: (messages: AiChatMessage[]) => void;
  resetConversation: () => void;
  setStatus: (status: AiChatStatus) => void;
  hydrateSession: (sessionKey: string) => void;
}

const createWelcomeMessage = (): AiChatMessage => ({
  id: "welcome-ai",
  role: "assistant",
  content:
    "Xin chào, mình là ChronoLux AI. Mình có thể giúp bạn chọn đồng hồ theo ngân sách, phong cách hoặc mục đích sử dụng.",
  createdAt: new Date().toISOString(),
  handledBy: "AI",
});

const withFallbackWelcome = (messages: AiChatMessage[]): AiChatMessage[] => {
  if (messages.length > 0) {
    return messages;
  }
  return [createWelcomeMessage()];
};

const createDefaultSnapshot = (): AiChatSnapshot => ({
  status: "AI_HANDLED",
  messages: [createWelcomeMessage()],
});

export const useAiChatStore = create<AiChatState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      status: "AI_HANDLED",
      messages: [createWelcomeMessage()],
      activeSessionKey: DEFAULT_SESSION_KEY,
      sessions: {
        [DEFAULT_SESSION_KEY]: createDefaultSnapshot(),
      },
      toggle: () => set({ isOpen: !get().isOpen }),
      close: () => set({ isOpen: false }),
      pushMessage: (message) =>
        set((state) => {
          const nextMessages = [...state.messages, message];
          return {
            messages: nextMessages,
            sessions: {
              ...state.sessions,
              [state.activeSessionKey]: {
                status: state.status,
                messages: nextMessages,
              },
            },
          };
        }),
      setMessages: (messages) =>
        set((state) => {
          const nextMessages = withFallbackWelcome(messages);
          return {
            messages: nextMessages,
            sessions: {
              ...state.sessions,
              [state.activeSessionKey]: {
                status: state.status,
                messages: nextMessages,
              },
            },
          };
        }),
      resetConversation: () =>
        set((state) => {
          const nextSnapshot = createDefaultSnapshot();
          return {
            status: nextSnapshot.status,
            messages: nextSnapshot.messages,
            sessions: {
              ...state.sessions,
              [state.activeSessionKey]: nextSnapshot,
            },
          };
        }),
      setStatus: (status) =>
        set((state) => ({
          status,
          sessions: {
            ...state.sessions,
            [state.activeSessionKey]: {
              status,
              messages: state.messages,
            },
          },
        })),
      hydrateSession: (sessionKey) =>
        set((state) => {
          const key = sessionKey || DEFAULT_SESSION_KEY;
          const snapshot = state.sessions[key] ?? createDefaultSnapshot();
          const nextMessages = withFallbackWelcome(snapshot.messages);
          return {
            activeSessionKey: key,
            status: snapshot.status,
            messages: nextMessages,
            sessions: {
              ...state.sessions,
              [key]: {
                status: snapshot.status,
                messages: nextMessages,
              },
            },
          };
        }),
    }),
    {
      name: "chrono-ai-chat-store",
      partialize: (state) => ({
        activeSessionKey: state.activeSessionKey,
        sessions: state.sessions,
      }),
    },
  ),
);
