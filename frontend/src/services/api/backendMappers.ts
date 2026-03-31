import type {
  Cart,
  CartItem,
  Category,
  Notification,
  NotificationType,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductStatus,
  Review,
  ShippingAddress,
  User,
  UserRole,
  Voucher,
} from "@/shared/types/domain";
import { toSlug } from "@/shared/utils/slug";

const ORDER_STATUS_SET = new Set<OrderStatus>([
  "PENDING",
  "CONFIRMED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "RETURNED",
]);

const PRODUCT_STATUS_SET = new Set<ProductStatus>([
  "ACTIVE",
  "OUT_OF_STOCK",
  "DISCONTINUED",
]);

const ROLE_SET = new Set<UserRole>(["CUSTOMER", "STAFF", "OWNER"]);
const NOTIFICATION_TYPE_SET = new Set<NotificationType>(["ORDER", "WARRANTY", "PROMOTION", "SUPPORT", "SYSTEM"]);

const nowIso = () => new Date().toISOString();

const toIso = (value: unknown, fallback: string = nowIso()) => {
  if (typeof value === "string" || typeof value === "number" || value instanceof Date) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return fallback;
};

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const pickString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

const normalizeOrderStatus = (status: unknown): OrderStatus => {
  const value = pickString(status).toUpperCase() as OrderStatus;
  return ORDER_STATUS_SET.has(value) ? value : "PENDING";
};

const normalizeProductStatus = (status: unknown): ProductStatus => {
  const value = pickString(status).toUpperCase() as ProductStatus;
  return PRODUCT_STATUS_SET.has(value) ? value : "ACTIVE";
};

const normalizeRole = (role: unknown): UserRole => {
  const value = pickString(role).toUpperCase() as UserRole;
  return ROLE_SET.has(value) ? value : "CUSTOMER";
};

const toShippingAddress = (value: string) => {
  const parts = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return {
    detailAddress: parts[0] ?? value,
    ward: parts[1] ?? "",
    district: parts[2] ?? "",
    province: parts[3] ?? "",
  };
};

type BackendImage = {
  id?: string;
  imageUrl?: string;
  url?: string;
  altText?: string;
  alt?: string;
  isThumbnail?: boolean;
  isPrimary?: boolean;
};

type BackendCategory = {
  id?: string;
  name?: string;
  description?: string;
};

type BackendProduct = {
  id?: string;
  name?: string;
  brand?: string;
  description?: string;
  price?: number;
  salePrice?: number;
  stockQuantity?: number;
  status?: string;
  category?: BackendCategory;
  categoryId?: string;
  categoryName?: string;
  images?: BackendImage[];
  imageUrls?: string[];
  averageRating?: number;
  rating?: number;
  reviewCount?: number;
  reviews?: unknown[];
  partNumber?: string;
  movementType?: string;
  powerSource?: string;
  warranty?: string;
  waterResistance?: string;
  strapMaterial?: string;
  glassMaterial?: string;
  faceSize?: string;
  updatedAt?: string | number | Date;
  createdAt?: string | number | Date;
};

type BackendUser = {
  id?: string;
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string;
  gender?: string;
  isActive?: boolean;
  createdAt?: string | number | Date;
};

type BackendCartItem = {
  id?: string;
  quantity?: number;
  subTotal?: number;
  product?: BackendProduct;
};

type BackendCart = {
  id?: string;
  customer?: { id?: string };
  items?: BackendCartItem[];
};

type BackendOrderItem = {
  id?: string;
  quantity?: number;
  subTotal?: number;
  productId?: string;
  productName?: string;
  product?: BackendProduct;
};

type BackendOrder = {
  id?: string;
  orderDate?: string | number | Date;
  createdAt?: string | number | Date;
  totalAmount?: number;
  note?: string;
  status?: string;
  customerId?: string;
  customerUsername?: string;
  customer?: { id?: string; user?: BackendUser };
  voucher?: { voucherCode?: string };
  voucherCode?: string;
  payment?: {
    method?: string;
    status?: string;
    isPaid?: boolean;
    paymentDate?: string | number | Date;
  };
  shipping?: {
    trackingNumber?: string;
    estimatedDelivery?: string | number | Date;
    carrierPhone?: string;
  };
  orderItems?: BackendOrderItem[];
  items?: BackendOrderItem[];
};

