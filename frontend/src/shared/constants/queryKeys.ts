export const queryKeys = {
  products: ["products"] as const,
  productBySlug: (slug: string) => ["products", slug] as const,
  orders: (userId?: string) => ["orders", userId ?? "all"] as const,
  notifications: (userId?: string) => ["notifications", userId ?? "guest"] as const,
  warranties: ["warranties"] as const,
  suppliers: ["suppliers"] as const,
  vouchers: ["vouchers"] as const,
  reports: ["reports"] as const,
};
