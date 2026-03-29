import { getDb } from "@/mocks/data/database";
import { delay } from "@/services/mock/delay";
import type { Review } from "@/shared/types/domain";

export interface ReviewInput {
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  content: string;
}

export const reviewService = {
  async listByProduct(productId: string): Promise<Review[]> {
    await delay(180);
    return getDb().reviews.filter((item) => item.productId === productId);
  },

  async create(input: ReviewInput) {
    await delay(230);
    const db = getDb();
    const purchased = db.orders.some(
      (order) =>
        order.userId === input.userId &&
        ["DELIVERED", "COMPLETED"].includes(order.status) &&
        order.items.some((item) => item.productId === input.productId),
    );
    if (!purchased) {
      throw new Error("Bạn chỉ có thể đánh giá sau khi đã nhận hàng.");
    }
    const review: Review = {
      id: `r-${Date.now()}`,
      userId: input.userId,
      productId: input.productId,
      orderId: input.orderId,
      rating: input.rating,
      content: input.content,
      createdAt: new Date().toISOString(),
    };
    db.reviews.unshift(review);
    const product = db.products.find((item) => item.id === input.productId);
    if (product) {
      const related = db.reviews.filter((item) => item.productId === input.productId);
      const avg = related.reduce((sum, item) => sum + item.rating, 0) / related.length;
      product.rating = Number(avg.toFixed(1));
      product.reviewCount = related.length;
    }
    return structuredClone(review);
  },
};