type BackendReview = {
  id?: string;
  rating?: number;
  comment?: string;
  content?: string;
  createdAt?: string | number | Date;
  customerId?: string;
  productId?: string;
  customer?: { id?: string };
  product?: { id?: string };
};

type BackendVoucher = {
  id?: string;
  voucherCode?: string;
  discountPercent?: number;
  minOrderAmount?: number;
  validFrom?: string | number | Date;
  validTo?: string | number | Date;
  usedCount?: number;
  maxUsage?: number;
  status?: string;
};

type BackendNotification = {
  id?: string;
  title?: string;
  message?: string;
  content?: string;
  type?: string;
  href?: string;
  directUrl?: string;
  userId?: string;
  receiverId?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string | number | Date;
  timeCreated?: string | number | Date;
  receiver?: { id?: string };
};

export type BackendPage<T> = {
  content?: T[];
};

export const unwrapPage = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }
  if (value && typeof value === "object" && Array.isArray((value as BackendPage<T>).content)) {
    return (value as BackendPage<T>).content ?? [];
  }
  return [];
};

export const mapBackendCategory = (raw: BackendCategory | null | undefined): Category => {
  const id = pickString(raw?.id, `cat-${Date.now()}`);
  const name = pickString(raw?.name, "Uncategorized");
  return {
    id,
    name,
    slug: toSlug(name || id),
    description: pickString(raw?.description),
  };
};

export const mapBackendProduct = (raw: BackendProduct | null | undefined): Product => {
  const id = pickString(raw?.id, `p-${Date.now()}`);
  const category = raw?.category
    ? mapBackendCategory(raw.category)
    : mapBackendCategory({
        id: raw?.categoryId,
        name: raw?.categoryName ?? "General",
      });
  const imagePool =
    raw?.images?.map((item, index) => ({
      id: pickString(item.id, `${id}-img-${index + 1}`),
      url: pickString(item.imageUrl ?? item.url),
      alt: pickString(item.altText ?? item.alt, pickString(raw?.name, "Product image")),
      isPrimary: Boolean(item.isThumbnail ?? item.isPrimary ?? index === 0),
    })) ?? [];
  const imageUrls = raw?.imageUrls?.filter(Boolean) ?? [];
  if (imagePool.length === 0 && imageUrls.length > 0) {
    imageUrls.forEach((url, index) =>
      imagePool.push({
        id: `${id}-img-${index + 1}`,
        url,
        alt: pickString(raw?.name, "Product image"),
        isPrimary: index === 0,
      }),
    );
  }
  if (imagePool.length === 0) {
    imagePool.push({
      id: `${id}-img-1`,
      url: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80",
      alt: pickString(raw?.name, "Product image"),
      isPrimary: true,
    });
  }

  const rating = toNumber(raw?.averageRating ?? raw?.rating, 0);
  const reviewCount = toNumber(raw?.reviewCount ?? raw?.reviews?.length, 0);
  const updatedAt = toIso(raw?.updatedAt ?? raw?.createdAt);
  const rawName = pickString(raw?.name);
  const slug = rawName ? `${toSlug(rawName)}-${id.slice(0, 8)}` : id;

  return {
    id,
    slug,
    sku: pickString(raw?.partNumber, `SKU-${id.slice(0, 8).toUpperCase()}`),
    name: pickString(raw?.name, "Unnamed Product"),
    brand: pickString(raw?.brand, "Unknown"),
    category,
    description: pickString(raw?.description),
    price: toNumber(raw?.price, 0),
    salePrice: raw?.salePrice !== undefined && raw?.salePrice !== null ? toNumber(raw.salePrice, 0) : undefined,
    stockQuantity: toNumber(raw?.stockQuantity, 0),
    movementType: pickString(raw?.movementType ?? raw?.powerSource, "Automatic"),
    glassMaterial: pickString(raw?.glassMaterial, "Sapphire Crystal"),
    waterResistance: pickString(raw?.waterResistance, "50m"),
    faceSize: pickString(raw?.faceSize, "40mm"),
    strapMaterial: pickString(raw?.strapMaterial, "Steel"),
    status: normalizeProductStatus(raw?.status),
    averageRating: rating,
    rating,
    reviewCount,
    images: imagePool,
    imageUrls: imagePool.map((item) => item.url),
    specs: [
      { label: "Movement", value: pickString(raw?.movementType ?? raw?.powerSource, "-") },
      { label: "Warranty", value: pickString(raw?.warranty, "-") },
      { label: "Water", value: pickString(raw?.waterResistance, "-") },
    ],
    tags: [pickString(raw?.brand), category.name].filter(Boolean),
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    relatedProducts: [],
    createdAt: updatedAt,
    updatedAt,
  };
};

