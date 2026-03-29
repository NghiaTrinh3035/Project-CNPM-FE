import { getDb } from "@/mocks/data/database";
import { delay } from "@/services/mock/delay";
import type { Product, RevenueReport, StaticPageContent, Supplier, User, Voucher } from "@/shared/types/domain";

export interface OwnerOverview {
  revenue: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockProducts: Product[];
  warrantyCount: number;
  recentOrders: ReturnType<typeof getDb>["orders"];
  bestSellerStats: Array<{ name: string; sold: number }>;
}

const calcRevenue = () =>
  getDb().orders.reduce((sum, order) => {
    if (["DELIVERED", "COMPLETED"].includes(order.status)) {
      return sum + order.total;
    }
    return sum;
  }, 0);

export const adminService = {
  async getOwnerOverview(): Promise<OwnerOverview> {
    await delay(240);
    const db = getDb();
    const soldCounter = new Map<string, number>();
    db.orders.forEach((order) => {
      order.items.forEach((item) => {
        soldCounter.set(item.productName, (soldCounter.get(item.productName) ?? 0) + item.quantity);
      });
    });

    const bestSellerStats = Array.from(soldCounter.entries())
      .map(([name, sold]) => ({ name, sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 6);

    return {
      revenue: calcRevenue(),
      totalOrders: db.orders.length,
      pendingOrders: db.orders.filter((order) => order.status === "PENDING").length,
      lowStockProducts: db.products.filter((product) => product.stockQuantity <= 5),
      warrantyCount: db.warranties.length,
      recentOrders: db.orders.slice(0, 5),
      bestSellerStats,
    };
  },

  async listProducts(): Promise<Product[]> {
    await delay(220);
    return getDb().products;
  },

  async saveProduct(input: Product): Promise<Product> {
    await delay(260);
    const db = getDb();
    const exists = db.products.find((item) => item.id === input.id);
    if (exists) {
      Object.assign(exists, input);
      return structuredClone(exists);
    }
    db.products.unshift(input);
    return structuredClone(input);
  },

  async listSuppliers(): Promise<Supplier[]> {
    await delay(220);
    return getDb().suppliers;
  },

  async listImportReceipts() {
    await delay(220);
    return getDb().importReceipts;
  },

  async listCustomers(): Promise<User[]> {
    await delay(220);
    return getDb().customers;
  },

  async listStaff(): Promise<User[]> {
    await delay(220);
    return getDb().staff;
  },

  async saveStaff(staff: User): Promise<User> {
    await delay(240);
    const db = getDb();
    const existing = db.staff.find((item) => item.id === staff.id);
    if (existing) {
      Object.assign(existing, staff);
      return structuredClone(existing);
    }
    db.staff.unshift(staff);
    db.users.push(staff);
    return structuredClone(staff);
  },

  async removeStaff(staffId: string) {
    await delay(180);
    const db = getDb();
    db.staff = db.staff.filter((item) => item.id !== staffId);
    db.users = db.users.filter((item) => item.id !== staffId);
  },

  async listVouchers(): Promise<Voucher[]> {
    await delay(200);
    return getDb().vouchers;
  },

  async saveVoucher(voucher: Voucher): Promise<Voucher> {
    await delay(240);
    const db = getDb();
    const current = db.vouchers.find((item) => item.id === voucher.id);
    if (current) {
      Object.assign(current, voucher);
      return structuredClone(current);
    }
    db.vouchers.unshift(voucher);
    return structuredClone(voucher);
  },

  async listReports(): Promise<RevenueReport[]> {
    await delay(220);
    return getDb().revenueReports;
  },

  async listStaticPages(): Promise<StaticPageContent[]> {
    await delay(180);
    return getDb().staticPages;
  },

  async updateStaticPage(payload: StaticPageContent) {
    await delay(220);
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
