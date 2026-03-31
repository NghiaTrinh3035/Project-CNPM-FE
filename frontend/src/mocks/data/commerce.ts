import type {
  Cart,
  ImportReceipt,
  Notification,
  Order,
  RevenueReport,
  StaticPageContent,
  Supplier,
  Voucher,
  WarrantyRequest,
} from "@/shared/types/domain";

export const vouchers: Voucher[] = [
  {
    id: "v-001",
    code: "LUXURY10",
    title: "Ưu đãi khách hàng thành viên",
    description: "Giảm 10% cho đơn từ 20 triệu.",
    discountPercent: 10,
    minOrderValue: 20_000_000,
    validFrom: "2026-03-01T00:00:00.000Z",
    validTo: "2026-06-01T00:00:00.000Z",
    isActive: true,
  },
  {
    id: "v-002",
    code: "WELCOME5",
    title: "Ưu đãi khách hàng mới",
    description: "Giảm 5% tối đa 2 triệu.",
    discountPercent: 5,
    minOrderValue: 5_000_000,
    validFrom: "2026-01-01T00:00:00.000Z",
    validTo: "2026-12-31T00:00:00.000Z",
    isActive: true,
  },
];

export const carts: Cart[] = [
  {
    id: "c-001",
    userId: "u-cus-001",
    items: [
      {
        id: "ci-001",
        productId: "p-004",
        quantity: 1,
        unitPrice: 21_500_000,
      },
      {
        id: "ci-002",
        productId: "p-011",
        quantity: 1,
        unitPrice: 24_500_000,
      },
    ],
    voucherCode: "WELCOME5",
    updatedAt: "2026-03-20T14:00:00.000Z",
  },
];