export const mapBackendUser = (raw: BackendUser | null | undefined): User => {
  const id = pickString(raw?.id, `u-${Date.now()}`);
  const username = pickString(raw?.username, pickString(raw?.email).split("@")[0] || id);
  const fullName = pickString(raw?.fullName, username);
  return {
    id,
    fullName,
    username,
    email: pickString(raw?.email),
    phone: pickString(raw?.phone),
    address: pickString(raw?.address),
    gender: (pickString(raw?.gender).toUpperCase() as User["gender"]) || undefined,
    role: normalizeRole(raw?.role),
    isActive: raw?.isActive ?? true,
    createdAt: toIso(raw?.createdAt),
  };
};

export const mapBackendCart = (
  raw: BackendCart | null | undefined,
  options: { userId: string; voucherCode?: string } = { userId: "" },
): Cart => {
  const items: CartItem[] =
    raw?.items?.map((item, index) => {
      const quantity = Math.max(1, toNumber(item.quantity, 1));
      const fallbackPrice = toNumber(item.product?.price, 0);
      const unitPrice = item.subTotal !== undefined ? toNumber(item.subTotal, fallbackPrice * quantity) / quantity : fallbackPrice;
      return {
        id: pickString(item.id, `ci-${index + 1}`),
        productId: pickString(item.product?.id),
        quantity,
        unitPrice,
      };
    }) ?? [];

  return {
    id: pickString(raw?.id, `c-${Date.now()}`),
    userId: pickString(raw?.customer?.id, options.userId),
    items,
    voucherCode: options.voucherCode,
    updatedAt: nowIso(),
  };
};

