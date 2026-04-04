import axios from "axios";
import axiosClient from "@/api/axiosClient";
import type {
  WarrantyAdminItem,
  WarrantyCreatePayload,
  WarrantyListParams,
  WarrantyListResult,
  WarrantyStatusUpdatePayload,
} from "@/features/warranty/types/warrantyAdmin";
import { getDb } from "@/mocks/data/database";
import { warrantyApi } from "@/services/api/warrantyApi";
import { productApi, type ProductCreateRequest, type ProductUpdateRequest } from "@/services/api/productApi";
import { mapBackendCategory, mapBackendProduct, mapBackendSupplier, mapBackendUser, mapBackendVoucher, unwrapPage } from "@/services/api/backendMappers";
import { orderService } from "@/services/orderService";
import { productService } from "@/services/productService";
import { delay } from "@/services/mock/delay";
import type {
  Category,
  Product,
  ProductStatus,
  RevenueReport,
  StaticPageContent,
  Supplier,
  User,
  Voucher,
  VoucherStatus,
} from "@/shared/types/domain";

export interface OwnerOverview {
  revenue: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockProducts: Product[];
  warrantyCount: number;
  recentOrders: Awaited<ReturnType<typeof orderService.getAllOrders>>;
  bestSellerStats: Array<{ name: string; sold: number }>;
}

export interface CustomerListParams {
  page?: number;
  pageSize?: number;
}

