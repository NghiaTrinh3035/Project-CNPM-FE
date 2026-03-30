import dayjs from 'dayjs'
import { Pencil, Plus, Trash2 } from 'lucide-react'
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
import { useStaffList } from '@/features/staff/hooks/useStaffList'
import type { Staff, UserGender } from '@/features/staff/types/staff'
import { ROUTES, getStaffUpdatePath } from '@/routes/paths'

const PAGE_SIZE = 10

const GENDER_LABELS: Record<UserGender, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
}

function formatDate(value: string | null): string {
  if (!value) {
    return '--'
  }
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '--'
}

export function StaffListPage() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Staff | null>(null)

  const { data, total, loading, error, reload, onDelete } = useStaffList({
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
      window.alert('Đã xóa nhân viên')
    } catch (deleteError) {
      window.alert(deleteError instanceof Error ? deleteError.message : 'Không thể xóa nhân viên. Vui lòng thử lại.')
    }
  }

  return (
    <div>
      <PageHeader
        action={
          <Button className="gap-1" onClick={() => navigate(ROUTES.staffCreate)}>
            <Plus className="h-4 w-4" />
            Thêm nhân viên
          </Button>
        }
        subtitle="Danh sách nhân viên"
        title="Quản lý nhân viên"
      />

      <div className="mb-4 max-w-md">
        <SearchInput
          onChange={(event) => {
            setKeyword(event.target.value)
            setPage(1)
          }}
          placeholder="Tìm kiếm theo họ tên, email, số điện thoại..."
          value={keyword}
        />
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && data.length === 0 && (
        <EmptyState
          description="Thử thay đổi từ khóa tìm kiếm họ tên, email, số điện thoại hoặc tải lại trang."
          title="Không có dữ liệu nhân viên"
        />
      )}

      {!loading && !error && data.length > 0 && (
        <DataTable
          columns={['Mã NV', 'Tài khoản', 'Họ và tên', 'Email', 'Số điện thoại', 'Địa chỉ', 'Giới tính', 'Ngày vào làm', 'Ngày tạo', 'Thao tác']}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Hiển thị {data.length} / {total} nhân viên
              </p>
              <Pagination currentPage={page} onPageChange={setPage} totalPages={totalPages} />
            </div>
          }
        >
          {data.map((staff) => (
            <tr key={staff.id}>
              <td className="px-4 py-4 font-medium text-slate-700">{staff.staffId}</td>
              <td className="px-4 py-4">{staff.username}</td>
              <td className="px-4 py-4 font-semibold text-slate-800">{staff.fullName}</td>
              <td className="px-4 py-4">{staff.email}</td>
              <td className="px-4 py-4">{staff.phone ?? '--'}</td>
              <td className="px-4 py-4">{staff.address ?? '--'}</td>
              <td className="px-4 py-4">{staff.gender ? GENDER_LABELS[staff.gender] : '--'}</td>
              <td className="px-4 py-4">{formatDate(staff.joinDate ?? staff.createdAt)}</td>
              <td className="px-4 py-4">{formatDate(staff.createdAt)}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1">
                  <Button aria-label="Sửa" onClick={() => navigate(getStaffUpdatePath(staff.id))} variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button aria-label="Xóa" onClick={() => setSelected(staff)} variant="ghost">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <ConfirmModal
        description={selected ? `Bạn có chắc chắn muốn xóa nhân viên ${selected.fullName}?` : ''}
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

