import { useCallback, useEffect, useState } from 'react'
import { getWarrantyById } from '@/features/warranty/api/warrantyService'
import type { Warranty } from '@/features/warranty/types/warranty'

export function useWarrantyDetail(id: string | undefined) {
  const [data, setData] = useState<Warranty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) {
      setData(null)
      setError('Không tìm thấy mã phiếu bảo hành.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await getWarrantyById(id)
      setData(response)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Không thể tải chi tiết bảo hành. Vui lòng thử lại.')
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

