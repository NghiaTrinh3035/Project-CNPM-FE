import { useCallback, useEffect, useState } from 'react'
import { getProductById } from '@/features/products/api/productService'
import type { Product } from '@/features/products/types/product'

export function useProductDetail(id: string | undefined) {
  const [data, setData] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) {
      setError('Không tìm thấy mã sản phẩm.')
      setData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await getProductById(id)
      setData(response)
    } catch (nextError) {
      setData(null)
      setError(nextError instanceof Error ? nextError.message : 'Không thể tải chi tiết sản phẩm. Vui lòng thử lại.')
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