export const orders: Order[] = [
  {
    id: "o-1001",
    userId: "u-cus-001",
    items: [
      {
        id: "oi-1001",
        productId: "p-002",
        productName: "Omega Seamaster Diver 300M",
        productImage:
          "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unitPrice: 172_000_000,
      },
    ],
    status: "COMPLETED",
    timeline: [
      { status: "PENDING", at: "2026-01-03T03:00:00.000Z" },
      { status: "CONFIRMED", at: "2026-01-03T06:30:00.000Z" },
      { status: "DELIVERED", at: "2026-01-06T10:00:00.000Z" },
      { status: "COMPLETED", at: "2026-01-10T09:00:00.000Z" },
    ],
    subtotal: 172_000_000,
    discount: 8_600_000,
    shippingFee: 0,
    total: 163_400_000,
    voucherCode: "WELCOME5",
    payment: {
      method: "BANK_TRANSFER",
      status: "PAID",
      paidAt: "2026-01-03T03:10:00.000Z",
      transactionCode: "FT123456789",
    },
    shipping: {
      address: {
        fullName: "Phạm Hà Linh",
        phone: "0909000400",
        province: "TP. HCM",
        district: "Quận 1",
        ward: "Bến Nghé",
        detailAddress: "23 Nguyễn Huệ",
      },
      note: "Giao giờ hành chính",
      trackingCode: "GHN88993322",
      estimatedDelivery: "2026-01-06T00:00:00.000Z",
    },
    createdAt: "2026-01-03T02:40:00.000Z",
  },
  {
    id: "o-1002",
    userId: "u-cus-001",
    items: [
      {
        id: "oi-1002",
        productId: "p-004",
        productName: "Tissot PRX Powermatic 80",
        productImage:
          "https://images.unsplash.com/photo-1631089850339-215f0f97b13b?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unitPrice: 21_500_000,
      },
    ],
    status: "DELIVERED",
    timeline: [
      { status: "PENDING", at: "2026-01-20T08:00:00.000Z" },
      { status: "CONFIRMED", at: "2026-01-20T10:00:00.000Z" },
      { status: "DELIVERED", at: "2026-01-23T09:15:00.000Z" },
    ],
    subtotal: 21_500_000,
    discount: 1_075_000,
    shippingFee: 0,
    total: 20_425_000,
    voucherCode: "WELCOME5",
    payment: {
      method: "COD",
      status: "PAID",
      paidAt: "2026-01-23T09:15:00.000Z",
    },
    shipping: {
      address: {
        fullName: "Phạm Hà Linh",
        phone: "0909000400",
        province: "TP. HCM",
        district: "Quận 1",
        ward: "Bến Nghé",
        detailAddress: "23 Nguyễn Huệ",
      },
      trackingCode: "JNT99882211",
    },
    createdAt: "2026-01-20T07:40:00.000Z",
  },
  {
    id: "o-1003",
    userId: "u-cus-002",
    items: [
      {
        id: "oi-1003",
        productId: "p-010",
        productName: "Hamilton Khaki Field Auto 42",
        productImage:
          "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unitPrice: 19_800_000,
      },
    ],
    status: "CONFIRMED",
    timeline: [
      { status: "PENDING", at: "2026-03-01T07:00:00.000Z" },
      { status: "CONFIRMED", at: "2026-03-01T11:00:00.000Z" },
    ],
    subtotal: 19_800_000,
    discount: 0,
    shippingFee: 0,
    total: 19_800_000,
    payment: {
      method: "BANK_TRANSFER",
      status: "PAID",
      paidAt: "2026-03-01T07:05:00.000Z",
    },
    shipping: {
      address: {
        fullName: "Đoàn Minh Khoa",
        phone: "0909000500",
        province: "Đà Nẵng",
        district: "Hải Châu",
        ward: "Thạch Thang",
        detailAddress: "12 Lê Lợi",
      },
      trackingCode: "VNPOST77112233",
      estimatedDelivery: "2026-03-05T00:00:00.000Z",
    },
    createdAt: "2026-03-01T06:50:00.000Z",
  },
  {
    id: "o-1004",
    userId: "u-cus-001",
    items: [
      {
        id: "oi-1004",
        productId: "p-008",
        productName: "Citizen Tsuyosa NJ015",
        productImage:
          "https://images.unsplash.com/photo-1617043786394-f977fa12eddf?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unitPrice: 11_500_000,
      },
    ],
    status: "PENDING",
    timeline: [{ status: "PENDING", at: "2026-03-21T08:30:00.000Z" }],
    subtotal: 11_500_000,
    discount: 575_000,
    shippingFee: 0,
    total: 10_925_000,
    voucherCode: "WELCOME5",
    payment: {
      method: "COD",
      status: "UNPAID",
    },
    shipping: {
      address: {
        fullName: "Phạm Hà Linh",
        phone: "0909000400",
        province: "TP. HCM",
        district: "Quận 1",
        ward: "Bến Nghé",
        detailAddress: "23 Nguyễn Huệ",
      },
    },
    createdAt: "2026-03-21T08:30:00.000Z",
  },
];

export const warrantyRequests: WarrantyRequest[] = [
  {
    id: "w-001",
    orderId: "o-1001",
    orderItemId: "oi-1001",
    userId: "u-cus-001",
    productId: "p-002",
    description: "Núm chỉnh giờ hơi cứng, cần kiểm tra lại chống nước.",
    images: [],
    status: "PROCESSING",
    technicianNote: "Đã tiếp nhận, đang kiểm tra gioăng và núm.",
    createdAt: "2026-03-05T09:40:00.000Z",
    updatedAt: "2026-03-08T15:10:00.000Z",
  },
  {
    id: "w-002",
    orderId: "o-1002",
    orderItemId: "oi-1002",
    userId: "u-cus-001",
    productId: "p-004",
    description: "Độ chính xác lệch khoảng 20 giây/ngày.",
    images: [],
    status: "RECEIVED",
    createdAt: "2026-03-20T12:10:00.000Z",
    updatedAt: "2026-03-20T12:10:00.000Z",
  },
];

