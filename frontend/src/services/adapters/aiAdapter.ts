import type { Product } from "@/shared/types/domain";

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  recommendedProductIds?: string[];
  handledBy: "AI" | "STAFF";
}

export interface AiAssistantAdapter {
  reply(input: string): Promise<AiChatMessage>;
  escalateToStaff(): Promise<AiChatMessage>;
}

export interface AiContext {
  products: Product[];
}
