import { getDb } from "@/mocks/data/database";
import { delay } from "@/services/mock/delay";
import type { DiscussionComment } from "@/shared/types/domain";

export interface DiscussionInput {
  productId: string;
  userId: string;
  content: string;
  parentId?: string;
  aiHandled?: boolean;
}

export const discussionService = {
  async listAll(): Promise<DiscussionComment[]> {
    await delay(180);
    return getDb().discussions.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  },

  async listByProduct(productId: string): Promise<DiscussionComment[]> {
    await delay(180);
    return getDb()
      .discussions.filter((item) => item.productId === productId)
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  },

  async create(input: DiscussionInput) {
    await delay(200);
    const db = getDb();
    const comment: DiscussionComment = {
      id: `d-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...input,
    };
    db.discussions.push(comment);
    return structuredClone(comment);
  },
};