export interface CustomerListResult {
  items: User[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface StaffListParams {
  page?: number;
  pageSize?: number;
}

export interface StaffListResult {
  items: User[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CustomerLockPayload {
  customerId: string;
  isActive: boolean;
}

export interface StaffLockPayload {
  staffId: string;
  isActive: boolean;
}

export interface VoucherListParams {
  keyword?: string;
  status?: VoucherStatus | null;
  active?: boolean | null;
  page?: number;
  pageSize?: number;
}

export interface VoucherListResult {
  items: Voucher[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SupplierListParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface SupplierListResult {
  items: Supplier[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SupplierPayload {
  name: string;
  contractInfo: string | null;
  address: string | null;
}

export interface CategoryListParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface CategoryListResult {
  items: Category[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CategoryPayload {
  name: string;
  description: string | null;
}

export interface ImportReceiptItemPayload {
  productId: string;
  quantity: number;
  importPrice: number;
}

export interface ImportReceiptPayload {
  supplierId: string;
  note?: string | null;
  items: ImportReceiptItemPayload[];
}

export interface ImportReceiptItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  importPrice: number;
  lineTotal: number;
}

export interface ImportReceiptRecord {
  id: string;
  importDate: string;
  note: string | null;
  supplierId: string;
  supplierName: string;
  ownerId: string;
  items: ImportReceiptItem[];
  totalAmount: number;
  totalCost: number;
}

export interface ImportReceiptListParams {
  supplierId?: string;
  fromDate?: string;
  toDate?: string;
  keyword?: string;
}

const calcRevenue = (orders: Awaited<ReturnType<typeof orderService.getAllOrders>>) =>
  orders.reduce((sum, order) => {
    if (["DELIVERED", "COMPLETED"].includes(order.status)) {
      return sum + order.total;
    }
    return sum;
  }, 0);

const pickString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toIso = (value: unknown) => {
  if (typeof value === "string" || typeof value === "number" || value instanceof Date) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return new Date().toISOString();
};

const buildReports = (orders: Awaited<ReturnType<typeof orderService.getAllOrders>>): RevenueReport[] => {
  const bucket = new Map<string, RevenueReport>();
  orders.forEach((order) => {
    const period = order.createdAt.slice(0, 7);
    const current = bucket.get(period) ?? { period, revenue: 0, orders: 0 };
    current.orders += 1;
    if (["DELIVERED", "COMPLETED"].includes(order.status)) {
      current.revenue += order.total;
    }
    bucket.set(period, current);
  });
  return Array.from(bucket.values()).sort((a, b) => a.period.localeCompare(b.period));
};

const getCategoryIdForProduct = async (product: Product): Promise<string> => {
  if (product.category?.id) {
    return product.category.id;
  }
  const { data } = await axiosClient.get("/categories");
  const categories = unwrapPage<Record<string, unknown>>(data);
  const target = categories.find((entry) => {
    const name = String(entry["name"] ?? "").toLowerCase();
    return name === (product.category?.name ?? "").toLowerCase();
  });
  if (!target || !target["id"]) {
    throw new Error("Không tìm thấy category phù hợp trên backend.");
  }
  return String(target["id"]);
};

const getCategoryIdsForProduct = async (product: Product): Promise<string[]> => {
  const ids = (product.categories ?? []).map((category) => category.id).filter(Boolean);
  if (ids.length > 0) {
    return Array.from(new Set(ids));
  }
  return [await getCategoryIdForProduct(product)];
};

const serializeSpecs = (specs: Product["specs"]): string =>
  (specs ?? [])
    .map((spec) => `${spec.label}: ${spec.value}`)
    .filter(Boolean)
    .join("\n");

const parseSpecs = (specs: string): Product["specs"] =>
  specs
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex < 0) {
        return { label: "Thông số", value: line };
      }
      return {
        label: line.slice(0, separatorIndex).trim() || "Thông số",
        value: line.slice(separatorIndex + 1).trim(),
      };
    });

export const toProductCreateRequest = async (product: Product): Promise<ProductCreateRequest> => ({
  brand: product.brand ?? "",
  name: product.name,
  description: product.description ?? "",
  price: Math.round(product.price),
  stockQuantity: Math.max(0, Math.round(product.stockQuantity)),
  categoryIds: await getCategoryIdsForProduct(product),
  movementType: product.movementType ?? "",
  glassMaterial: product.glassMaterial ?? "",
  faceSize: product.faceSize ?? "",
  wireMaterial: product.wireMaterial ?? product.strapMaterial ?? "",
  waterResistance: product.waterResistance ?? "",
  faceColor: product.faceColor ?? "",
  wireColor: product.wireColor ?? product.strapColor ?? "",
  caseColor: product.caseColor ?? "",
  color: product.color ?? product.faceColor ?? "",
  size: product.size ?? product.faceSize ?? "",
  specs: serializeSpecs(product.specs),
});

export const toProductUpdateRequest = async (product: Product): Promise<ProductUpdateRequest> => ({
  ...(await toProductCreateRequest(product)),
  status: product.status,
});

const toMockProduct = (
  id: string,
  payload: ProductCreateRequest | ProductUpdateRequest,
  existing?: Product,
): Product => {
  const db = getDb();
  const payloadCategoryIds = payload.categoryIds?.length
    ? payload.categoryIds
    : payload.categoryId
      ? [payload.categoryId]
      : [];
  const categories = payloadCategoryIds
    .map((categoryId) => db.categories.find((item) => item.id === categoryId))
    .filter((item): item is (typeof db.categories)[number] => Boolean(item));
  const category = categories[0] ?? db.categories[0];
  const now = new Date().toISOString();
  const status = "status" in payload ? (payload.status as ProductStatus) : existing?.status ?? "ACTIVE";

  return {
    id,
    sku: existing?.sku ?? `SKU-${id.slice(-6)}`,
    name: payload.name,
    brand: payload.brand,
    category,
    categories: categories.length > 0 ? categories : [category],
    description: payload.description,
    price: payload.price,
    salePrice: existing?.salePrice,
    stockQuantity: payload.stockQuantity,
    movementType: payload.movementType,
    glassMaterial: payload.glassMaterial,
    waterResistance: payload.waterResistance,
    faceSize: payload.faceSize,
    strapMaterial: existing?.strapMaterial ?? payload.wireMaterial,
    strapColor: existing?.strapColor ?? payload.wireColor,
    wireMaterial: payload.wireMaterial,
    wireColor: payload.wireColor,
    caseColor: payload.caseColor,
    faceColor: payload.faceColor,
    gender: existing?.gender,
    color: payload.color,
    size: payload.size,
    specs: parseSpecs(payload.specs),
    status,
    averageRating: existing?.averageRating,
    rating: existing?.rating,
    reviewCount: existing?.reviewCount,
    images: existing?.images ?? [],
    imageUrls: existing?.imageUrls,
    tags: existing?.tags,
    isFeatured: existing?.isFeatured,
    isBestSeller: existing?.isBestSeller,
    isNewArrival: existing?.isNewArrival,
    relatedProducts: existing?.relatedProducts,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
};

async function createProduct(payload: ProductCreateRequest): Promise<Product> {
  try {
    const data = await productApi.createProduct(payload);
    return mapBackendProduct(data);
  } catch {
    await delay(180);
    const created = toMockProduct(`p-${Date.now()}`, payload);
    getDb().products.unshift(created);
    return structuredClone(created);
  }
}

async function updateProduct(id: string, payload: ProductUpdateRequest): Promise<Product> {
  try {
    const data = await productApi.updateProduct(id, payload);
    return mapBackendProduct(data);
  } catch {
    await delay(180);
    const db = getDb();
    const exists = db.products.find((item) => item.id === id);
    if (!exists) {
      throw new Error("Không tìm thấy sản phẩm để cập nhật.");
    }
    const nextProduct = toMockProduct(id, payload, exists);
    Object.assign(exists, nextProduct);
    return structuredClone(exists);
  }
}

type VoucherUpsertPayload = {
  code: string;
  discountPercent: number;
  validFrom: string;
  validTo: string;
  quantity: number;
  status?: VoucherStatus;
};

const toVoucherRequest = (voucher: VoucherUpsertPayload) => {
  return {
    code: voucher.code.trim().toUpperCase(),
    discountPercent: voucher.discountPercent,
    quantity: voucher.quantity,
    status: voucher.status ?? "ACTIVE",
    validFrom: new Date(voucher.validFrom).toISOString(),
    validTo: new Date(voucher.validTo).toISOString(),
  };
};

const toApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    const message = (data as Record<string, unknown>)["message"];
    if (typeof message === "string" && message.trim()) {
      return message;
    }
    const errorText = (data as Record<string, unknown>)["error"];
    if (typeof errorText === "string" && errorText.trim()) {
      return errorText;
    }
  }

  return fallback;
};

const toNullableText = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

type BackendWarranty = {
  id?: string;
  userId?: string | null;
  orderId?: string | null;
  orderItemId?: string | null;
  customerPhone?: string;
  customerName?: string;
  issueDescription?: string;
  receivedDate?: string | number | Date;
  expectedReturnDate?: string | number | Date;
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
  status?: string;
  technicianNote?: string | null;
  rejectReason?: string | null;
  quantity?: number;
  productId?: string;
  productName?: string | null;
};

const toWarrantyAdminItem = (raw: BackendWarranty): WarrantyAdminItem => ({
  id: String(raw.id ?? ""),
  customerPhone: String(raw.customerPhone ?? ""),
  customerName: String(raw.customerName ?? ""),
  issueDescription: String(raw.issueDescription ?? ""),
  receivedDate: toIso(raw.receivedDate),
  expectedReturnDate: toIso(raw.expectedReturnDate),
  status: String(raw.status ?? "RECEIVED").toUpperCase() as WarrantyAdminItem["status"],
  technicianNote: toNullableText(raw.technicianNote),
  rejectReason: toNullableText(raw.rejectReason),
  quantity: Math.max(1, Number(raw.quantity ?? 1)),
  productId: String(raw.productId ?? ""),
  productName: toNullableText(raw.productName),
});

const toCustomerPage = (data: unknown, page: number, pageSize: number): CustomerListResult => {
  const content = unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendUser(item));
  const payload = data && typeof data === "object" ? (data as Record<string, unknown>) : {};

  const total = Number(payload["totalElements"] ?? content.length);
  const totalPages = Number(payload["totalPages"] ?? (content.length ? 1 : 0));
  const backendPage = Number(payload["number"] ?? page - 1);
  const backendSize = Number(payload["size"] ?? pageSize);

  return {
    items: content,
    page: Number.isFinite(backendPage) ? backendPage + 1 : page,
    pageSize: Number.isFinite(backendSize) ? backendSize : pageSize,
    total: Number.isFinite(total) ? total : content.length,
    totalPages: Number.isFinite(totalPages) ? totalPages : content.length ? 1 : 0,
  };
};

const toStaffPage = (data: unknown, page: number, pageSize: number): StaffListResult => {
  const content = unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendUser(item));
  const payload = data && typeof data === "object" ? (data as Record<string, unknown>) : {};

  const total = Number(payload["totalElements"] ?? content.length);
  const totalPages = Number(payload["totalPages"] ?? (content.length ? 1 : 0));
  const backendPage = Number(payload["number"] ?? page - 1);
  const backendSize = Number(payload["size"] ?? pageSize);

  return {
    items: content,
    page: Number.isFinite(backendPage) ? backendPage + 1 : page,
    pageSize: Number.isFinite(backendSize) ? backendSize : pageSize,
    total: Number.isFinite(total) ? total : content.length,
    totalPages: Number.isFinite(totalPages) ? totalPages : content.length ? 1 : 0,
  };
};

const toVoucherPage = (data: unknown, page: number, pageSize: number): VoucherListResult => {
  const content = unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendVoucher(item));
  const payload = data && typeof data === "object" ? (data as Record<string, unknown>) : {};

  const total = Number(payload["totalElements"] ?? content.length);
  const totalPages = Number(payload["totalPages"] ?? (content.length ? 1 : 0));
  const backendPage = Number(payload["number"] ?? page - 1);
  const backendSize = Number(payload["size"] ?? pageSize);

  return {
    items: content,
    page: Number.isFinite(backendPage) ? backendPage + 1 : page,
    pageSize: Number.isFinite(backendSize) ? backendSize : pageSize,
    total: Number.isFinite(total) ? total : content.length,
    totalPages: Number.isFinite(totalPages) ? totalPages : content.length ? 1 : 0,
  };
};

const toSupplierPage = (data: unknown, page: number, pageSize: number): SupplierListResult => {
  const content = unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendSupplier(item));
  const payload = data && typeof data === "object" ? (data as Record<string, unknown>) : {};

  const total = Number(payload["totalElements"] ?? content.length);
  const totalPages = Number(payload["totalPages"] ?? (content.length ? 1 : 0));
  const backendPage = Number(payload["number"] ?? page - 1);
  const backendSize = Number(payload["size"] ?? pageSize);

  return {
    items: content,
    page: Number.isFinite(backendPage) ? backendPage + 1 : page,
    pageSize: Number.isFinite(backendSize) ? backendSize : pageSize,
    total: Number.isFinite(total) ? total : content.length,
    totalPages: Number.isFinite(totalPages) ? totalPages : content.length ? 1 : 0,
  };
};

const toCategoryPage = (data: unknown, page: number, pageSize: number): CategoryListResult => {
  const content = unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendCategory(item));
  const payload = data && typeof data === "object" ? (data as Record<string, unknown>) : {};

