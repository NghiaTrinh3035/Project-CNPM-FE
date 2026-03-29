import { describe, expect, it } from "vitest";

import { getDb } from "@/mocks/data/database";
import { RuleBasedAiAdapter } from "@/services/adapters/ruleBasedAiAdapter";

describe("RuleBasedAiAdapter", () => {
  it("gợi ý sản phẩm chống nước khi người dùng hỏi chống nước", async () => {
    const adapter = new RuleBasedAiAdapter({ products: getDb().products });
    const message = await adapter.reply("Tôi cần đồng hồ chống nước tốt");
    expect(message.recommendedProductIds?.length).toBeGreaterThan(0);
    expect(message.content).toContain("chống nước");
  });

  it("hỗ trợ escalated sang staff", async () => {
    const adapter = new RuleBasedAiAdapter({ products: getDb().products });
    const message = await adapter.escalateToStaff();
    expect(message.handledBy).toBe("STAFF");
  });
});
