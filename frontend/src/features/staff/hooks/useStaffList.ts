import { useCallback, useEffect, useState } from 'react'
import { deleteStaff, getStaffList } from '@/features/staff/api/staffService'
import type { Staff } from '@/features/staff/types/staff'

interface UseStaffListOptions {
  keyword: string
  page: number
  pageSize: number
}

export function useStaffList({ keyword, page, pageSize }: UseStaffListOptions) {
  const [data, setData] = useState<Staff[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getStaffList({ keyword, page, pageSize })
      setData(response.data)
      setTotal(response.total)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể tải danh sách nhân viên. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [keyword, page, pageSize])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const onDelete = async (id: string) => {
    await deleteStaff(id)
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

