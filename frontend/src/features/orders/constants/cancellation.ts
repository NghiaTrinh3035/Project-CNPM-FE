import type { OrderCancellationReason } from "@/shared/types/domain";

export const ORDER_CANCELLATION_REASONS: Array<{
  value: OrderCancellationReason;
  label: string;
}> = [
  { value: "WRONG_PRODUCT", label: "Đặt nhầm sản phẩm" },
  { value: "BETTER_PRICE", label: "Tìm thấy giá tốt hơn" },
  { value: "DONT_NEED_ANYMORE", label: "Không còn nhu cầu" },
  { value: "CHANGED_MIND", label: "Thay đổi ý định" },
  { value: "DELIVERY_TOO_LONG", label: "Thời gian giao hàng quá lâu" },
  { value: "OTHER", label: "Khác" },
];
