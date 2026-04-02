import axios from "axios";
import axiosClient from "@/api/axiosClient";
import { getDb } from "@/mocks/data/database";
import {
  mapBackendProduct,
  mapBackendUser,
  mapBackendVoucher,
  unwrapPage,
} from "@/services/api/backendMappers";
import { orderService } from "@/services/orderService";
import { productService } from "@/services/productService";
import { delay } from "@/services/mock/delay";
import { toSlug } from "@/shared/utils/slug";
import type { Product, RevenueReport, StaticPageContent, Supplier, User, Voucher } from "@/shared/types/domain";

export interface OwnerOverview {
  revenue: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockProducts: Product[];
  warrantyCount: number;
  recentOrders: Awaited<ReturnType<typeof orderService.getAllOrders>>;
  bestSellerStats: Array<{ name: string; sold: number }>;
}

export interface CustomerUpsertPayload {
  username: string;
  password?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  gender: NonNullable<User["gender"]>;
}

let voucherCache: Voucher[] = [];

const mergeVouchers = (source: Voucher[], extra: Voucher[]) => {
  const map = new Map<string, Voucher>();
  [...source, ...extra].forEach((voucher) => map.set(voucher.id, voucher));
  return Array.from(map.values()).sort((a, b) => Date.parse(b.validFrom) - Date.parse(a.validFrom));
};

const calcRevenue = (orders: Awaited<ReturnType<typeof orderService.getAllOrders>>) =>
  orders.reduce((sum, order) => {
    if (["DELIVERED", "COMPLETED"].includes(order.status)) {
      return sum + order.total;
    }
    return sum;
  }, 0);

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

