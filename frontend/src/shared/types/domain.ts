export type UserRole = "CUSTOMER" | "STAFF" | "OWNER";

export type ProductStatus = "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentMethod = "COD" | "BANK_TRANSFER" | "E_WALLET";

export type WarrantyStatus = "RECEIVED" | "PROCESSING" | "REJECTED" | "COMPLETED";

export type NotificationType =
  | "ORDER"
  | "WARRANTY"
  | "PROMOTION"
  | "SUPPORT"
  | "SYSTEM";

export type GenderTarget = "MALE" | "FEMALE" | "UNISEX";

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  id: string;
  slug?: string;
  sku?: string;
  name: string;
  brand?: string;
  category: Category;
  description?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  movementType?: string;
  glassMaterial?: string;
  waterResistance?: string;
  faceSize?: string;
  thickness?: string;
  strapMaterial?: string;
  strapColor?: string;
  wireMaterial?: string;
  wireColor?: string;
  caseColor?: string;
  faceColor?: string;
  gender?: GenderTarget;
  color?: string;
  size?: string;
  specs?: Array<{ label: string; value: string }>;
  status: ProductStatus;
  averageRating?: number;
  rating?: number;
  reviewCount?: number;
  images: ProductImage[];
  imageUrls?: string[];
  tags?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  relatedProducts?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  fullName?: string;
  username: string;
  email: string;
  phone: string;
  address?: string;
  gender?: GenderTarget;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Customer extends User {
  role: "CUSTOMER";
  loyaltyTier: "SILVER" | "GOLD" | "PLATINUM";
  addresses: ShippingAddress[];
}

export interface Staff extends User {
  role: "STAFF";
  department: string;
}

export interface Owner extends User {
  role: "OWNER";
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  voucherCode?: string;
  updatedAt: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
}

export interface Payment {
  method: PaymentMethod;
  paidAt?: string;
  transactionCode?: string;
  status: "UNPAID" | "PAID" | "REFUNDED";
}

export interface Shipping {
  address: ShippingAddress;
  note?: string;
  trackingCode?: string;
  estimatedDelivery?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  voucherCode?: string;
  payment: Payment;
  shipping: Shipping;
  createdAt: string;
}

export interface WarrantyRequest {
  id: string;
  orderId: string;
  orderItemId: string;
  userId: string;
  productId: string;
  description: string;
  images: string[];
  status: WarrantyStatus;
  technicianNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountPercent: number;
  minOrderValue: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface DiscussionComment {
  id: string;
  productId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  aiHandled?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  href?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
}

export interface ImportDetail {
  id: string;
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface ImportReceipt {
  id: string;
  supplierId: string;
  importedAt: string;
  details: ImportDetail[];
  note?: string;
}

export interface RevenueReport {
  period: string;
  revenue: number;
  orders: number;
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  user: User;
}

export interface SupportTicket {
  id: string;
  userId: string;
  title: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  channel: "AI" | "STAFF";
  createdAt: string;
}

export interface StaticPageContent {
  id: "about" | "terms" | "privacy" | "return-policy";
  title: string;
  content: string;
  updatedAt: string;
}
