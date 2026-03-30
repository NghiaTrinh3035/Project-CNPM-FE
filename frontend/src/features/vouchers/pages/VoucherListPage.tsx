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
import { VoucherStatusBadge } from '@/features/vouchers/components/VoucherStatusBadge'
import { useVoucherList } from '@/features/vouchers/hooks/useVoucherList'
import type { Voucher, VoucherStatus } from '@/features/vouchers/types/voucher'
import { ROUTES, getVoucherDetailPath, getVoucherUpdatePath } from '@/routes/paths'

const PAGE_SIZE = 10

function formatDate(value: string | null): string {
  if (!value) {
    return '--'
  }
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : '--'
}

function formatCurrencyPercent(value: number): string {
  return `${value}%`
}

export function VoucherListPage() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<VoucherStatus | null>(null)
  const [active, setActive] = useState<boolean | null>(null)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Voucher | null>(null)

  const { data, total, loading, error, reload, onDelete } = useVoucherList({
    keyword,
    status,
    active,
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
      window.alert('Đã xử lý xóa voucher')
    } catch (nextError) {
      window.alert(nextError instanceof Error ? nextError.message : 'Không thể xóa voucher. Vui lòng thử lại.')
    }
  }

  const clearFilters = () => {
    setKeyword('')
    setStatus(null)
    setActive(null)
    setPage(1)
  }

  return (
    <div>
      <PageHeader
        action={
          <Button className="gap-1" onClick={() => navigate(ROUTES.voucherCreate)}>
            <Plus className="h-4 w-4" />
            Thêm khuyến mãi
          </Button>
        }
        subtitle="Danh sách voucher"
        title="Quản lý khuyến mãi"
      />

      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_220px_220px]">
        <SearchInput
          onChange={(event) => {
            setKeyword(event.target.value)
            setPage(1)
          }}
          placeholder="Tìm theo mã voucher..."
          value={keyword}
        />

        <select
          className="h-11 w-full rounded-lg border border-app-border px-3 text-sm"
          onChange={(event) => {
            setStatus(event.target.value ? (event.target.value as VoucherStatus) : null)
            setPage(1)
          }}
          value={status ?? ''}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="EXPIRED">Hết hạn</option>
          <option value="USED_UP">Đã dùng hết</option>
        </select>

        <select
          className="h-11 w-full rounded-lg border border-app-border px-3 text-sm"
          onChange={(event) => {
            const value = event.target.value
            setActive(value === '' ? null : value === 'true')
            setPage(1)
          }}
          value={active === null ? '' : String(active)}
        >
          <option value="">Tất cả loại</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Không hoạt động</option>
        </select>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Button onClick={clearFilters} variant="secondary">
          Xóa bộ lọc
        </Button>
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && data.length === 0 && (
        <EmptyState
          description="Thử đổi mã voucher, trạng thái hoặc chế độ hoạt động rồi tải lại danh sách."
          title="Không có dữ liệu khuyến mãi"
        />
      )}

      {!loading && !error && data.length > 0 && (
        <DataTable
          columns={['Mã', 'Giảm giá', 'Hiệu lực', 'Số lượng', 'Trạng thái', 'Đã dùng', 'Thao tác']}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">Hiển thị {data.length} / {total} voucher</p>
              <Pagination currentPage={page} onPageChange={setPage} totalPages={totalPages} />
            </div>
          }
        >
          {data.map((voucher) => (
            <tr key={voucher.id}>
              <td className="px-4 py-4 font-semibold text-slate-800">{voucher.code}</td>
              <td className="px-4 py-4">{formatCurrencyPercent(voucher.discountPercent)}</td>
              <td className="px-4 py-4">
                <div className="space-y-1 text-sm text-slate-600">
                  <p>Từ: {formatDate(voucher.validFrom)}</p>
                  <p>Đến: {formatDate(voucher.validTo)}</p>
                </div>
              </td>
              <td className="px-4 py-4">{voucher.quantity}</td>
              <td className="px-4 py-4">
                <VoucherStatusBadge status={voucher.status} />
              </td>
              <td className="px-4 py-4">{voucher.isUsed ? 'Có' : 'Không'}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1">
                  <Button aria-label="Chi tiết" onClick={() => navigate(getVoucherDetailPath(voucher.id))} variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button aria-label="Sửa" onClick={() => navigate(getVoucherUpdatePath(voucher.id))} variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button aria-label="Xóa" onClick={() => setSelected(voucher)} variant="ghost">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <ConfirmModal
        description={selected ? `Bạn có chắc chắn muốn xóa voucher ${selected.code}?` : ''}
        onClose={() => setSelected(null)}
        onConfirm={() => {
          void handleDelete()
        }}
        open={Boolean(selected)}
        title="Xác nhận xử lý xóa"
      />
    </div>
  )
}