const toVoucherRequest = (voucher: Voucher) => {
  const now = new Date();
  const validTo = voucher.isActive ? new Date(voucher.validTo) : new Date(now.getTime() - 1000);
  return {
    voucherCode: voucher.code,
    discountPercent: voucher.discountPercent,
    minOrderAmount: voucher.minOrderValue,
    validFrom: new Date(voucher.validFrom).toISOString(),
    validTo: validTo.toISOString(),
    maxUsage: 100,
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

export const adminService = {
  async getOwnerOverview(): Promise<OwnerOverview> {
    const [orders, products] = await Promise.all([
      orderService.getAllOrders().catch(() => []),
      this.listProducts().catch(() => []),
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
      warrantyCount: getDb().warranties.length,
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

  async saveProduct(input: Product): Promise<Product> {
    try {
      const categoryId = await getCategoryIdForProduct(input);
      const payload = {
        brand: input.brand ?? "",
        name: input.name,
        description: input.description ?? "",
        price: Math.round(input.price),
        stockQuantity: Math.max(0, Math.round(input.stockQuantity)),
        categoryId,
        partNumber: input.sku ?? input.id.toUpperCase(),
        powerSource: input.movementType ?? "",
        license: input.wireMaterial ?? "",
        warranty: input.waterResistance ?? "",
      };
      const isPersisted = Boolean(input.id && !input.id.startsWith("p-"));
      const { data } = isPersisted
        ? await axiosClient.put(`/products/${input.id}`, payload)
        : await axiosClient.post("/products/create", payload);
      return mapBackendProduct(data);
    } catch {
      await delay(180);
      const db = getDb();
      const exists = db.products.find((item) => item.id === input.id);
      if (exists) {
        Object.assign(exists, input);
        return structuredClone(exists);
      }
      db.products.unshift(input);
      return structuredClone(input);
    }
  },

  async listSuppliers(): Promise<Supplier[]> {
    await delay(120);
    return getDb().suppliers;
  },

  async listImportReceipts() {
    await delay(120);
    return getDb().importReceipts;
  },

  async listCustomers(): Promise<User[]> {
    try {
      const { data } = await axiosClient.get("/customers", { params: { page: 0, size: 500 } });
      return unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendUser(item));
    } catch {
      return [];
    }
  },

  async getCustomerById(customerId: string): Promise<User | null> {
    try {
      const { data } = await axiosClient.get(`/customers/${customerId}`);
      return mapBackendUser(data);
    } catch {
      return null;
    }
  },

  async createCustomer(payload: CustomerUpsertPayload): Promise<User> {
    try {
      const { data } = await axiosClient.post("/customers", {
        username: payload.username,
        password: payload.password ?? "Customer@123",
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        gender: payload.gender,
      });
      const mapped = mapBackendUser(data);
      return { ...mapped, fullName: payload.fullName, role: "CUSTOMER" };
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Khong the tao khach hang."));
    }
  },

  async updateCustomer(customerId: string, payload: Omit<CustomerUpsertPayload, "password">): Promise<User> {
    try {
      const { data } = await axiosClient.put(`/customers/${customerId}`, {
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        gender: payload.gender,
      });
      const mapped = mapBackendUser(data);
      return { ...mapped, fullName: payload.fullName, role: "CUSTOMER" };
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Khong the cap nhat khach hang."));
    }
  },

  async removeCustomer(customerId: string) {
    try {
      await axiosClient.delete(`/customers/${customerId}`);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, "Khong the xoa khach hang."));
    }
  },

  async listStaff(): Promise<User[]> {
    try {
      const { data } = await axiosClient.get("/users/role/STAFF");
      return unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendUser(item));
    } catch {
      await delay(120);
      return getDb().staff;
    }
  },

  async saveStaff(staff: User): Promise<User> {
    try {
      const payload = {
        username: staff.username || toSlug(staff.fullName || staff.email || "staff"),
        password: "Staff@123",
        email: staff.email,
        phone: staff.phone,
        address: staff.address ?? "",
        gender: staff.gender ?? "OTHER",
        role: "STAFF",
      };
      const isPersisted = Boolean(staff.id && !staff.id.startsWith("u-staff-"));
      const { data } = isPersisted
        ? await axiosClient.put(`/users/${staff.id}`, payload)
        : await axiosClient.post("/users", payload);
      const mapped = mapBackendUser(data);
      return { ...mapped, fullName: staff.fullName || mapped.fullName };
    } catch {
      await delay(140);
      const db = getDb();
      const existing = db.staff.find((item) => item.id === staff.id);
      if (existing) {
        Object.assign(existing, staff);
        return structuredClone(existing);
      }
      db.staff.unshift(staff);
      db.users.push(staff);
      return structuredClone(staff);
    }
  },

  async removeStaff(staffId: string) {
    try {
      await axiosClient.delete(`/users/${staffId}`);
    } catch {
      await delay(100);
      const db = getDb();
      db.staff = db.staff.filter((item) => item.id !== staffId);
      db.users = db.users.filter((item) => item.id !== staffId);
    }
  },

  async listVouchers(): Promise<Voucher[]> {
    try {
      const { data } = await axiosClient.get("/vouchers/active");
      const active = unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendVoucher(item));
      voucherCache = mergeVouchers(active, voucherCache);
      return voucherCache;
    } catch {
      await delay(120);
      return mergeVouchers(voucherCache, getDb().vouchers);
    }
  },

  async saveVoucher(voucher: Voucher): Promise<Voucher> {
    try {
      const payload = toVoucherRequest(voucher);
      const isPersisted = Boolean(voucher.id && !voucher.id.startsWith("v-"));
      const { data } = isPersisted
        ? await axiosClient.put(`/vouchers/${voucher.id}`, payload)
        : await axiosClient.post("/vouchers", payload);
      const mapped = mapBackendVoucher(data);
      voucherCache = mergeVouchers([mapped], voucherCache);
      return mapped;
    } catch {
      await delay(140);
      const db = getDb();
      const current = db.vouchers.find((item) => item.id === voucher.id);
      if (current) {
        Object.assign(current, voucher);
      } else {
        db.vouchers.unshift(voucher);
      }
      voucherCache = mergeVouchers([voucher], voucherCache);
      return structuredClone(voucher);
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