export const notifications: Notification[] = [
  {
    id: "n-001",
    userId: "u-cus-001",
    title: "Đơn hàng #o-1004 đã được tạo",
    message: "Đơn hàng của bạn đang chờ xác nhận từ cửa hàng.",
    type: "ORDER",
    href: "/orders/o-1004",
    isRead: false,
    createdAt: "2026-03-21T08:31:00.000Z",
  },
  {
    id: "n-002",
    userId: "u-cus-001",
    title: "Bảo hành #w-001 đang xử lý",
    message: "Kỹ thuật viên đã tiếp nhận sản phẩm và đang kiểm tra.",
    type: "WARRANTY",
    href: "/warranty",
    isRead: false,
    createdAt: "2026-03-08T15:12:00.000Z",
  },
  {
    id: "n-003",
    userId: "u-cus-001",
    title: "Ưu đãi cuối tuần",
    message: "Sử dụng mã LUXURY10 cho đơn từ 20 triệu.",
    type: "PROMOTION",
    href: "/shop",
    isRead: true,
    createdAt: "2026-03-18T02:00:00.000Z",
  },
];

export const suppliers: Supplier[] = [
  {
    id: "s-001",
    name: "Swiss Prestige Distribution",
    contactName: "Mr. Adrian Keller",
    phone: "+41-22-123-456",
    email: "adrian@swissprestige.ch",
    address: "Rue du Rhone 36, Geneve, Switzerland",
    isActive: true,
  },
  {
    id: "s-002",
    name: "Japan Watch Group",
    contactName: "Ms. Aiko Tanaka",
    phone: "+81-3-2233-8899",
    email: "aiko@jwg.jp",
    address: "2-11 Ginza, Chuo, Tokyo, Japan",
    isActive: true,
  },
];

export const importReceipts: ImportReceipt[] = [
  {
    id: "ir-001",
    supplierId: "s-001",
    importedAt: "2026-02-15T03:00:00.000Z",
    details: [
      { id: "ird-001", productId: "p-001", quantity: 3, unitCost: 250_000_000 },
      { id: "ird-002", productId: "p-017", quantity: 2, unitCost: 168_000_000 },
    ],
    note: "Đợt nhập quý I dòng cao cấp",
  },
  {
    id: "ir-002",
    supplierId: "s-002",
    importedAt: "2026-03-04T03:00:00.000Z",
    details: [
      { id: "ird-003", productId: "p-004", quantity: 15, unitCost: 16_000_000 },
      { id: "ird-004", productId: "p-008", quantity: 20, unitCost: 8_900_000 },
    ],
  },
];

export const revenueReports: RevenueReport[] = [
  { period: "Tháng 10", revenue: 520_000_000, orders: 18 },
  { period: "Tháng 11", revenue: 660_000_000, orders: 22 },
  { period: "Tháng 12", revenue: 940_000_000, orders: 31 },
  { period: "Tháng 01", revenue: 810_000_000, orders: 27 },
  { period: "Tháng 02", revenue: 770_000_000, orders: 26 },
  { period: "Tháng 03", revenue: 990_000_000, orders: 35 },
];

export const staticContentPages: StaticPageContent[] = [
  {
    id: "about",
    title: "Về ChronoLux",
    content:
      "ChronoLux là đơn vị phân phối đồng hồ chính hãng, tập trung vào trải nghiệm mua sắm cao cấp và dịch vụ hậu mãi minh bạch.",
    updatedAt: "2026-03-11T00:00:00.000Z",
  },
  {
    id: "terms",
    title: "Điều khoản dịch vụ",
    content:
      "Khi sử dụng website, khách hàng đồng ý với các điều khoản về thanh toán, vận chuyển, bảo mật thông tin và chính sách hậu mãi.",
    updatedAt: "2026-03-11T00:00:00.000Z",
  },
  {
    id: "privacy",
    title: "Chính sách bảo mật",
    content:
      "Chúng tôi chỉ thu thập dữ liệu cần thiết để xử lý đơn hàng và nâng cao trải nghiệm, không chia sẻ thông tin cho bên thứ ba trái phép.",
    updatedAt: "2026-03-11T00:00:00.000Z",
  },
  {
    id: "return-policy",
    title: "Chính sách đổi trả và bảo hành",
    content:
      "Hỗ trợ đổi trả theo điều kiện hãng và bảo hành chính hãng theo thời hạn trên thẻ bảo hành hoặc hóa đơn mua hàng.",
    updatedAt: "2026-03-11T00:00:00.000Z",
  },
];
