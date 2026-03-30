import { useCallback, useEffect, useState } from 'react'
import { getVoucherById } from '@/features/vouchers/api/voucherService'
import type { Voucher } from '@/features/vouchers/types/voucher'

export function useVoucherDetail(id: string | undefined) {
  const [data, setData] = useState<Voucher | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) {
      setError('Khong tim thay ma voucher.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await getVoucherById(id)
      setData(response)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Khong the tai chi tiet voucher. Vui long thu lai.')
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

