import { useCallback, useEffect, useState } from 'react'
import { getWarrantyList } from '@/features/warranty/api/warrantyService'
import type { Warranty, WarrantyStatus } from '@/features/warranty/types/warranty'

interface UseWarrantyListOptions {
  keyword: string
  status: WarrantyStatus | null
  page: number
  pageSize: number
}

export function useWarrantyList({ keyword, status, page, pageSize }: UseWarrantyListOptions) {
  const [data, setData] = useState<Warranty[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getWarrantyList({ keyword, status, page, pageSize })
      setData(response.data)
      setTotal(response.total)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Không thể tải danh sách bảo hành. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [keyword, status, page, pageSize])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return {
    data,
    total,
    loading,
    error,
    reload: fetchData,
  }
}

