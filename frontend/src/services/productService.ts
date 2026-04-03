import axiosClient from "@/api/axiosClient";
import { getDb } from "@/mocks/data/database";
import { productApi } from "@/services/api/productApi";
import { mapBackendCategory, mapBackendProduct, unwrapPage } from "@/services/api/backendMappers";
import { delay } from "@/services/mock/delay";
import type { Product, ProductImage } from "@/shared/types/domain";

export interface ProductCreateRequest {
  brand: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  movementType: string;
  glassMaterial: string;
  faceSize: string;
  wireMaterial: string;
  waterResistance: string;
  faceColor: string;
  wireColor: string;
  caseColor: string;
  color: string;
  size: string;
  specs: string;
}

export interface ProductImageUploadPayload {
  file: File;
  altText?: string;
  isPrimary?: boolean;
}

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
    productApi.getProducts(),
    axiosClient.get<unknown>("/categories"),
  ]);
  const categories = unwrapPage<Record<string, unknown>>(categoriesResponse.data).map((item) =>
    mapBackendCategory(item),
  );
  const categoryMap = new Map(categories.map((item) => [item.id, item]));

  const mappedProducts = unwrapPage<Record<string, unknown>>(productsResponse).map((item) => {
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

type ApiProductImage = {
  id?: string;
  imageUrl?: string;
  url?: string;
  altText?: string;
  alt?: string;
  isThumbnail?: boolean;
  isPrimary?: boolean;
};

const mapProductImage = (input: ApiProductImage): ProductImage => ({
  id: String(input.id ?? `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`),
  url: String(input.imageUrl ?? input.url ?? ""),
  alt: String(input.altText ?? input.alt ?? ""),
  isPrimary: Boolean(input.isThumbnail ?? input.isPrimary),
});

const ensurePrimaryImage = (images: ProductImage[]) => {
  if (!images.length) {
    return images;
  }
  if (images.some((image) => image.isPrimary)) {
    return images;
  }
  return images.map((image, index) => ({ ...image, isPrimary: index === 0 }));
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

  async getById(id: string): Promise<Product | null> {
    try {
      const data = await productApi.getProductById(id);
      return mapBackendProduct(data as unknown as Record<string, unknown>);
    } catch {
      const products = await fetchProductsSafe();
      return products.find((product) => product.id === id) ?? null;
    }
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
  
  async createProduct(payload: ProductCreateRequest): Promise<Product> {
    try {
      const data = await productApi.createProduct(payload);
      return mapBackendProduct(data as unknown as Record<string, unknown>);
    } catch {
      throw new Error("Tạo sản phẩm thất bại.");
    }
  },


  async getProductImages(productId: string): Promise<ProductImage[]> {
    try {
      const data = await productApi.getImages(productId);
      if (!Array.isArray(data)) {
        return [];
      }
      return ensurePrimaryImage(data.map((item) => mapProductImage(item)));
    } catch {
      await delay(100);
      const product = getDb().products.find((item) => item.id === productId);
      if (!product) {
        throw new Error("Không tìm thấy sản phẩm để tải ảnh.");
      }
      return structuredClone(ensurePrimaryImage(product.images ?? []));
    }
  },

  async uploadProductImage(productId: string, payload: ProductImageUploadPayload): Promise<ProductImage> {
    try {
      const data = await productApi.uploadImage(productId, {
        file: payload.file,
        altText: payload.altText,
        isThumbnail: Boolean(payload.isPrimary),
      });
      if (!data || typeof data !== "object") {
        throw new Error("Upload ảnh thất bại.");
      }
      return mapProductImage(data);
    } catch {
      await delay(120);
      const db = getDb();
      const product = db.products.find((item) => item.id === productId);
      if (!product) {
        throw new Error("Không tìm thấy sản phẩm để upload ảnh.");
      }

      const image: ProductImage = {
        id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        url: `https://placehold.co/1000x1000?text=${encodeURIComponent(payload.file.name || "product")}`,
        alt: payload.altText?.trim() || payload.file.name || "product image",
        isPrimary: Boolean(payload.isPrimary),
      };

      const currentImages = product.images ?? [];
      const nextImages = image.isPrimary
        ? currentImages.map((item) => ({ ...item, isPrimary: false }))
        : currentImages;
      product.images = ensurePrimaryImage([image, ...nextImages]);
      return structuredClone(image);
    }
  },

  async deleteProductImage(productId: string, imageId: string): Promise<void> {
    try {
      await productApi.deleteImage(productId, imageId);
    } catch {
      await delay(100);
      const db = getDb();
      const product = db.products.find((item) => item.id === productId);
      if (!product) {
        throw new Error("Không tìm thấy sản phẩm để xóa ảnh.");
      }
      const remaining = ensurePrimaryImage((product.images ?? []).filter((image) => image.id !== imageId));
      product.images = remaining;
    }
  },

  async compareProducts(productAId: string, productBId: string): Promise<Product[]> {
    try {
      const data = await productApi.compare(productAId, productBId);
      if (!Array.isArray(data)) {
        throw new Error("So sánh sản phẩm thất bại.");
      }
      return data.map((item) => mapBackendProduct(item as unknown as Record<string, unknown>));
    }
    catch {
      const products = await fetchProductsSafe();
      const productA = products.find((item) => item.id === productAId);
      const productB = products.find((item) => item.id === productBId);
      if (!productA || !productB) {
        throw new Error("Không tìm thấy sản phẩm để so sánh.");
      }
      return [productA, productB];
    }
  },
};

