import axiosClient from "@/api/axiosClient";
import { getDb } from "@/mocks/data/database";
import { mapBackendCategory, mapBackendProduct, unwrapPage } from "@/services/api/backendMappers";
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
      return [...products].sort(
        (a, b) => (Date.parse(b.updatedAt ?? b.createdAt ?? "") || 0) - (Date.parse(a.updatedAt ?? a.createdAt ?? "") || 0),
      );
  }
};

const markCollections = (products: Product[]) => {
  const byRating = [...products]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .map((item) => item.id);
  const byNewest = [...products]
    .sort((a, b) => (Date.parse(b.updatedAt ?? b.createdAt ?? "") || 0) - (Date.parse(a.updatedAt ?? a.createdAt ?? "") || 0))
    .map((item) => item.id);

  const featured = new Set(byRating.slice(0, 8));
  const bestSeller = new Set(byRating.slice(0, 8));
  const newcomer = new Set(byNewest.slice(0, 8));

  return products.map((product) => ({
    ...product,
    isFeatured: featured.has(product.id),
    isBestSeller: bestSeller.has(product.id),
    isNewArrival: newcomer.has(product.id),
  }));
};

const fetchProductsFromApi = async (): Promise<Product[]> => {
  const [productsResponse, categoriesResponse] = await Promise.all([
    axiosClient.get<unknown>("/products"),
    axiosClient.get<unknown>("/categories"),
  ]);
  const categories = unwrapPage<Record<string, unknown>>(categoriesResponse.data).map((item) =>
    mapBackendCategory(item),
  );
  const categoryMap = new Map(categories.map((item) => [item.id, item]));

  const mappedProducts = unwrapPage<Record<string, unknown>>(productsResponse.data).map((item) => {
    const product = mapBackendProduct(item);
    const rawCategory = item["category"] as Record<string, unknown> | undefined;
    const rawCategoryId = (rawCategory?.id as string | undefined) ?? (item["categoryId"] as string | undefined);
    if (rawCategoryId && categoryMap.has(rawCategoryId)) {
      product.category = categoryMap.get(rawCategoryId)!;
    }
    return product;
  });

  return markCollections(mappedProducts);
};

const fetchProductsSafe = async (): Promise<Product[]> => {
  try {
    return await fetchProductsFromApi();
  } catch {
    await delay(120);
    return getDb().products;
  }
};

export const productService = {
  async getAll(params: ProductQueryInput = {}): Promise<ProductQueryResult> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 9;
    const keyword = params.keyword ? params.keyword.trim().toLowerCase() : "";
    const movementFilter = params.movementType ? params.movementType.toLowerCase() : "";
    const waterFilter = params.waterResistance ? params.waterResistance.toLowerCase() : "";
    const strapFilter = params.strapMaterial ? params.strapMaterial.toLowerCase() : "";

    const allProducts = await fetchProductsSafe();
    const filtered = allProducts.filter((product) => {
      if (keyword) {
        const searchable = `${product.name ?? ""} ${product.brand ?? ""} ${product.description ?? ""} ${(product.tags ?? []).join(" ")}`;
        if (!searchable.toLowerCase().includes(keyword)) {
          return false;
        }
      }
      if (params.brand && product.brand !== params.brand) {
        return false;
      }
      if (params.category && product.category.slug !== params.category) {
        return false;
      }
      if (movementFilter && !(product.movementType ?? "").toLowerCase().includes(movementFilter)) {
        return false;
      }
      if (waterFilter && !(product.waterResistance ?? "").toLowerCase().includes(waterFilter)) {
        return false;
      }
      if (strapFilter && !(product.strapMaterial ?? "").toLowerCase().includes(strapFilter)) {
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
    const products = await fetchProductsSafe();
    return (
      products.find((product) => {
        if (product.slug === slug) {
          return true;
        }
        if (product.id === slug) {
          return true;
        }
        return slug.endsWith(product.id.slice(0, 8));
      }) ?? null
    );
  },

  async getByIds(ids: string[]): Promise<Product[]> {
    if (!ids.length) {
      return [];
    }
    const set = new Set(ids);
    const products = await fetchProductsSafe();
    return products.filter((product) => set.has(product.id));
  },

  async getFeatured(): Promise<Product[]> {
    const products = await fetchProductsSafe();
    return products.filter((product) => product.isFeatured).slice(0, 8);
  },

  async getBestSellers(): Promise<Product[]> {
    const products = await fetchProductsSafe();
    return products.filter((product) => product.isBestSeller).slice(0, 8);
  },

  async getNewArrivals(): Promise<Product[]> {
    const products = await fetchProductsSafe();
    return products.filter((product) => product.isNewArrival).slice(0, 8);
  },

  async getFilters() {
    const all = await fetchProductsSafe();
    return {
      brands: Array.from(new Set(all.map((product) => product.brand).filter(Boolean))),
      movementTypes: Array.from(new Set(all.map((product) => product.movementType).filter(Boolean))),
      waterResistanceLevels: Array.from(new Set(all.map((product) => product.waterResistance).filter(Boolean))),
      strapMaterials: Array.from(new Set(all.map((product) => product.strapMaterial).filter(Boolean))),
      categories: Array.from(new Set(all.map((product) => product.category.slug))).map((slug) =>
        all.find((item) => item.category.slug === slug)?.category,
      ),
    };
  },
};
