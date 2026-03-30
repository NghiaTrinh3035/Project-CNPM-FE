export const Role = {
  OWNER: 'OWNER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const ROLE_LABELS: Record<Role, string> = {
  [Role.OWNER]: 'Chủ cửa hàng',
  [Role.STAFF]: 'Nhân viên',
  [Role.ADMIN]: 'Quản trị',
}


