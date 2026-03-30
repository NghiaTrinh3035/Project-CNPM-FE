import { useCallback, useEffect, useState } from 'react'
import { deleteProduct, getProductList } from '@/features/products/api/productService'
import type { Product } from '@/features/products/types/product'

interface UseProductListOptions {
  keyword: string
  page: number
  pageSize: number
}

export function useProductList({ keyword, page, pageSize }: UseProductListOptions) {
  const [data, setData] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getProductList({ keyword, page, pageSize })
      setData(Array.isArray(response.data) ? response.data : [])
      setTotal(response.total)
    } catch (nextError) {
      setData([])
      setTotal(0)
      setError(nextError instanceof Error ? nextError.message : 'Không thể tải danh sách sản phẩm. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [keyword, page, pageSize])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const onDelete = async (id: string) => {
    await deleteProduct(id)
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

