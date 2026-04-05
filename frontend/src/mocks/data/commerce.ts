import type {
  Cart,
  ImportReceipt,
  Notification,
  Order,
  RevenueReport,
  StaticPageContent,
  WarrantyRequest,
} from "@/shared/types/domain";


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
    customerName: "Phạm Hà Linh",
    customerPhone: "0909000400",
    productId: "p-002",
    productName: "Omega Seamaster Diver 300M",
    quantity: 1,
    issueDescription: "Núm chỉnh giờ hơi cứng, cần kiểm tra lại chống nước.",
    images: [],
    receivedDate: "2026-03-05T09:40:00.000Z",
    expectedReturnDate: "2026-03-07T09:40:00.000Z",
    status: "PROCESSING",
    technicianNote: "Đã tiếp nhận, đang kiểm tra gioăng và núm.",
    rejectReason: null,
    createdAt: "2026-03-05T09:40:00.000Z",
    updatedAt: "2026-03-08T15:10:00.000Z",
  },
  {
    id: "w-002",
    orderId: "o-1002",
    orderItemId: "oi-1002",
    userId: "u-cus-001",
    customerName: "Phạm Hà Linh",
    customerPhone: "0909000400",
    productId: "p-004",
    productName: "Rolex Submariner Date",
    quantity: 1,
    issueDescription: "Độ chính xác lệch khoảng 20 giây/ngày.",
    images: [],
    receivedDate: "2026-03-20T12:10:00.000Z",
    expectedReturnDate: "2026-03-22T12:10:00.000Z",
    status: "RECEIVED",
    technicianNote: null,
    rejectReason: null,
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
    content: `Hiện nay, ChronoLux đang phân phối các thương hiệu đồng hồ danh tiếng trên thế giới.

Với mục tiêu đa dạng mẫu mã, cập nhật xu hướng mới nhất, đảm bảo chất lượng và giữ mức giá cạnh tranh, chúng tôi luôn trân trọng việc xây dựng mối quan hệ bền vững với khách hàng, đối tác và nhà cung cấp.

ChronoLux mong muốn hợp tác với các đối tác tiềm năng để mang đến những mẫu đồng hồ mới nhất trong tinh thần cùng có lợi và cùng phát triển.

Thành công của khách hàng chính là tương lai của ChronoLux. Đó cũng là giá trị cốt lõi gắn liền với truyền thống, uy tín và thương hiệu của chúng tôi tại TP. Hồ Chí Minh.

ChronoLux cam kết:
- Bảo hành 2 năm.
- Miễn phí thay pin 10 năm.
- Giá cả ổn định và minh bạch.`,
    updatedAt: "2026-03-11T00:00:00.000Z",
  },
  {
    id: "terms",
    title: "Điều khoản thanh toán",
    content: `A. THANH TOÁN

I. Thanh toán bằng tiền mặt
1) Mua tại cửa hàng:
Khách hàng thanh toán trực tiếp bằng tiền mặt tại cửa hàng ChronoLux.

2) Mua online:
Khách hàng thanh toán cho nhân viên giao hàng của ChronoLux hoặc đơn vị vận chuyển được chỉ định.

II. Thanh toán bằng thẻ ATM, VISA, MASTERCARD, JCB
1) Mua tại cửa hàng:
Khách hàng có thể quẹt thẻ trực tiếp tại cửa hàng ChronoLux.

2) Mua online:
Vui lòng thông báo trước nhu cầu thanh toán thẻ.
Hình thức quẹt thẻ online chỉ áp dụng với nhân viên giao hàng của ChronoLux.

III. Thanh toán bằng chuyển khoản
Thông tin tài khoản:
- Ngân hàng: Techcombank.
- Chủ tài khoản: LE NGUYEN DANG KHOA.
- Số tài khoản: 1XXXXXXXXXXX.
- Nội dung: Tên khách hàng - Số điện thoại.

Lưu ý: Ưu tiên chuyển khoản nhanh 24/7 để hệ thống xác nhận giao dịch sớm hơn.

B. TRẢ GÓP
ChronoLux hỗ trợ 01 hình thức trả góp qua thẻ tín dụng:
1) Mua tại cửa hàng: được áp dụng.
2) Mua online: chưa áp dụng.

C. CHÍNH SÁCH HOÀN TIỀN KHI THANH TOÁN TRỰC TUYẾN
Nếu thanh toán thành công nhưng phát sinh dư tiền hoặc trả hàng:
- Thẻ ATM: hoàn tiền trong tối đa 03 ngày làm việc.
- Thẻ VISA/MASTERCARD/JCB: hoàn tiền trong tối đa 05 ngày làm việc.

Nếu quá thời hạn trên chưa nhận được tiền, vui lòng liên hệ ChronoLux để được hỗ trợ đối soát với ngân hàng.`,
    updatedAt: "2026-03-11T00:00:00.000Z",
  },
  {
    id: "privacy",
    title: "Bảo vệ thông tin cá nhân khách hàng",
    content: `1. Mục đích thu thập thông tin cá nhân
Thông tin thu thập bao gồm: họ tên, địa chỉ giao hàng, số điện thoại.

Với giao dịch thanh toán trực tuyến, ChronoLux không lưu thông tin số tài khoản hoặc số thẻ ngân hàng. Dữ liệu này do cổng thanh toán lưu trữ để phục vụ đối soát.

2. Phạm vi sử dụng thông tin
Thông tin khách hàng được sử dụng để:
- Giao hàng theo đơn đặt mua.
- Gửi thông báo về trạng thái đơn hàng.
- Hỗ trợ khách hàng khi cần.
- Cung cấp thông tin sản phẩm và xử lý yêu cầu mua hàng.

3. Thời gian lưu trữ thông tin
Thông tin cá nhân được lưu trữ cho đến khi khách hàng yêu cầu xóa.

4. Tổ chức có thể tiếp cận thông tin
Thông tin được sử dụng nội bộ tại ChronoLux. Trong quá trình giao hàng, tên và địa chỉ có thể được chia sẻ cho đối tác vận chuyển uy tín (GHTK, GHN, Viettel Post, ...).`,
    updatedAt: "2026-03-11T00:00:00.000Z",
  },
  {
    id: "return-policy",
    title: "Chính sách đổi trả và bảo hành",
    content: `Trong vòng 07 ngày kể từ ngày mua hàng, khách hàng có thể yêu cầu đổi sản phẩm miễn phí.
Thời hạn 07 ngày được tính theo dấu bưu điện (nếu gửi hàng) hoặc thời điểm cửa hàng tiếp nhận yêu cầu trực tiếp.

Lưu ý quan trọng
1) Chỉ chấp nhận đổi 01 lần duy nhất, sản phẩm đổi có giá bằng hoặc cao hơn.
2) Sản phẩm cần còn mới, chưa qua sử dụng; trường hợp lỗi nhà sản xuất sẽ được hỗ trợ theo quy định.
3) Khách đã thử sản phẩm trực tiếp tại cửa hàng và đã được hướng dẫn đầy đủ có thể không thuộc đối tượng áp dụng đổi trả.

Điều kiện đổi sản phẩm
- Gửi yêu cầu trong vòng 07 ngày kể từ ngày nhận hàng.
- Đồng hồ chưa qua sử dụng, còn seal và lớp bảo vệ.
- Không trầy xước, móp méo, không có dấu hiệu sử dụng.
- Đầy đủ phụ kiện, linh kiện, hướng dẫn, quà tặng kèm (nếu có).
- Hộp đựng và bao bì còn nguyên vẹn.

Chính sách bảo hành
Điều kiện được bảo hành:
- Phiếu bảo hành hợp lệ, thông tin đầy đủ, còn thời hạn.
- Bảo hành/sửa chữa linh kiện hỏng hóc kỹ thuật, không đổi ngang sản phẩm mới.

Điều kiện không được bảo hành:
- Hư hỏng do sử dụng sai cách, va đập, tai nạn, lão hóa tự nhiên.
- Hư hỏng do thao tác sai khi sử dụng dưới nước hoặc điều chỉnh sai quy cách.
- Trầy xước, vỡ mặt kính, hư hỏng ngoại quan do quá trình sử dụng.
- Tự ý mở máy hoặc sửa chữa tại đơn vị không thuộc hệ thống bảo hành.`,
    updatedAt: "2026-03-11T00:00:00.000Z",
  },
];
