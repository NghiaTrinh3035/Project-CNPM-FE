import type { UserRole } from "@/shared/types/domain";

export interface DemoAccount {
  email: string;
  password: string;
  role: UserRole;
  note: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "customer@example.com",
    password: "Demo@123",
    role: "CUSTOMER",
    note: "Khách hàng đã đăng ký",
  },
  {
    email: "staff@example.com",
    password: "Demo@123",
    role: "STAFF",
    note: "Nhân viên vận hành đơn hàng và bảo hành",
  },
  {
    email: "owner@example.com",
    password: "Demo@123",
    role: "OWNER",
    note: "Chủ cửa hàng quản trị tổng thể",
  },
];
