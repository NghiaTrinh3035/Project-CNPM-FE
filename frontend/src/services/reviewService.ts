import { reviewApi } from "@/services/api/reviewApi";
import { getDb } from "@/mocks/data/database";
import { mapBackendReview } from "@/services/api/backendMappers";
import { delay } from "@/services/mock/delay";
import type { Review } from "@/shared/types/domain";

export interface ReviewRequest {
  customerId: string;
  productId: string;
  rating: number;
  comment: string;
}


export const reviewService = {
  async listByProduct(productId: string): Promise<Review[]> {
    try {
      const reviews = await reviewApi.listByProduct(productId);
      return reviews.map((review) => mapBackendReview(review));
    } catch {
      await delay(120);
      return getDb().reviews.filter((item) => item.productId === productId);
    }
  },

  async create(input: ReviewRequest) {
    try {
      const payload = {
        customerId: input.customerId,
        productId: input.productId,
        rating: input.rating,
        comment: input.comment,
      };
      const data = await reviewApi.createReview(payload);
      return mapBackendReview(data);
    } catch {
      await delay(180);
      const db = getDb();
      const review: Review = {
        id: `review-${Date.now()}`,
        customerId: input.customerId,
        productId: input.productId,
        rating: input.rating,
        comment: input.comment,
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
