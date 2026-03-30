import { ImagePlus, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useProductImages } from '@/features/products/hooks/useProductImages'
import type { ProductImage } from '@/features/products/types/product'

interface ProductImageManagerProps {
  productId: string
}

export function ProductImageManager({ productId }: ProductImageManagerProps) {
  const { images, loading, error, reload, onUpload, onDelete, onReplace } = useProductImages(productId)

  const [altText, setAltText] = useState('')
  const [isThumbnail, setIsThumbnail] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeActionId, setActiveActionId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const uploadInputRef = useRef<HTMLInputElement | null>(null)

  const handleUpload = async (file: File) => {
    try {
      setUploading(true)
      setActionError(null)
      await onUpload(file, altText, isThumbnail)
      setAltText('')
      setIsThumbnail(false)
      if (uploadInputRef.current) {
        uploadInputRef.current.value = ''
      }
      window.alert('Upload ảnh thành công')
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : 'Không thể upload ảnh sản phẩm.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (image: ProductImage) => {
    const shouldDelete = window.confirm('Bạn có chắc chắn muốn xóa ảnh này không?')
    if (!shouldDelete) {
      return
    }

    try {
      setActiveActionId(image.id)
      setActionError(null)
      await onDelete(image.id)
      window.alert('Đã xóa ảnh sản phẩm')
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : 'Không thể xóa ảnh sản phẩm.')
    } finally {
      setActiveActionId(null)
    }
  }

  const handleReplace = async (image: ProductImage, file: File) => {
    try {
      setActiveActionId(image.id)
      setActionError(null)
      await onReplace(image, file)
      window.alert('Đã cập nhật ảnh sản phẩm')
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : 'Không thể cập nhật ảnh sản phẩm.')
    } finally {
      setActiveActionId(null)
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-app-border bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Hình ảnh sản phẩm</h3>
          <p className="text-sm text-slate-500">Upload, thay thế hoặc xóa ảnh sản phẩm.</p>
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Mô tả ảnh (alt text)</label>
            <input
              className="h-10 w-full rounded-lg border border-app-border bg-white px-3 text-sm"
              onChange={(event) => setAltText(event.target.value)}
              placeholder="Ví dụ: Đồng hồ mặt đen dây thép"
              value={altText}
            />
          </div>

          <label className="flex items-center gap-2 pt-7 text-sm text-slate-700">
            <input checked={isThumbnail} onChange={(event) => setIsThumbnail(event.target.checked)} type="checkbox" />
            Đặt làm ảnh đại diện
          </label>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) {
                return
              }
              void handleUpload(file)
            }}
            ref={uploadInputRef}
            type="file"
          />
          <Button className="gap-1" disabled={uploading} onClick={() => uploadInputRef.current?.click()}>
            {uploading ? <Upload className="h-4 w-4 animate-pulse" /> : <ImagePlus className="h-4 w-4" />}
            {uploading ? 'Đang upload...' : 'Upload ảnh mới'}
          </Button>
        </div>
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {actionError && <ErrorState message={actionError} />}

      {!loading && !error && images.length === 0 && <EmptyState description="Hãy upload ảnh đầu tiên cho sản phẩm." title="Chưa có ảnh sản phẩm" />}

      {!loading && !error && images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => {
            const busy = activeActionId === image.id
            return (
              <div className="rounded-lg border border-slate-200 p-3" key={image.id}>
                <img alt={image.altText ?? 'product image'} className="h-40 w-full rounded-md object-cover" src={image.imageUrl} />

                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-slate-600">{image.altText ?? '--'}</p>
                  {image.isThumbnail && <StatusBadge label="Ảnh đại diện" tone="success" />}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-app-border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <Upload className="h-4 w-4" />
                    Thay ảnh
                    <input
                      accept="image/*"
                      className="hidden"
                      disabled={busy}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (!file) {
                          return
                        }
                        void handleReplace(image, file)
                        event.currentTarget.value = ''
                      }}
                      type="file"
                    />
                  </label>

                  <Button disabled={busy} onClick={() => void handleDelete(image)} variant="danger">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

