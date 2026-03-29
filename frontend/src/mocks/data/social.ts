import type { DiscussionComment, Review, SupportTicket } from "@/shared/types/domain";

export const reviews: Review[] = [
  {
    id: "r-001",
    userId: "u-cus-001",
    productId: "p-004",
    orderId: "o-1002",
    rating: 5,
    content: "Đồng hồ đẹp hơn ảnh, đeo lên tay rất sang và nhẹ. Máy chạy ổn định.",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "r-002",
    userId: "u-cus-001",
    productId: "p-002",
    orderId: "o-1001",
    rating: 5,
    content: "Chống nước tốt, hoàn thiện cao cấp, dịch vụ giao hàng chuyên nghiệp.",
    createdAt: "2026-01-12T15:20:00.000Z",
  },
  {
    id: "r-003",
    userId: "u-cus-002",
    productId: "p-010",
    orderId: "o-1003",
    rating: 4,
    content: "Thiết kế đẹp, mặt số dễ đọc. Dây da hơi cứng lúc mới đeo.",
    createdAt: "2026-03-03T08:30:00.000Z",
  },
];

export const discussionComments: DiscussionComment[] = [
  {
    id: "d-001",
    productId: "p-004",
    userId: "u-cus-002",
    content: "Mẫu này đeo cổ tay 16cm có vừa không shop?",
    createdAt: "2026-03-04T08:20:00.000Z",
  },
  {
    id: "d-002",
    productId: "p-004",
    userId: "u-staff-001",
    parentId: "d-001",
    content: "Chào bạn, cổ tay 16cm đeo vừa đẹp, chúng tôi có hỗ trợ cắt mắt dây miễn phí.",
    createdAt: "2026-03-04T08:45:00.000Z",
  },
  {
    id: "d-003",
    productId: "p-002",
    userId: "u-cus-001",
    content: "Có hỗ trợ trả góp cho mẫu này không?",
    createdAt: "2026-03-11T10:10:00.000Z",
    aiHandled: true,
  },
];

export const supportTickets: SupportTicket[] = [
  {
    id: "t-001",
    userId: "u-cus-001",
    title: "Cần tư vấn size dây cho Omega",
    status: "IN_PROGRESS",
    channel: "AI",
    createdAt: "2026-03-10T09:10:00.000Z",
  },
  {
    id: "t-002",
    userId: "u-cus-002",
    title: "Hỏi về bảo hành chống nước",
    status: "OPEN",
    channel: "STAFF",
    createdAt: "2026-03-17T15:50:00.000Z",
  },
];

export const testimonials = [
  {
    id: "tm-001",
    name: "Anh Duy, TP.HCM",
    quote:
      "Từ tư vấn AI đến giao hàng đều chuyên nghiệp. Trải nghiệm mua đồng hồ cao cấp rất đáng giá.",
  },
  {
    id: "tm-002",
    name: "Chị Mai, Hà Nội",
    quote:
      "Sản phẩm chính hãng, đóng gói đẹp, hỗ trợ bảo hành rõ ràng. Mình rất yên tâm khi mua quà tặng.",
  },
  {
    id: "tm-003",
    name: "Anh Trường, Đà Nẵng",
    quote:
      "So sánh thông số và chat AI giúp mình chọn được mẫu đúng nhu cầu chỉ trong 10 phút.",
  },
];
