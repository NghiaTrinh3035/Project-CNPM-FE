import { useCallback, useEffect, useState } from 'react'
import { deleteCustomer, getCustomerList } from '@/features/customers/api/customerService'
import type { Customer } from '@/features/customers/types/customer'

interface UseCustomerListOptions {
  fullName: string
  email: string
  phone: string
  address: string
  page: number
  pageSize: number
}

export function useCustomerList({ fullName, email, phone, address, page, pageSize }: UseCustomerListOptions) {
  const [data, setData] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getCustomerList({ fullName, email, phone, address, page, pageSize })
      setData(response.data)
      setTotal(response.total)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Không thể tải danh sách khách hàng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [fullName, email, phone, address, page, pageSize])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const onDelete = async (id: string) => {
    await deleteCustomer(id)
    await fetchData()
  }

  return {
    data,
    total,
    loading,
    error,
    reload: fetchData,
    onDelete,
  }
}

