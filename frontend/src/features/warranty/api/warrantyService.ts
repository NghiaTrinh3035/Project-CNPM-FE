import { axiosClient } from '@/lib/axiosClient'
import { parseApiErrorMessage } from '@/lib/apiError'
import type {
  SpringPageResponse,
  Warranty,
  WarrantyCreatePayload,
  WarrantyListResponse,
  WarrantyProcessPayload,
  WarrantyQuery,
} from '@/features/warranty/types/warranty'

function normalizeNullable(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeWarranty(input: Warranty): Warranty {
  return {
    ...input,
    technicianNote: normalizeNullable(input.technicianNote),
    rejectReason: normalizeNullable(input.rejectReason),
    productName: normalizeNullable(input.productName),
  }
}

export async function getWarrantyList(query: WarrantyQuery): Promise<WarrantyListResponse> {
  const normalizedKeyword = query.keyword.trim()
  const page = Math.max(query.page - 1, 0)

  try {
    const { data } = await axiosClient.get<SpringPageResponse<Warranty>>(
      normalizedKeyword || query.status ? '/warranties/search' : '/warranties',
      {
        params: {
          page,
          size: query.pageSize,
          ...(normalizedKeyword ? { keyword: normalizedKeyword } : {}),
          ...(query.status ? { status: query.status } : {}),
        },
      },
    )

    const content = Array.isArray(data.content) ? data.content.map(normalizeWarranty) : []

    return {
      data: content,
      total: typeof data.totalElements === 'number' ? data.totalElements : 0,
      page: typeof data.number === 'number' ? data.number + 1 : 1,
      pageSize: typeof data.size === 'number' ? data.size : query.pageSize,
    }
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tải danh sách bảo hành. Vui lòng thử lại.'))
  }
}

export async function getWarrantyById(id: string): Promise<Warranty> {
  try {
    const { data } = await axiosClient.get<Warranty>(`/warranties/${id}`)
    return normalizeWarranty(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tải chi tiết bảo hành. Vui lòng thử lại.'))
  }
}

export async function createWarranty(payload: WarrantyCreatePayload): Promise<Warranty> {
  try {
    const { data } = await axiosClient.post<Warranty>('/warranties', payload)
    return normalizeWarranty(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tạo phiếu bảo hành. Vui lòng thử lại.'))
  }
}

export async function updateWarrantyStatus(id: string, payload: WarrantyProcessPayload): Promise<Warranty> {
  try {
    const { data } = await axiosClient.patch<Warranty>(`/warranties/${id}/status`, payload)
    return normalizeWarranty(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể cập nhật trạng thái bảo hành. Vui lòng thử lại.'))
  }
}

