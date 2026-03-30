import { axiosClient } from '@/lib/axiosClient'
import { parseApiErrorMessage } from '@/lib/apiError'
import type {
  SpringPageResponse,
  Supplier,
  SupplierCreatePayload,
  SupplierListResponse,
  SupplierQuery,
  SupplierUpdatePayload,
} from '@/features/suppliers/types/supplier'

function normalizeNullable(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeSupplier(input: Supplier): Supplier {
  return {
    id: input.id,
    name: input.name,
    contractInfo: normalizeNullable(input.contractInfo),
    address: normalizeNullable(input.address),
  }
}

export async function getSupplierList(query: SupplierQuery): Promise<SupplierListResponse> {
  const normalizedKeyword = query.keyword.trim()
  const page = Math.max(query.page - 1, 0)

  try {
    const { data } = normalizedKeyword
      ? await axiosClient.get<SpringPageResponse<Supplier>>('/suppliers/search', {
          params: {
            keyword: normalizedKeyword,
            page,
            size: query.pageSize,
          },
        })
      : await axiosClient.get<SpringPageResponse<Supplier>>('/suppliers', {
          params: {
            page,
            size: query.pageSize,
          },
        })

    return {
      data: Array.isArray(data.content) ? data.content.map(normalizeSupplier) : [],
      total: typeof data.totalElements === 'number' ? data.totalElements : 0,
      page: typeof data.number === 'number' ? data.number + 1 : 1,
      pageSize: typeof data.size === 'number' ? data.size : query.pageSize,
    }
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tải danh sách nhà cung cấp. Vui lòng thử lại.'))
  }
}

export async function getSupplierById(id: string): Promise<Supplier> {
  try {
    const { data } = await axiosClient.get<Supplier>(`/suppliers/${id}`)
    return normalizeSupplier(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tải chi tiết nhà cung cấp. Vui lòng thử lại.'))
  }
}

export async function createSupplier(payload: SupplierCreatePayload): Promise<Supplier> {
  try {
    const { data } = await axiosClient.post<Supplier>('/suppliers', payload)
    return normalizeSupplier(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tạo nhà cung cấp. Vui lòng thử lại.'))
  }
}

export async function updateSupplier(id: string, payload: SupplierUpdatePayload): Promise<Supplier> {
  try {
    const { data } = await axiosClient.put<Supplier>(`/suppliers/${id}`, payload)
    return normalizeSupplier(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể cập nhật nhà cung cấp. Vui lòng thử lại.'))
  }
}

export async function deleteSupplier(id: string): Promise<void> {
  try {
    await axiosClient.delete(`/suppliers/${id}`)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể xóa nhà cung cấp. Vui lòng thử lại.'))
  }
}

