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
import { useCustomerList } from '@/features/customers/hooks/useCustomerList'
import type { Customer, UserGender } from '@/features/customers/types/customer'
import { ROUTES, getCustomerDetailPath, getCustomerUpdatePath } from '@/routes/paths'

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

export function CustomerListPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Customer | null>(null)

  const { data, total, loading, error, reload, onDelete } = useCustomerList({
    fullName,
    email,
    phone,
    address,
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
      window.alert('Đã xóa khách hàng')
    } catch (nextError) {
      window.alert(nextError instanceof Error ? nextError.message : 'Không thể xóa khách hàng. Vui lòng thử lại.')
    }
  }

  const clearFilters = () => {
    setFullName('')
    setEmail('')
    setPhone('')
    setAddress('')
    setPage(1)
  }

  return (
    <div>
      <PageHeader
        action={
          <Button className="gap-1" onClick={() => navigate(ROUTES.customerCreate)}>
            <Plus className="h-4 w-4" />
            Thêm khách hàng
          </Button>
        }
        subtitle="Danh sách khách hàng"
        title="Quản lý khách hàng"
      />

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <SearchInput
          onChange={(event) => {
            setFullName(event.target.value)
            setPage(1)
          }}
          placeholder="Tìm theo họ và tên..."
          value={fullName}
        />
        <input
          className="h-11 w-full rounded-lg border border-app-border px-3 text-sm"
          onChange={(event) => {
            setEmail(event.target.value)
            setPage(1)
          }}
          placeholder="Lọc theo email"
          value={email}
        />
        <input
          className="h-11 w-full rounded-lg border border-app-border px-3 text-sm"
          onChange={(event) => {
            setPhone(event.target.value)
            setPage(1)
          }}
          placeholder="Lọc theo số điện thoại"
          value={phone}
        />
        <input
          className="h-11 w-full rounded-lg border border-app-border px-3 text-sm"
          onChange={(event) => {
            setAddress(event.target.value)
            setPage(1)
          }}
          placeholder="Lọc theo địa chỉ"
          value={address}
        />
      </div>

      <div className="mb-4">
        <Button onClick={clearFilters} variant="secondary">
          Xóa bộ lọc
        </Button>
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && data.length === 0 && (
        <EmptyState
          description="Thử thay đổi bộ lọc tìm kiếm theo tên, email, số điện thoại hoặc địa chỉ."
          title="Không có dữ liệu khách hàng"
        />
      )}

      {!loading && !error && data.length > 0 && (
        <DataTable
          columns={['Tài khoản', 'Họ và tên', 'Email', 'Số điện thoại', 'Địa chỉ', 'Giới tính', 'Ngày tạo', 'Thao tác']}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">Hiển thị {data.length} / {total} khách hàng</p>
              <Pagination currentPage={page} onPageChange={setPage} totalPages={totalPages} />
            </div>
          }
        >
          {data.map((customer) => (
            <tr key={customer.id}>
              <td className="px-4 py-4 font-medium text-slate-700">{customer.username}</td>
              <td className="px-4 py-4 font-semibold text-slate-800">{customer.fullName}</td>
              <td className="px-4 py-4">{customer.email}</td>
              <td className="px-4 py-4">{customer.phone ?? '--'}</td>
              <td className="px-4 py-4">{customer.address}</td>
              <td className="px-4 py-4">{customer.gender ? GENDER_LABELS[customer.gender] : '--'}</td>
              <td className="px-4 py-4">{formatDate(customer.createdAt)}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1">
                  <Button aria-label="Chi tiết" onClick={() => navigate(getCustomerDetailPath(customer.id))} variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button aria-label="Sửa" onClick={() => navigate(getCustomerUpdatePath(customer.id))} variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button aria-label="Xóa" onClick={() => setSelected(customer)} variant="ghost">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <ConfirmModal
        description={selected ? `Bạn có chắc chắn muốn xóa khách hàng ${selected.fullName}?` : ''}
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

