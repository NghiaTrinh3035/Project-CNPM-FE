import axiosClient from "@/api/axiosClient";
import { getDb } from "@/mocks/data/database";
import { mapBackendReview, unwrapPage } from "@/services/api/backendMappers";
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
    try {
      const { data } = await axiosClient.get(`/reviews/product/${productId}`);
      return unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendReview(item));
    } catch {
      await delay(120);
      return getDb().reviews.filter((item) => item.productId === productId);
    }
  },

  async create(input: ReviewInput) {
    try {
      const payload = {
        customerId: input.userId,
        productId: input.productId,
        rating: input.rating,
        comment: input.content,
      };
      const { data } = await axiosClient.post("/reviews", payload);
      return mapBackendReview(data);
    } catch {
      await delay(180);
      const db = getDb();
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
    }
  },
};