  const total = Number(payload["totalElements"] ?? content.length);
  const totalPages = Number(payload["totalPages"] ?? (content.length ? 1 : 0));
  const backendPage = Number(payload["number"] ?? page - 1);
  const backendSize = Number(payload["size"] ?? pageSize);

  return {
    items: content,
    page: Number.isFinite(backendPage) ? backendPage + 1 : page,
    pageSize: Number.isFinite(backendSize) ? backendSize : pageSize,
    total: Number.isFinite(total) ? total : content.length,
    totalPages: Number.isFinite(totalPages) ? totalPages : content.length ? 1 : 0,
  };
};

const mapImportReceiptItem = (raw: unknown, index: number): ImportReceiptItem => {
  const payload = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const quantity = Math.max(0, Math.round(toNumber(payload["quantity"], 0)));
  const importPrice = Math.max(0, Math.round(toNumber(payload["importPrice"], 0)));
  const fallbackLineTotal = quantity * importPrice;

  return {
    id: pickString(payload["id"], `iri-${Date.now()}-${index}`),
    productId: pickString(payload["productId"]),
    productName: pickString(payload["productName"], "San pham"),
    quantity,
    importPrice,
    lineTotal: Math.max(0, Math.round(toNumber(payload["lineTotal"], fallbackLineTotal))),
  };
};

