export type WarrantyStatus = 'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED'

export interface Warranty {
  id: string
  customerPhone: string
  customerName: string
  issueDescription: string
  receivedDate: string
  expectedReturnDate: string
  status: WarrantyStatus
  technicianNote: string | null
  rejectReason: string | null
  quantity: number
  productId: string
  productName: string | null
}

export interface WarrantyQuery {
  keyword: string
  status: WarrantyStatus | null
  page: number
  pageSize: number
}

export interface WarrantyListResponse {
  data: Warranty[]
  total: number
  page: number
  pageSize: number
}

export interface WarrantyCreatePayload {
  customerPhone: string
  customerName: string
  issueDescription: string
  receivedDate: string
  expectedReturnDate: string
  status?: WarrantyStatus
  technicianNote: string | null
  quantity: number
  productId: string
}

export interface WarrantyProcessPayload {
  status: WarrantyStatus
  rejectReason: string | null
  technicianNote: string | null
}

export interface SpringPageResponse<T> {
  content?: T[]
  number?: number
  size?: number
  totalElements?: number
}

