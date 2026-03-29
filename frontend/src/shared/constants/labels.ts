import type { OrderStatus, PaymentMethod, ProductStatus, WarrantyStatus } from "@/shared/types/domain";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  RETURNED: "Hoàn trả",
};

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  ACTIVE: "Đang bán",
  OUT_OF_STOCK: "Hết hàng",
  DISCONTINUED: "Ngừng kinh doanh",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  E_WALLET: "Ví điện tử",
};

export const WARRANTY_STATUS_LABEL: Record<WarrantyStatus, string> = {
  RECEIVED: "Đã tiếp nhận",
  PROCESSING: "Đang xử lý",
  REJECTED: "Từ chối",
  COMPLETED: "Hoàn tất",
};