const mapImportReceiptRecord = (raw: unknown, index: number): ImportReceiptRecord => {
  const payload = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const itemsRaw = Array.isArray(payload["items"]) ? payload["items"] : [];
  const items = itemsRaw.map((item, itemIndex) => mapImportReceiptItem(item, itemIndex));
  const fallbackTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalAmount = Math.max(0, Math.round(toNumber(payload["totalAmount"], fallbackTotal)));
  const totalCost = Math.max(0, Math.round(toNumber(payload["totalCost"], totalAmount)));

  return {
    id: pickString(payload["id"], `ir-${Date.now()}-${index}`),
    importDate: toIso(payload["importDate"]),
    note: pickString(payload["note"]).trim() || null,
    supplierId: pickString(payload["supplierId"]),
    supplierName: pickString(payload["supplierName"], "--"),
    ownerId: pickString(payload["ownerId"]),
    items,
    totalAmount,
    totalCost,
  };
};

export const adminService = {
  async getOwnerOverview(): Promise<OwnerOverview> {
    const [orders, products, warrantySummary] = await Promise.all([
      orderService.getAllOrders().catch(() => []),
      this.listProducts().catch(() => []),
      this.listWarranties({ page: 1, pageSize: 1 }).catch(() => ({
        items: [],
        page: 1,
        pageSize: 1,
        total: 0,
        totalPages: 0,
      })),
    ]);
    const soldCounter = new Map<string, number>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        soldCounter.set(item.productName, (soldCounter.get(item.productName) ?? 0) + item.quantity);
      });
    });

    const bestSellerStats = Array.from(soldCounter.entries())
      .map(([name, sold]) => ({ name, sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 6);

    return {
      revenue: calcRevenue(orders),
      totalOrders: orders.length,
      pendingOrders: orders.filter((order) => order.status === "PENDING").length,
      lowStockProducts: products.filter((product) => product.stockQuantity <= 5),
      warrantyCount: warrantySummary.total,
      recentOrders: orders.slice(0, 5),
      bestSellerStats,
    };
  },

  async listProducts(): Promise<Product[]> {
    const result = await productService.getAll({ page: 1, pageSize: 500 });
    return result.items;
  },

  async getProductById(productId: string): Promise<Product | null> {
    return productService.getById(productId);
  },

  createProduct,
  updateProduct,

  async listSuppliers(params: SupplierListParams = {}): Promise<SupplierListResult> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, params.pageSize ?? 10);
    const keyword = params.keyword?.trim() ?? "";
    try {
      const { data } = keyword
        ? await axiosClient.get("/suppliers/search", {
            params: {
              keyword,
              page: page - 1,
              size: pageSize,
            },
          })
        : await axiosClient.get("/suppliers", {
            params: {
              page: page - 1,
              size: pageSize,
            },
          });
      return toSupplierPage(data, page, pageSize);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể tải danh sách nhà cung cấp."));
    }
  },

  async createSupplier(payload: SupplierPayload): Promise<Supplier> {
    try {
      const { data } = await axiosClient.post("/suppliers", payload);
      return mapBackendSupplier(data);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể tạo nhà cung cấp."));
    }
  },

  async updateSupplier(supplierId: string, payload: SupplierPayload): Promise<Supplier> {
    try {
      const { data } = await axiosClient.put(`/suppliers/${supplierId}`, payload);
      return mapBackendSupplier(data);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể cập nhật nhà cung cấp."));
    }
  },

  async removeSupplier(supplierId: string): Promise<void> {
    try {
      await axiosClient.delete(`/suppliers/${supplierId}`);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể xóa nhà cung cấp."));
    }
  },

  async listCategories(params: CategoryListParams = {}): Promise<CategoryListResult> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, params.pageSize ?? 10);
    const keyword = params.keyword?.trim() ?? "";

    try {
      const { data } = await axiosClient.get("/categories/search", {
        params: {
          page: page - 1,
          size: pageSize,
          ...(keyword ? { keyword } : {}),
        },
      });
      return toCategoryPage(data, page, pageSize);
    } catch {
      try {
        const { data } = await axiosClient.get("/categories");
        const all = unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendCategory(item));
        const normalizedKeyword = keyword.toLowerCase();
        const filtered = normalizedKeyword
          ? all.filter((item) => `${item.name} ${item.description ?? ""}`.toLowerCase().includes(normalizedKeyword))
          : all;
        const total = filtered.length;
        const totalPages = total ? Math.ceil(total / pageSize) : 0;
        const offset = (page - 1) * pageSize;
        return {
          items: filtered.slice(offset, offset + pageSize),
          page,
          pageSize,
          total,
          totalPages,
        };
      } catch {
        return {
          items: [],
          page,
          pageSize,
          total: 0,
          totalPages: 0,
        };
      }
    }
  },

  async createCategory(payload: CategoryPayload): Promise<Category> {
    try {
      const { data } = await axiosClient.post("/categories", {
        name: payload.name.trim(),
        description: payload.description?.trim() ? payload.description.trim() : null,
      });
      return mapBackendCategory(data as Record<string, unknown>);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể tạo danh mục."));
    }
  },

  async updateCategory(categoryId: string, payload: CategoryPayload): Promise<Category> {
    try {
      const { data } = await axiosClient.put(`/categories/${categoryId}`, {
        name: payload.name.trim(),
        description: payload.description?.trim() ? payload.description.trim() : null,
      });
      return mapBackendCategory(data as Record<string, unknown>);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể cập nhật danh mục."));
    }
  },

  async removeCategory(categoryId: string): Promise<void> {
    try {
      await axiosClient.delete(`/categories/${categoryId}`);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể xóa danh mục."));
    }
  },

  async listWarranties(params: WarrantyListParams = {}): Promise<WarrantyListResult> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, params.pageSize ?? 10);
    const keyword = params.keyword?.trim().toLowerCase() ?? "";
    try {
      const data = await warrantyApi.listForAdmin({
        keyword,
        status: params.status,
        page,
        pageSize,
      });
      const items = unwrapPage<BackendWarranty>(data).map((item) => toWarrantyAdminItem(item));
      const payload = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
      const total = Number(payload["totalElements"] ?? items.length);
      const totalPages = Number(payload["totalPages"] ?? (items.length ? 1 : 0));
      const backendPage = Number(payload["number"] ?? page - 1);
      const backendSize = Number(payload["size"] ?? pageSize);

      return {
        items,
        page: Number.isFinite(backendPage) ? backendPage + 1 : page,
        pageSize: Number.isFinite(backendSize) ? backendSize : pageSize,
        total: Number.isFinite(total) ? total : items.length,
        totalPages: Number.isFinite(totalPages) ? totalPages : items.length ? 1 : 0,
      };
    } catch {
      return {
        items: [],
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      };
    }
  },

  async getWarrantyById(warrantyId: string): Promise<WarrantyAdminItem | null> {
    try {
      const data = await warrantyApi.getById(warrantyId);
      return toWarrantyAdminItem(data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(toApiErrorMessage(error, "Không thể tải chi tiết bảo hành."));
    }
  },

  async createWarranty(payload: WarrantyCreatePayload): Promise<WarrantyAdminItem> {
    try {
      const data = await warrantyApi.createForAdmin(payload);
      return toWarrantyAdminItem(data);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể tạo phiếu bảo hành."));
    }
  },

  async updateWarrantyStatus(warrantyId: string, payload: WarrantyStatusUpdatePayload): Promise<WarrantyAdminItem> {
    try {
      const data = await warrantyApi.updateStatus(warrantyId, payload);
      return toWarrantyAdminItem(data);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể cập nhật trạng thái bảo hành."));
    }
  },

  async listImportReceipts(params: ImportReceiptListParams = {}): Promise<ImportReceiptRecord[]> {
    try {
      const supplierId = params.supplierId?.trim() ?? "";
      const keyword = params.keyword?.trim() ?? "";
      const fromDate = params.fromDate?.trim() ?? "";
      const toDate = params.toDate?.trim() ?? "";
      const { data } = await axiosClient.get("/import-receipts", {
        params: {
          ...(supplierId ? { supplierId } : {}),
          ...(keyword ? { keyword } : {}),
          ...(fromDate ? { fromDate } : {}),
          ...(toDate ? { toDate } : {}),
        },
      });

      const rows = unwrapPage<Record<string, unknown>>(data);
      return rows.map((item, index) => mapImportReceiptRecord(item, index));
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể tải danh sách phiếu nhập."));
    }
  },

  async createImportReceipt(payload: ImportReceiptPayload): Promise<ImportReceiptRecord> {
    try {
      const body = {
        supplierId: payload.supplierId,
        note: payload.note?.trim() || null,
        items: payload.items.map((item) => ({
          productId: item.productId,
          quantity: Math.max(1, Math.round(item.quantity)),
          importPrice: Math.max(0, Math.round(item.importPrice)),
        })),
      };
      const { data } = await axiosClient.post("/import-receipts", body);
      return mapImportReceiptRecord(data, 0);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể tạo phiếu nhập."));
    }
  },

  async listCustomers(params: CustomerListParams = {}): Promise<CustomerListResult> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, params.pageSize ?? 10);
    try {
      const { data } = await axiosClient.get("/customers", { params: { page: page - 1, size: pageSize } });
      return toCustomerPage(data, page, pageSize);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể tải danh sách khách hàng."));
    }
  },

  async getCustomerById(customerId: string): Promise<User | null> {
    try {
      const { data } = await axiosClient.get(`/customers/${customerId}`);
      return mapBackendUser(data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(toApiErrorMessage(error, "Không thể tải chi tiết khách hàng."));
    }
  },

  async removeCustomer(customerId: string) {
    try {
      await axiosClient.delete(`/customers/${customerId}`);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể xóa khách hàng."));
    }
  },

  async setCustomerActiveStatus({ customerId, isActive }: CustomerLockPayload): Promise<User> {
    try {
      const path = isActive ? "unlock" : "lock";
      const { data } = await axiosClient.patch(`/customers/${customerId}/${path}`);
      return mapBackendUser(data);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể cập nhật trạng thái khách hàng."));
    }
  },

  async promoteCustomerToStaff(customerId: string): Promise<User> {
    try {
      const { data } = await axiosClient.patch(`/customers/${customerId}/promote-to-staff`);
      return mapBackendUser(data);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể nâng quyền khách hàng."));
    }
  },

  async listStaff(params: StaffListParams = {}): Promise<StaffListResult> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, params.pageSize ?? 10);
    try {
      const { data } = await axiosClient.get("/staff", { params: { page: page - 1, size: pageSize } });
      return toStaffPage(data, page, pageSize);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể tải danh sách nhân viên."));
    }
  },

  async getStaffById(staffId: string): Promise<User | null> {
    try {
      const { data } = await axiosClient.get(`/staff/${staffId}`);
      return mapBackendUser(data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(toApiErrorMessage(error, "Không thể tải chi tiết nhân viên."));
    }
  },

  async setStaffActiveStatus({ staffId, isActive }: StaffLockPayload): Promise<User> {
    try {
      const path = isActive ? "unlock" : "lock";
      const { data } = await axiosClient.patch(`/users/${staffId}/${path}`);
      return mapBackendUser(data);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể cập nhật trạng thái nhân viên."));
    }
  },


  async removeStaff(staffId: string) {
    try {
      await axiosClient.delete(`/users/${staffId}`);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể xóa nhân viên."));
    }
  },

  async listVouchers(params: VoucherListParams = {}): Promise<VoucherListResult> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, params.pageSize ?? 10);
    const keyword = params.keyword?.trim() ?? "";
    try {
      const { data } = await axiosClient.get("/vouchers", {
        params: {
          page: page - 1,
          size: pageSize,
          ...(keyword ? { keyword } : {}),
          ...(params.status ? { status: params.status } : {}),
          ...(typeof params.active === "boolean" ? { active: params.active } : {}),
        },
      });
      return toVoucherPage(data, page, pageSize);
    } catch {
      return {
        items: [],
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      };
    }
  },

  async createVoucher(voucher: VoucherUpsertPayload): Promise<Voucher> {
    try {
      const payload = toVoucherRequest(voucher);
      const { data } = await axiosClient.post("/vouchers", payload);
      return mapBackendVoucher(data);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể tạo voucher."));
    }
  },

  async updateVoucher(voucherId: string, voucher: VoucherUpsertPayload): Promise<Voucher> {
    try {
      const payload = toVoucherRequest(voucher);
      const { data } = await axiosClient.put(`/vouchers/${voucherId}`, payload);
      return mapBackendVoucher(data);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể cập nhật voucher."));
    }
  },

  async removeVoucher(voucherId: string): Promise<void> {
    try {
      await axiosClient.delete(`/vouchers/${voucherId}`);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Không thể xóa voucher."));
    }
  },

  async listReports(): Promise<RevenueReport[]> {
    const orders = await orderService.getAllOrders().catch(() => []);
    if (orders.length) {
      return buildReports(orders);
    }
    await delay(120);
    return getDb().revenueReports;
  },

  async listStaticPages(): Promise<StaticPageContent[]> {
    await delay(80);
    return getDb().staticPages;
  },

  async updateStaticPage(payload: StaticPageContent) {
    await delay(120);
    const target = getDb().staticPages.find((item) => item.id === payload.id);
    if (!target) {
      throw new Error("Không tìm thấy trang cần cập nhật.");
    }
    target.title = payload.title;
    target.content = payload.content;
    target.updatedAt = new Date().toISOString();
    return structuredClone(target);
  },
};
