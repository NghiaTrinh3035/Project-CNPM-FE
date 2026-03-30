export type VoucherStatus = 'ACTIVE' | 'EXPIRED' | 'USED_UP'

export interface Voucher {
  id: string
  code: string
  discountPercent: number
  isUsed: boolean
  validFrom: string
  validTo: string
  usedAt: string | null
  quantity: number
  status: VoucherStatus
}

export interface VoucherQuery {
  keyword: string
  status: VoucherStatus | null
  active: boolean | null
  page: number
  pageSize: number
}

export interface VoucherListResponse {
  data: Voucher[]
  total: number
  page: number
  pageSize: number
}

export interface VoucherCreatePayload {
  code: string
  discountPercent: number
  validFrom: string
  validTo: string
  quantity: number
  status: VoucherStatus | null
}

export type VoucherUpdatePayload = VoucherCreatePayload

export interface VoucherStatusUpdatePayload {
  status?: VoucherStatus
  active?: boolean
}

export interface SpringPageResponse<T> {
  content?: T[]
  number?: number
  size?: number
  totalElements?: number
}


