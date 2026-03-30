import { useCallback, useEffect, useState } from 'react'
import { deleteVoucher, getVoucherList } from '@/features/vouchers/api/voucherService'
import type { Voucher, VoucherStatus } from '@/features/vouchers/types/voucher'

interface UseVoucherListOptions {
  keyword: string
  status: VoucherStatus | null
  active: boolean | null
  page: number
  pageSize: number
}

export function useVoucherList({ keyword, status, active, page, pageSize }: UseVoucherListOptions) {
  const [data, setData] = useState<Voucher[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getVoucherList({ keyword, status, active, page, pageSize })
      setData(response.data)
      setTotal(response.total)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Khong the tai danh sach voucher. Vui long thu lai.')
    } finally {
      setLoading(false)
    }
  }, [keyword, status, active, page, pageSize])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const onDelete = async (id: string) => {
    await deleteVoucher(id)
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

