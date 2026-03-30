import {
  BarChart3,
  Package,
  Percent,
  ShieldCheck,
  Truck,
  UserRoundCog,
  Users,
} from 'lucide-react'
import { ROUTES } from '@/routes/paths'
import { Role } from '@/types/role'

export interface MenuItemConfig {
  label: string
  to: string
  allowedRoles: Role[]
  icon: typeof Users
}

export const MENU_ITEMS: MenuItemConfig[] = [
  {
    label: 'Nhân viên',
    to: ROUTES.staffList,
    allowedRoles: [Role.OWNER],
    icon: UserRoundCog,
  },
  {
    label: 'Sản phẩm',
    to: ROUTES.products,
    allowedRoles: [Role.OWNER, Role.STAFF],
    icon: Package,
  },
  {
    label: 'Bảo hành',
    to: ROUTES.warranty,
    allowedRoles: [Role.OWNER, Role.STAFF],
    icon: ShieldCheck,
  },
  {
    label: 'Khách hàng',
    to: ROUTES.customers,
    allowedRoles: [Role.OWNER, Role.STAFF],
    icon: Users,
  },
  {
    label: 'Nhà cung cấp',
    to: ROUTES.suppliers,
    allowedRoles: [Role.OWNER, Role.ADMIN],
    icon: Truck,
  },
  {
    label: 'Khuyến mãi',
    to: ROUTES.vouchers,
    allowedRoles: [Role.OWNER],
    icon: Percent,
  },
  {
    label: 'Báo cáo & Thống kê',
    to: ROUTES.reports,
    allowedRoles: [Role.OWNER],
    icon: BarChart3,
  },
]


