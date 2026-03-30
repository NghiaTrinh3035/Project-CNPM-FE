import { useCallback, useEffect, useState } from 'react'
import { getCustomerById } from '@/features/customers/api/customerService'
import type { Customer } from '@/features/customers/types/customer'

export function useCustomerDetail(id: string | undefined) {
  const [data, setData] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) {
      setError('Không tìm thấy mã khách hàng.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await getCustomerById(id)
      setData(response)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Không thể tải thông tin khách hàng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    reload: fetchData,
  }
}

