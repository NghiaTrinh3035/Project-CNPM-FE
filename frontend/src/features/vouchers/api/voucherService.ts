import { axiosClient } from '@/lib/axiosClient'
import { parseApiErrorMessage } from '@/lib/apiError'
import type {
  SpringPageResponse,
  Voucher,
  VoucherCreatePayload,
  VoucherListResponse,
  VoucherQuery,
  VoucherStatusUpdatePayload,
  VoucherUpdatePayload,
} from '@/features/vouchers/types/voucher'

function normalizeVoucher(input: Voucher): Voucher {
  return {
    id: input.id,
    code: input.code,
    discountPercent: input.discountPercent,
    isUsed: Boolean(input.isUsed),
    validFrom: input.validFrom,
    validTo: input.validTo,
    usedAt: input.usedAt ?? null,
    quantity: input.quantity,
    status: input.status,
  }
}

function toQueryParams(query: VoucherQuery): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: Math.max(query.page - 1, 0),
    size: query.pageSize,
  }

  const keyword = query.keyword.trim()
  if (keyword) {
    params.keyword = keyword
  }
  if (query.status) {
    params.status = query.status
  }
  if (typeof query.active === 'boolean') {
    params.active = query.active
  }

  return params
}

export async function getVoucherList(query: VoucherQuery): Promise<VoucherListResponse> {
  try {
    const { data } = await axiosClient.get<SpringPageResponse<Voucher>>('/vouchers', {
      params: toQueryParams(query),
    })

    return {
      data: Array.isArray(data.content) ? data.content.map(normalizeVoucher) : [],
      total: typeof data.totalElements === 'number' ? data.totalElements : 0,
      page: typeof data.number === 'number' ? data.number + 1 : 1,
      pageSize: typeof data.size === 'number' ? data.size : query.pageSize,
    }
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Khong the tai danh sach voucher. Vui long thu lai.'))
  }
}

export async function getVoucherById(id: string): Promise<Voucher> {
  try {
    const { data } = await axiosClient.get<Voucher>(`/vouchers/${id}`)
    return normalizeVoucher(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Khong the tai chi tiet voucher. Vui long thu lai.'))
  }
}

export async function createVoucher(payload: VoucherCreatePayload): Promise<Voucher> {
  try {
    const { data } = await axiosClient.post<Voucher>('/vouchers', payload)
    return normalizeVoucher(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Khong the tao voucher. Vui long thu lai.'))
  }
}

export async function updateVoucher(id: string, payload: VoucherUpdatePayload): Promise<Voucher> {
  try {
    const { data } = await axiosClient.put<Voucher>(`/vouchers/${id}`, payload)
    return normalizeVoucher(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Khong the cap nhat voucher. Vui long thu lai.'))
  }
}

export async function updateVoucherStatus(id: string, payload: VoucherStatusUpdatePayload): Promise<Voucher> {
  try {
    const { data } = await axiosClient.patch<Voucher>(`/vouchers/${id}/status`, payload)
    return normalizeVoucher(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Khong the cap nhat trang thai voucher. Vui long thu lai.'))
  }
}

export async function deleteVoucher(id: string): Promise<void> {
  try {
    await axiosClient.delete(`/vouchers/${id}`)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Khong the xoa voucher. Vui long thu lai.'))
  }
}

