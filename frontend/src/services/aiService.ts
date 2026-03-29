import { getDb } from "@/mocks/data/database";
import { RuleBasedAiAdapter } from "@/services/adapters/ruleBasedAiAdapter";

export const aiService = new RuleBasedAiAdapter({
  products: getDb().products,
});
