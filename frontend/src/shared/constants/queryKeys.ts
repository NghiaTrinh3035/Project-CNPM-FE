export const queryKeys = {
  products: ["products"] as const,
  productById: (productId: string) => ["products", productId] as const,
  orders: (userId?: string) => ["orders", userId ?? "all"] as const,
  notifications: (userId?: string) => ["notifications", userId ?? "guest"] as const,
  warranties: ["warranties"] as const,
  suppliers: ["suppliers"] as const,
  vouchers: ["vouchers"] as const,
  reports: ["reports"] as const,
};
