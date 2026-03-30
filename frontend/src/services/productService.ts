import { getDb } from "@/mocks/data/database";
import { delay } from "@/services/mock/delay";
import type { Product } from "@/shared/types/domain";

export interface ProductQueryInput {
  keyword?: string;
  brand?: string;
  category?: string;
  movementType?: string;
  waterResistance?: string;
  strapMaterial?: string;
  stockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "latest" | "price-asc" | "price-desc" | "best-seller" | "top-rated";
  page?: number;
  pageSize?: number;
}

export interface ProductQueryResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const effectivePrice = (product: Product) => product.salePrice ?? product.price;

const sortProducts = (products: Product[], sortBy: ProductQueryInput["sortBy"]) => {
  switch (sortBy) {
    case "price-asc":
      return [...products].sort((a, b) => effectivePrice(a) - effectivePrice(b));
    case "price-desc":
      return [...products].sort((a, b) => effectivePrice(b) - effectivePrice(a));
    case "best-seller":
      return [...products].sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
    case "top-rated":
      return [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "latest":
    default:
      return [...products].sort((a, b) => (Date.parse(b.createdAt ?? "") || 0) - (Date.parse(a.createdAt ?? "") || 0));
  }
};

export const productService = {
  async getAll(params: ProductQueryInput = {}): Promise<ProductQueryResult> {
    await delay(450);
    const db = getDb();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 9;
    const keyword = params.keyword ? params.keyword.trim().toLowerCase() : "";

      const movementFilter = params.movementType ? params.movementType.toLowerCase() : "";
      const waterFilter = params.waterResistance ? params.waterResistance.toLowerCase() : "";
      const strapFilter = params.strapMaterial ? params.strapMaterial.toLowerCase() : "";

      const filtered = db.products.filter((product) => {
      if (keyword) {
        const searchable = `${product.name ?? ""} ${product.brand ?? ""} ${product.description ?? ""} ${(product.tags ?? []).join(" ")}`;
        if (!searchable.toLowerCase().includes(keyword as string)) {
          return false;
        }
      }
      if (params.brand && product.brand !== params.brand) {
        return false;
      }
      if (params.category && product.category.slug !== params.category) {
        return false;
      }
      if (movementFilter && !(product.movementType ?? "").toLowerCase().includes(movementFilter as string)) {
        return false;
      }
      if (waterFilter && !(product.waterResistance ?? "").toLowerCase().includes(waterFilter as string)) {
        return false;
      }
      if (strapFilter && !(product.strapMaterial ?? "").toLowerCase().includes(strapFilter as string)) {
        return false;
      }
      if (params.stockOnly && product.stockQuantity <= 0) {
        return false;
      }
      if (params.minPrice !== undefined && effectivePrice(product) < params.minPrice) {
        return false;
      }
      if (params.maxPrice !== undefined && effectivePrice(product) > params.maxPrice) {
        return false;
      }
      return true;
    });

    const sorted = sortProducts(filtered, params.sortBy);
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const items = sorted.slice(start, start + pageSize);

    return { items, total, page, pageSize, totalPages };
  },

  async getBySlug(slug: string): Promise<Product | null> {
    await delay(300);
    return getDb().products.find((product) => product.slug === slug) ?? null;
  },

  async getByIds(ids: string[]): Promise<Product[]> {
    await delay(220);
    const set = new Set(ids);
    return getDb().products.filter((product) => set.has(product.id));
  },

  async getFeatured(): Promise<Product[]> {
    await delay(220);
    return getDb().products.filter((product) => product.isFeatured).slice(0, 8);
  },

  async getBestSellers(): Promise<Product[]> {
    await delay(220);
    return getDb().products.filter((product) => product.isBestSeller).slice(0, 8);
  },

  async getNewArrivals(): Promise<Product[]> {
    await delay(220);
    return getDb().products.filter((product) => product.isNewArrival).slice(0, 8);
  },

  async getFilters() {
    await delay(120);
    const all = getDb().products;
    return {
      brands: Array.from(new Set(all.map((product) => product.brand))),
      movementTypes: Array.from(new Set(all.map((product) => product.movementType))),
      waterResistanceLevels: Array.from(new Set(all.map((product) => product.waterResistance))),
      strapMaterials: Array.from(new Set(all.map((product) => product.strapMaterial))),
      categories: Array.from(new Set(all.map((product) => product.category.slug))).map((slug) =>
        all.find((item) => item.category.slug === slug)?.category,
      ),
    };
  },
};
