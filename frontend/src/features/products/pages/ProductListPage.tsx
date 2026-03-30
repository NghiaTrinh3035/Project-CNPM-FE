import dayjs from 'dayjs'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/components/data-display/DataTable'
import { Pagination } from '@/components/data-display/Pagination'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { SearchInput } from '@/components/ui/SearchInput'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useProductList } from '@/features/products/hooks/useProductList'
import type { Product, ProductStatus } from '@/features/products/types/product'
import { ROUTES, getProductDetailPath, getProductUpdatePath } from '@/routes/paths'

const PAGE_SIZE = 10

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

function formatDate(value: string | null): string {
  if (!value) {
    return '--'
  }
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '--'
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase()
}

export function ProductListPage() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Product | null>(null)

  const { data, total, loading, error, reload, onDelete } = useProductList({
    keyword,
    page,
    pageSize: PAGE_SIZE,
  })

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  const handleDelete = async () => {
    if (!selected) {
      return
    }

    try {
      await onDelete(selected.id)
      setSelected(null)
      window.alert('Đã xóa sản phẩm')
    } catch (deleteError) {
      window.alert(deleteError instanceof Error ? deleteError.message : 'Không thể xóa sản phẩm. Vui lòng thử lại.')
    }
  }

  return (
    <div>
      <PageHeader
        action={
          <Button className="gap-1" onClick={() => navigate(ROUTES.productCreate)}>
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
        }
        subtitle="Danh sách sản phẩm"
        title="Quản lý sản phẩm"
      />

      <div className="mb-4 max-w-md">
        <SearchInput
          onChange={(event) => {
            setKeyword(event.target.value)
            setPage(1)
          }}
          placeholder="Tìm theo tên sản phẩm..."
          value={keyword}
        />
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && data.length === 0 && (
        <EmptyState
          description="Thử thay đổi từ khóa tìm kiếm tên sản phẩm hoặc tải lại trang."
          title="Không có dữ liệu sản phẩm"
        />
      )}

      {!loading && !error && data.length > 0 && (
        <DataTable
          columns={['Mã SP', 'Tên sản phẩm', 'Thương hiệu', 'Danh mục', 'Giá bán', 'Tồn kho', 'Trạng thái', 'Cập nhật', 'Thao tác']}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">Hiển thị {data.length} / {total} sản phẩm</p>
              <Pagination currentPage={page} onPageChange={setPage} totalPages={totalPages} />
            </div>
          }
        >
          {data.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-4 font-medium text-slate-700">{shortId(product.id)}</td>
              <td className="px-4 py-4 font-semibold text-slate-800">{product.name}</td>
              <td className="px-4 py-4">{product.brand}</td>
              <td className="px-4 py-4">{product.category?.name ?? '--'}</td>
              <td className="px-4 py-4">{formatCurrency(product.price)}</td>
              <td className="px-4 py-4">{product.stockQuantity}</td>
              <td className="px-4 py-4">
                <StatusBadge label={STATUS_LABELS[product.status]} tone={STATUS_TONES[product.status]} />
              </td>
              <td className="px-4 py-4">{formatDate(product.updatedAt)}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1">
                  <Button aria-label="Chi tiết" onClick={() => navigate(getProductDetailPath(product.id))} variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button aria-label="Sửa" onClick={() => navigate(getProductUpdatePath(product.id))} variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button aria-label="Xóa" onClick={() => setSelected(product)} variant="ghost">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <ConfirmModal
        description={selected ? `Bạn có chắc chắn muốn xóa sản phẩm ${selected.name}?` : ''}
        onClose={() => setSelected(null)}
        onConfirm={() => {
          void handleDelete()
        }}
        open={Boolean(selected)}
        title="Xác nhận xóa"
      />
    </div>
  )
}

