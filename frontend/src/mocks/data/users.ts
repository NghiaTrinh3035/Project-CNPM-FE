import type { Customer, Owner, Staff, User } from "@/shared/types/domain";

export interface MockCredential {
  user: User;
  password: string;
  verified: boolean;
}

export const ownerAccount: Owner = {
  id: "u-owner-001",
  fullName: "Nguyễn Hữu Minh",
  username: "owner.minh",
  email: "owner@example.com",
  phone: "0909000100",
  role: "OWNER",
  avatar:
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
  isActive: true,
  createdAt: "2025-11-10T08:00:00.000Z",
};

export const staffAccounts: Staff[] = [
  {
    id: "u-staff-001",
    fullName: "Trần Kim Anh",
    username: "staff.kimanh",
    email: "staff@example.com",
    phone: "0909000200",
    role: "STAFF",
    department: "Order Operations",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    isActive: true,
    createdAt: "2025-11-15T08:00:00.000Z",
  },
  {
    id: "u-staff-002",
    fullName: "Lê Quốc Tuấn",
    username: "staff.tuan",
    email: "tuan.staff@example.com",
    phone: "0909000300",
    role: "STAFF",
    department: "Customer Support",
    isActive: true,
    createdAt: "2026-01-12T08:00:00.000Z",
  },
];

export const customerAccounts: Customer[] = [
  {
    id: "u-cus-001",
    fullName: "Phạm Hà Linh",
    username: "customer.linh",
    email: "customer@example.com",
    phone: "0909000400",
    role: "CUSTOMER",
    loyaltyTier: "GOLD",
    addresses: [
      {
        fullName: "Phạm Hà Linh",
        phone: "0909000400",
        province: "TP. HCM",
        district: "Quận 1",
        ward: "Bến Nghé",
        detailAddress: "23 Nguyễn Huệ",
      },
    ],
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80",
    isActive: true,
    createdAt: "2025-12-22T08:00:00.000Z",
  },
  {
    id: "u-cus-002",
    fullName: "Đoàn Minh Khoa",
    username: "customer.khoa",
    email: "khoa.customer@example.com",
    phone: "0909000500",
    role: "CUSTOMER",
    loyaltyTier: "SILVER",
    addresses: [],
    isActive: true,
    createdAt: "2026-02-04T08:00:00.000Z",
  },
];

export const authCredentials: MockCredential[] = [
  { user: customerAccounts[0], password: "Demo@123", verified: true },
  { user: staffAccounts[0], password: "Demo@123", verified: true },
  { user: ownerAccount, password: "Demo@123", verified: true },
];

export const users: User[] = [ownerAccount, ...staffAccounts, ...customerAccounts];
