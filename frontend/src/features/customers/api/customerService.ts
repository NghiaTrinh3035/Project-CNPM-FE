import { axiosClient } from '@/lib/axiosClient'
import { parseApiErrorMessage } from '@/lib/apiError'
import type {
  Customer,
  CustomerCreatePayload,
  CustomerListResponse,
  CustomerQuery,
  CustomerUpdatePayload,
  SpringPageResponse,
} from '@/features/customers/types/customer'

function normalizeNullable(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeCustomer(input: Customer): Customer {
  return {
    ...input,
    phone: normalizeNullable(input.phone),
    createdAt: input.createdAt ?? null,
  }
}

function hasSearchFilters(query: CustomerQuery): boolean {
  return Boolean(query.fullName.trim() || query.email.trim() || query.phone.trim() || query.address.trim())
}

export async function getCustomerList(query: CustomerQuery): Promise<CustomerListResponse> {
  const page = Math.max(query.page - 1, 0)
  const useSearch = hasSearchFilters(query)

  try {
    const { data } = useSearch
      ? await axiosClient.get<SpringPageResponse<Customer>>('/customers/search', {
          params: {
            fullName: query.fullName.trim() || undefined,
            email: query.email.trim() || undefined,
            phone: query.phone.trim() || undefined,
            address: query.address.trim() || undefined,
            page,
            size: query.pageSize,
          },
        })
      : await axiosClient.get<SpringPageResponse<Customer>>('/customers', {
          params: {
            page,
            size: query.pageSize,
          },
        })

    return {
      data: Array.isArray(data.content) ? data.content.map(normalizeCustomer) : [],
      total: typeof data.totalElements === 'number' ? data.totalElements : 0,
      page: typeof data.number === 'number' ? data.number + 1 : 1,
      pageSize: typeof data.size === 'number' ? data.size : query.pageSize,
    }
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tải danh sách khách hàng. Vui lòng thử lại.'))
  }
}

export async function getCustomerById(id: string): Promise<Customer> {
  try {
    const { data } = await axiosClient.get<Customer>(`/customers/${id}`)
    return normalizeCustomer(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tải thông tin khách hàng. Vui lòng thử lại.'))
  }
}

export async function createCustomer(payload: CustomerCreatePayload): Promise<Customer> {
  try {
    const { data } = await axiosClient.post<Customer>('/customers', payload)
    return normalizeCustomer(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tạo khách hàng. Vui lòng thử lại.'))
  }
}

export async function updateCustomer(id: string, payload: CustomerUpdatePayload): Promise<Customer> {
  try {
    const { data } = await axiosClient.put<Customer>(`/customers/${id}`, payload)
    return normalizeCustomer(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể cập nhật khách hàng. Vui lòng thử lại.'))
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  try {
    await axiosClient.delete(`/customers/${id}`)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể xóa khách hàng. Vui lòng thử lại.'))
  }
}

