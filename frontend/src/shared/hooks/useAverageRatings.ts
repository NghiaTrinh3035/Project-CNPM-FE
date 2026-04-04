import { useQuery } from "@tanstack/react-query";

import { reviewApi } from "@/services/api/reviewApi";

const normalizeProductIds = (productIds: string[]) => Array.from(new Set(productIds.filter(Boolean))).sort();

const fetchAverageRatings = async (productIds: string[]) => {
  const entries = await Promise.all(
    productIds.map(async (productId) => {
      try {
        return [productId, await reviewApi.getAverageRating(productId)] as const;
      } catch {
        return [productId, 0] as const;
      }
    }),
  );

  return Object.fromEntries(entries) as Record<string, number>;
};

export const useAverageRatings = (productIds: string[]) => {
  const normalizedProductIds = normalizeProductIds(productIds);

  return useQuery({
    queryKey: ["reviews", "average-ratings", normalizedProductIds],
    queryFn: () => fetchAverageRatings(normalizedProductIds),
    enabled: normalizedProductIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};