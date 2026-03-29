import type { AiAssistantAdapter, AiChatMessage, AiContext } from "@/services/adapters/aiAdapter";

const makeMessage = (
  content: string,
  options?: Partial<Pick<AiChatMessage, "recommendedProductIds" | "handledBy">>,
): AiChatMessage => ({
  id: crypto.randomUUID(),
  role: "assistant",
  content,
  createdAt: new Date().toISOString(),
  handledBy: options?.handledBy ?? "AI",
  recommendedProductIds: options?.recommendedProductIds,
});

export class RuleBasedAiAdapter implements AiAssistantAdapter {
  private readonly context: AiContext;

  constructor(context: AiContext) {
    this.context = context;
  }

  async reply(input: string): Promise<AiChatMessage> {
    const normalized = input.toLowerCase();
    const products = this.context.products;

    const byPriceUnder5m = products.filter((p) => (p.salePrice ?? p.price) <= 5_000_000).slice(0, 3);
    const metalStrap = products.filter((p) => p.strapMaterial.toLowerCase().includes("steel")).slice(0, 3);
    const highWater = products.filter((p) => /200m|300m/i.test(p.waterResistance)).slice(0, 3);
    const office = products.filter((p) => p.tags.some((tag) => /office|classic/i.test(tag))).slice(0, 3);
    const giftMale = products.filter((p) => p.gender !== "FEMALE").slice(0, 3);
    const giftFemale = products.filter((p) => p.gender !== "MALE").slice(0, 3);
    const automatic = products.filter((p) => /automatic|manual/i.test(p.movementType)).slice(0, 3);

    if (normalized.includes("dưới 5") || normalized.includes("duoi 5")) {
      return makeMessage(
        "Mình đề xuất một số mẫu phù hợp ngân sách dưới 5 triệu. Nếu bạn muốn, mình sẽ lọc thêm theo kiểu dây hoặc màu mặt.",
        { recommendedProductIds: byPriceUnder5m.map((p) => p.id) },
      );
    }

    if (normalized.includes("kim loại") || normalized.includes("kim loai")) {
      return makeMessage("Đây là các mẫu dây kim loại được khách chọn nhiều cho đi làm và đi tiệc:", {
        recommendedProductIds: metalStrap.map((p) => p.id),
      });
    }

    if (normalized.includes("chống nước") || normalized.includes("chong nuoc")) {
      return makeMessage("Các mẫu chống nước tốt mình gợi ý (200m trở lên):", {
        recommendedProductIds: highWater.map((p) => p.id),
      });
    }

    if (normalized.includes("đi làm") || normalized.includes("di lam")) {
      return makeMessage("Bạn có thể tham khảo các mẫu thanh lịch, đeo suit hoặc sơ mi đều đẹp:", {
        recommendedProductIds: office.map((p) => p.id),
      });
    }

    if (normalized.includes("quà") || normalized.includes("qua")) {
      const selected = normalized.includes("nữ") || normalized.includes("nu") ? giftFemale : giftMale;
      return makeMessage("Mình đã chọn danh sách quà tặng phù hợp, cân bằng giữa thiết kế và giá trị thương hiệu:", {
        recommendedProductIds: selected.map((p) => p.id),
      });
    }

    if (normalized.includes("máy cơ") || normalized.includes("may co") || normalized.includes("automatic")) {
      return makeMessage("Đây là các mẫu máy cơ được đánh giá cao về độ hoàn thiện và trải nghiệm đeo:", {
        recommendedProductIds: automatic.map((p) => p.id),
      });
    }

    return makeMessage(
      "Mình có thể giúp bạn chọn theo ngân sách, mục đích sử dụng, chất liệu dây, khả năng chống nước hoặc phong cách. Bạn muốn mình lọc theo tiêu chí nào trước?",
      { recommendedProductIds: products.slice(0, 3).map((p) => p.id) },
    );
  }

  async escalateToStaff(): Promise<AiChatMessage> {
    return makeMessage(
      "Mình đã chuyển cuộc trò chuyện cho nhân viên tư vấn. Bạn vui lòng để lại số điện thoại hoặc tiếp tục chat để được hỗ trợ nhanh nhất.",
      { handledBy: "STAFF" },
    );
  }
}
