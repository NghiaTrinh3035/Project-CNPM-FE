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
import { useSupplierList } from '@/features/suppliers/hooks/useSupplierList'
import type { Supplier } from '@/features/suppliers/types/supplier'
import { ROUTES, getSupplierDetailPath, getSupplierUpdatePath } from '@/routes/paths'

const PAGE_SIZE = 10

export function SupplierListPage() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Supplier | null>(null)

  const { data, total, loading, error, reload, onDelete } = useSupplierList({
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
      window.alert('Đã xóa nhà cung cấp')
    } catch (nextError) {
      window.alert(nextError instanceof Error ? nextError.message : 'Không thể xóa nhà cung cấp. Vui lòng thử lại.')
    }
  }

  return (
    <div>
      <PageHeader
        action={
          <Button className="gap-1" onClick={() => navigate(ROUTES.supplierCreate)}>
            <Plus className="h-4 w-4" />
            Thêm nhà cung cấp
          </Button>
        }
        subtitle="Danh sách nhà cung cấp"
        title="Quản lý nhà cung cấp"
      />

      <div className="mb-4 max-w-md">
        <SearchInput
          onChange={(event) => {
            setKeyword(event.target.value)
            setPage(1)
          }}
          placeholder="Tìm theo tên, hợp đồng, địa chỉ..."
          value={keyword}
        />
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && data.length === 0 && (
        <EmptyState description="Thử thay đổi từ khóa tìm kiếm hoặc tải lại trang." title="Không có dữ liệu nhà cung cấp" />
      )}

      {!loading && !error && data.length > 0 && (
        <DataTable
          columns={['Tên nhà cung cấp', 'Thông tin hợp đồng', 'Địa chỉ', 'Thao tác']}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">Hiển thị {data.length} / {total} nhà cung cấp</p>
              <Pagination currentPage={page} onPageChange={setPage} totalPages={totalPages} />
            </div>
          }
        >
          {data.map((supplier) => (
            <tr key={supplier.id}>
              <td className="px-4 py-4 font-semibold text-slate-800">{supplier.name}</td>
              <td className="px-4 py-4">{supplier.contractInfo ?? '--'}</td>
              <td className="px-4 py-4">{supplier.address ?? '--'}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1">
                  <Button aria-label="Chi tiết" onClick={() => navigate(getSupplierDetailPath(supplier.id))} variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button aria-label="Sửa" onClick={() => navigate(getSupplierUpdatePath(supplier.id))} variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button aria-label="Xóa" onClick={() => setSelected(supplier)} variant="ghost">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <ConfirmModal
        description={selected ? `Bạn có chắc chắn muốn xóa nhà cung cấp ${selected.name}?` : ''}
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

