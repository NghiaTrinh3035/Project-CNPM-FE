import { useCallback, useEffect, useState } from 'react'
import {
  deleteProductImage,
  getProductImages,
  uploadProductImage,
} from '@/features/products/api/productService'
import type { ProductImage } from '@/features/products/types/product'

export function useProductImages(productId: string | undefined) {
  const [images, setImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadImages = useCallback(async () => {
    if (!productId) {
      setImages([])
      setError('Không tìm thấy sản phẩm để quản lý ảnh.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await getProductImages(productId)
      setImages(data)
    } catch (nextError) {
      setImages([])
      setError(nextError instanceof Error ? nextError.message : 'Không thể tải danh sách ảnh sản phẩm.')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    void loadImages()
  }, [loadImages])

  const onUpload = useCallback(
    async (file: File, altText: string, isThumbnail: boolean) => {
      if (!productId) {
        throw new Error('Không tìm thấy sản phẩm để upload ảnh.')
      }
      await uploadProductImage(productId, { file, altText, isThumbnail })
      await loadImages()
    },
    [loadImages, productId],
  )

  const onDelete = useCallback(
    async (imageId: string) => {
      if (!productId) {
        throw new Error('Không tìm thấy sản phẩm để xóa ảnh.')
      }
      await deleteProductImage(productId, imageId)
      setImages((current) => current.filter((image) => image.id !== imageId))
    },
    [productId],
  )

  const onReplace = useCallback(
    async (currentImage: ProductImage, file: File) => {
      if (!productId) {
        throw new Error('Không tìm thấy sản phẩm để cập nhật ảnh.')
      }
      await uploadProductImage(productId, {
        file,
        altText: currentImage.altText,
        isThumbnail: currentImage.isThumbnail,
      })
      await deleteProductImage(productId, currentImage.id)
      await loadImages()
    },
    [loadImages, productId],
  )

  return {
    images,
    loading,
    error,
    reload: loadImages,
    onUpload,
    onDelete,
    onReplace,
  }
}