export const mapBackendOrder = (raw: BackendOrder | null | undefined): Order => {
  const id = pickString(raw?.id, `o-${Date.now()}`);
  const createdAt = toIso(raw?.orderDate ?? raw?.createdAt);
  const status = normalizeOrderStatus(raw?.status);
  const itemsSource = raw?.orderItems ?? raw?.items ?? [];
  const items: OrderItem[] = itemsSource.map((item, index) => {
    const quantity = Math.max(1, toNumber(item.quantity, 1));
    const unitPrice =
      item.subTotal !== undefined
        ? toNumber(item.subTotal, 0) / quantity
        : toNumber(item.product?.price, 0);
    const productImage = mapBackendProduct(item.product).images[0]?.url ?? "";
    return {
      id: pickString(item.id, `${id}-oi-${index + 1}`),
      productId: pickString(item.productId ?? item.product?.id),
      productName: pickString(item.productName ?? item.product?.name, "Product"),
      productImage,
      quantity,
      unitPrice,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = toNumber(raw?.totalAmount, subtotal);
  const discount = Math.max(0, subtotal - total);
  const paymentMethod = (pickString(raw?.payment?.method).toUpperCase() as PaymentMethod) || "COD";
  const paymentStatus = raw?.payment?.status === "REJECTED"
    ? "REFUNDED"
    : raw?.payment?.isPaid || raw?.payment?.status === "COMPLETED"
      ? "PAID"
      : "UNPAID";
  const customerUser = raw?.customer?.user;
  const rawAddress = pickString(customerUser?.address);
  const parsedAddress = toShippingAddress(rawAddress);
  const shippingAddress: ShippingAddress = {
    fullName: pickString(customerUser?.fullName ?? customerUser?.username ?? raw?.customerUsername, "Khách hàng"),
    phone: pickString(customerUser?.phone ?? raw?.shipping?.carrierPhone),
    province: parsedAddress.province,
    district: parsedAddress.district,
    ward: parsedAddress.ward,
    detailAddress: parsedAddress.detailAddress,
  };

  const timeline: Order["timeline"] =
    status === "PENDING"
      ? [{ status: "PENDING", at: createdAt }]
      : [
          { status: "PENDING", at: createdAt },
          { status, at: createdAt },
        ];

  return {
    id,
    userId: pickString(raw?.customer?.id ?? raw?.customerId),
    items,
    status,
    timeline,
    subtotal,
    discount,
    shippingFee: 0,
    total,
    voucherCode: pickString(raw?.voucher?.voucherCode ?? raw?.voucherCode) || undefined,
    payment: {
      method: paymentMethod,
      paidAt: raw?.payment?.paymentDate ? toIso(raw.payment.paymentDate) : undefined,
      status: paymentStatus,
    },
    shipping: {
      address: shippingAddress,
      note: pickString(raw?.note) || undefined,
      trackingCode: pickString(raw?.shipping?.trackingNumber) || undefined,
      estimatedDelivery: raw?.shipping?.estimatedDelivery ? toIso(raw.shipping.estimatedDelivery) : undefined,
    },
    createdAt,
  };
};

export const mapBackendReview = (raw: BackendReview | null | undefined): Review => ({
  id: pickString(raw?.id, `r-${Date.now()}`),
  userId: pickString(raw?.customerId ?? raw?.customer?.id),
  productId: pickString(raw?.productId ?? raw?.product?.id),
  orderId: "",
  rating: toNumber(raw?.rating, 5),
  content: pickString(raw?.comment ?? raw?.content),
  createdAt: toIso(raw?.createdAt),
});

export const mapBackendVoucher = (raw: BackendVoucher | null | undefined): Voucher => {
  const code = pickString(raw?.voucherCode);
  const validFrom = toIso(raw?.validFrom);
  const validTo = toIso(raw?.validTo);
  const now = Date.now();
  const activeByTime = Date.parse(validFrom) <= now && now <= Date.parse(validTo);
  const activeByStatus = pickString(raw?.status).toUpperCase() === "ACTIVE";
  const usedCount = toNumber(raw?.usedCount, 0);
  const maxUsage = toNumber(raw?.maxUsage, 1);
  return {
    id: pickString(raw?.id, `v-${Date.now()}`),
    code,
    title: code || "Voucher",
    description: `Giảm ${toNumber(raw?.discountPercent, 0)}% cho đơn từ ${toNumber(raw?.minOrderAmount, 0)} VND`,
    discountPercent: toNumber(raw?.discountPercent, 0),
    minOrderValue: toNumber(raw?.minOrderAmount, 0),
    validFrom,
    validTo,
    isActive: activeByStatus && activeByTime && usedCount < maxUsage,
  };
};

const normalizeNotificationType = (value: unknown): NotificationType => {
  const normalized = pickString(value).toUpperCase() as NotificationType;
  return NOTIFICATION_TYPE_SET.has(normalized) ? normalized : "SYSTEM";
};

export const mapBackendNotification = (raw: BackendNotification | null | undefined): Notification => ({
  id: pickString(raw?.id, `n-${Date.now()}`),
  userId: pickString(raw?.receiver?.id ?? raw?.receiverId ?? raw?.userId),
  title: pickString(raw?.title, "Thông báo"),
  message: pickString(raw?.content ?? raw?.message),
  type: normalizeNotificationType(raw?.type),
  href: pickString(raw?.directUrl ?? raw?.href) || undefined,
  isRead: Boolean(raw?.isRead ?? raw?.read),
  createdAt: toIso(raw?.timeCreated ?? raw?.createdAt),
});