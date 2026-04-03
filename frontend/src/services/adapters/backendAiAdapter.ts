import { chatApi } from "@/services/api/chatApi";
import type { AiAssistantAdapter, AiChatMessage } from "@/services/adapters/aiAdapter";

const makeAssistantMessage = (
  content: string,
  options?: Partial<Pick<AiChatMessage, "handledBy" | "recommendedProductIds">>,
): AiChatMessage => ({
  id: crypto.randomUUID(),
  role: "assistant",
  content,
  createdAt: new Date().toISOString(),
  handledBy: options?.handledBy ?? "AI",
  recommendedProductIds: options?.recommendedProductIds,
});

export class BackendAiAdapter implements AiAssistantAdapter {
  async reply(input: string): Promise<AiChatMessage> {
    const response = await chatApi.ask({ message: input });
    return makeAssistantMessage(response.message, {
      handledBy: response.handledBy === "STAFF" ? "STAFF" : "AI",
    });
  }

  async escalateToStaff(): Promise<AiChatMessage> {
    return makeAssistantMessage(
      "Mình đã chuyển cuộc trò chuyện cho nhân viên tư vấn. Bạn vui lòng để lại số điện thoại hoặc tiếp tục chat để được hỗ trợ nhanh nhất.",
      { handledBy: "STAFF" },
    );
  }
}

