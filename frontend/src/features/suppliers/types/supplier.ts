export interface Supplier {
  id: string
  name: string
  contractInfo: string | null
  address: string | null
}

export interface SupplierQuery {
  keyword: string
  page: number
  pageSize: number
}

export interface SupplierListResponse {
  data: Supplier[]
  total: number
  page: number
  pageSize: number
}

export interface SupplierCreatePayload {
  name: string
  contractInfo: string | null
  address: string | null
}

export type SupplierUpdatePayload = SupplierCreatePayload

export interface SpringPageResponse<T> {
  content?: T[]
  number?: number
  size?: number
  totalElements?: number
}


