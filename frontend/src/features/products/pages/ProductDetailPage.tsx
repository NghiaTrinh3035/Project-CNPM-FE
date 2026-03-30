import { ArrowLeft, Pencil } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProductImageManager } from '@/features/products/components/ProductImageManager'
import { useProductDetail } from '@/features/products/hooks/useProductDetail'
import type { ProductStatus } from '@/features/products/types/product'
import { ROUTES, getProductUpdatePath } from '@/routes/paths'

const STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: 'Đang kinh doanh',
  OUT_OF_STOCK: 'Hết hàng',
  DISCONTINUED: 'Ngừng kinh doanh',
}

const STATUS_TONES: Record<ProductStatus, 'success' | 'warning' | 'danger'> = {
  ACTIVE: 'success',
  OUT_OF_STOCK: 'warning',
  DISCONTINUED: 'danger',
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

interface DetailRowProps {
  label: string
  value: string
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-slate-100 py-3 text-sm last:border-0">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="col-span-2 text-slate-600">{value}</p>
    </div>
  )
}

export function ProductDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data, loading, error, reload } = useProductDetail(id)

  return (
    <div>
      <button
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
        onClick={() => navigate(-1)}
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </button>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[32px] font-bold leading-tight text-slate-900">Chi tiết sản phẩm</h1>
          <p className="mt-1 text-sm text-slate-500">Thông tin chi tiết theo dữ liệu backend</p>
        </div>
        {data && (
          <Button className="gap-1" onClick={() => navigate(getProductUpdatePath(data.id))}>
            <Pencil className="h-4 w-4" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-app-border bg-white p-5">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && !data && <ErrorState message="Không tìm thấy sản phẩm." onRetry={() => navigate(ROUTES.products)} />}

        {!loading && !error && data && (
          <>
            <div>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{data.name}</h2>
              <StatusBadge label={STATUS_LABELS[data.status]} tone={STATUS_TONES[data.status]} />
            </div>

            <DetailRow label="Mã sản phẩm" value={data.id} />
            <DetailRow label="Thương hiệu" value={data.brand} />
            <DetailRow label="Danh mục" value={data.category?.name ?? '--'} />
            <DetailRow label="Giá bán" value={formatCurrency(data.price)} />
            <DetailRow label="Tồn kho" value={String(data.stockQuantity)} />
            <DetailRow label="Mô tả" value={data.description ?? '--'} />
            <DetailRow label="Bộ máy" value={data.movementType ?? '--'} />
            <DetailRow label="Kính" value={data.glassMaterial ?? '--'} />
            <DetailRow label="Chống nước" value={data.waterResistance ?? '--'} />
            <DetailRow label="Kích thước mặt" value={data.faceSize ?? '--'} />
            <DetailRow label="Chất liệu dây" value={data.wireMaterial ?? '--'} />
            <DetailRow label="Màu dây" value={data.wireColor ?? '--'} />
            <DetailRow label="Màu vỏ" value={data.caseColor ?? '--'} />
            <DetailRow label="Màu mặt" value={data.faceColor ?? '--'} />
            </div>
            <ProductImageManager productId={data.id} />
          </>
        )}
      </div>
    </div>
  )
}

