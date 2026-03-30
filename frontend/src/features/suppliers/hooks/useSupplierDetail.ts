import { useCallback, useEffect, useState } from 'react'
import { getSupplierById } from '@/features/suppliers/api/supplierService'
import type { Supplier } from '@/features/suppliers/types/supplier'

export function useSupplierDetail(id: string | undefined) {
  const [data, setData] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) {
      setError('Không tìm thấy mã nhà cung cấp.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await getSupplierById(id)
      setData(response)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Không thể tải chi tiết nhà cung cấp. Vui lòng thử lại.')
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

