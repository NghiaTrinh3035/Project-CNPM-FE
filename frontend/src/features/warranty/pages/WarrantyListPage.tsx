import dayjs from 'dayjs'
import { Eye, Pencil, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/components/data-display/DataTable'
import { Pagination } from '@/components/data-display/Pagination'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useWarrantyList } from '@/features/warranty/hooks/useWarrantyList'
import type { WarrantyStatus } from '@/features/warranty/types/warranty'
import { ROUTES, getWarrantyDetailPath, getWarrantyUpdatePath } from '@/routes/paths'

const PAGE_SIZE = 10

const STATUS_LABELS: Record<WarrantyStatus, string> = {
  RECEIVED: 'Đã nhận',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn tất',
  REJECTED: 'Từ chối',
}

const STATUS_TONES: Record<WarrantyStatus, 'default' | 'warning' | 'success' | 'danger'> = {
  RECEIVED: 'default',
  PROCESSING: 'warning',
  COMPLETED: 'success',
  REJECTED: 'danger',
}

function formatDate(value: string): string {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '--'
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase()
}

export function WarrantyListPage() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<WarrantyStatus | null>(null)
  const [page, setPage] = useState(1)

  const { data, total, loading, error, reload } = useWarrantyList({
    keyword,
    status,
    page,
    pageSize: PAGE_SIZE,
  })

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  return (
    <div>
      <PageHeader
        action={
          <Button className="gap-1" onClick={() => navigate(ROUTES.warrantyCreate)}>
            <Plus className="h-4 w-4" />
            Tạo phiếu bảo hành
          </Button>
        }
        subtitle="Danh sách phiếu bảo hành"
        title="Quản lý bảo hành"
      />

      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_240px]">
        <SearchInput
          onChange={(event) => {
            setKeyword(event.target.value)
            setPage(1)
          }}
          placeholder="Tìm theo tên, số điện thoại, mô tả lỗi..."
          value={keyword}
        />

        <select
          className="h-11 w-full rounded-lg border border-app-border px-3 text-sm"
          onChange={(event) => {
            setStatus(event.target.value ? (event.target.value as WarrantyStatus) : null)
            setPage(1)
          }}
          value={status ?? ''}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="RECEIVED">Đã nhận</option>
          <option value="PROCESSING">Đang xử lý</option>
          <option value="COMPLETED">Hoàn tất</option>
          <option value="REJECTED">Từ chối</option>
        </select>
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && data.length === 0 && (
        <EmptyState
          description="Thử đổi từ khóa/trạng thái tìm kiếm hoặc tải lại trang."
          title="Không có dữ liệu bảo hành"
        />
      )}

      {!loading && !error && data.length > 0 && (
        <DataTable
          columns={['Mã BH', 'Khách hàng', 'SĐT', 'Sản phẩm', 'Số lượng', 'Ngày nhận', 'Hẹn trả', 'Trạng thái', 'Thao tác']}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">Hiển thị {data.length} / {total} phiếu bảo hành</p>
              <Pagination currentPage={page} onPageChange={setPage} totalPages={totalPages} />
            </div>
          }
        >
          {data.map((warranty) => (
            <tr key={warranty.id}>
              <td className="px-4 py-4 font-medium text-slate-700">{shortId(warranty.id)}</td>
              <td className="px-4 py-4 font-semibold text-slate-800">{warranty.customerName}</td>
              <td className="px-4 py-4">{warranty.customerPhone}</td>
              <td className="px-4 py-4">{warranty.productName ?? warranty.productId}</td>
              <td className="px-4 py-4">{warranty.quantity}</td>
              <td className="px-4 py-4">{formatDate(warranty.receivedDate)}</td>
              <td className="px-4 py-4">{formatDate(warranty.expectedReturnDate)}</td>
              <td className="px-4 py-4">
                <StatusBadge label={STATUS_LABELS[warranty.status]} tone={STATUS_TONES[warranty.status]} />
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1">
                  <Button aria-label="Chi tiết" onClick={() => navigate(getWarrantyDetailPath(warranty.id))} variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button aria-label="Cập nhật" onClick={() => navigate(getWarrantyUpdatePath(warranty.id))} variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  )
}

