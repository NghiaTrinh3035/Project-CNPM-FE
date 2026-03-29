import { carts, importReceipts, notifications, orders, revenueReports, staticContentPages, suppliers, vouchers, warrantyRequests } from "@/mocks/data/commerce";
import { categories } from "@/mocks/data/categories";
import { hydratedProducts } from "@/mocks/data/products";
import { discussionComments, reviews, supportTickets } from "@/mocks/data/social";
import { customerAccounts, staffAccounts, users } from "@/mocks/data/users";
import type {
  Cart,
  DiscussionComment,
  Notification,
  Order,
  Product,
  Review,
  StaticPageContent,
  Supplier,
  SupportTicket,
  User,
  Voucher,
  WarrantyRequest,
} from "@/shared/types/domain";

const clone = <T>(value: T): T => structuredClone(value);

interface MockDatabase {
  products: Product[];
  users: User[];
  customers: User[];
  staff: User[];
  carts: Cart[];
  orders: Order[];
  reviews: Review[];
  discussions: DiscussionComment[];
  notifications: Notification[];
  warranties: WarrantyRequest[];
  vouchers: Voucher[];
  suppliers: Supplier[];
  importReceipts: typeof importReceipts;
  revenueReports: typeof revenueReports;
  supportTickets: SupportTicket[];
  staticPages: StaticPageContent[];
  categories: typeof categories;
}

const source: MockDatabase = {
  products: clone(hydratedProducts),
  users: clone(users),
  customers: clone(customerAccounts),
  staff: clone(staffAccounts),
  carts: clone(carts),
  orders: clone(orders),
  reviews: clone(reviews),
  discussions: clone(discussionComments),
  notifications: clone(notifications),
  warranties: clone(warrantyRequests),
  vouchers: clone(vouchers),
  suppliers: clone(suppliers),
  importReceipts: clone(importReceipts),
  revenueReports: clone(revenueReports),
  supportTickets: clone(supportTickets),
  staticPages: clone(staticContentPages),
  categories: clone(categories),
};

let db = clone(source);

export const getDb = () => db;

export const resetDb = () => {
  db = clone(source);
};
