export type UserGender = 'MALE' | 'FEMALE' | 'OTHER'
export type UserRole = 'CUSTOMER' | 'STAFF' | 'OWNER'

export interface Staff {
  id: string
  username: string
  fullName: string
  email: string
  phone: string | null
  address: string | null
  gender: UserGender | null
  role: UserRole
  staffId: string
  joinDate: string | null
  createdAt: string | null
}

export interface StaffQuery {
  keyword: string
  page: number
  pageSize: number
}

export interface StaffCreatePayload {
  username: string
  password: string
  fullName: string
  email: string
  phone: string | null
  address: string | null
  gender: UserGender | null
  role?: UserRole
  staffId: string
}

export interface StaffUpdatePayload {
  fullName: string
  email: string
  phone: string | null
  address: string | null
  gender: UserGender | null
  staffId: string
}

export interface StaffListResponse {
  data: Staff[]
  total: number
  page: number
  pageSize: number
}

export interface SpringPageResponse<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
}

