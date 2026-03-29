import { getDb } from "@/mocks/data/database";
import { delay } from "@/services/mock/delay";
import type { StaticPageContent } from "@/shared/types/domain";

export const contentService = {
  async getPage(id: StaticPageContent["id"]) {
    await delay(140);
    return getDb().staticPages.find((item) => item.id === id) ?? null;
  },
};
