export type UserGender = 'MALE' | 'FEMALE' | 'OTHER'
export type UserRole = 'CUSTOMER' | 'STAFF' | 'OWNER'

export interface Customer {
  id: string
  username: string
  fullName: string
  email: string
  phone: string | null
  address: string
  gender: UserGender | null
  role: UserRole
  createdAt: string | null
}

export interface CustomerQuery {
  fullName: string
  email: string
  phone: string
  address: string
  page: number
  pageSize: number
}

export interface CustomerCreatePayload {
  username: string
  password: string
  fullName: string
  email: string
  phone: string | null
  address: string
  gender: UserGender | null
}

export interface CustomerUpdatePayload {
  fullName: string
  email: string
  phone: string | null
  address: string
  gender: UserGender | null
}

export interface CustomerListResponse {
  data: Customer[]
  total: number
  page: number
  pageSize: number
}

export interface SpringPageResponse<T> {
  content?: T[]
  number?: number
  size?: number
  totalElements?: number
}

