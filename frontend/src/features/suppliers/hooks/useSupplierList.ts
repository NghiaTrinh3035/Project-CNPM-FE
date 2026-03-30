import { useCallback, useEffect, useState } from 'react'
import { deleteSupplier, getSupplierList } from '@/features/suppliers/api/supplierService'
import type { Supplier } from '@/features/suppliers/types/supplier'

interface UseSupplierListOptions {
  keyword: string
  page: number
  pageSize: number
}

export function useSupplierList({ keyword, page, pageSize }: UseSupplierListOptions) {
  const [data, setData] = useState<Supplier[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getSupplierList({ keyword, page, pageSize })
      setData(response.data)
      setTotal(response.total)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Không thể tải danh sách nhà cung cấp. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [keyword, page, pageSize])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const onDelete = async (id: string) => {
    await deleteSupplier(id)
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

