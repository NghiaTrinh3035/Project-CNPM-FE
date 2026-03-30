import dayjs from 'dayjs'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/Button'
import { useCustomerDetail } from '@/features/customers/hooks/useCustomerDetail'
import type { UserGender } from '@/features/customers/types/customer'
import { ROUTES, getCustomerUpdatePath } from '@/routes/paths'

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

export function CustomerDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data, loading, error, reload } = useCustomerDetail(id)

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
          <h1 className="text-[32px] font-bold leading-tight text-slate-900">Chi tiết khách hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Thông tin chi tiết theo dữ liệu backend</p>
        </div>
        {data && (
          <Button className="gap-1" onClick={() => navigate(getCustomerUpdatePath(data.id))}>
            <Pencil className="h-4 w-4" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-app-border bg-white p-5">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && !data && <ErrorState message="Không tìm thấy khách hàng." onRetry={() => navigate(ROUTES.customers)} />}

        {!loading && !error && data && (
          <>
            <DetailRow label="Mã khách hàng" value={data.id} />
            <DetailRow label="Tài khoản" value={data.username} />
            <DetailRow label="Họ và tên" value={data.fullName} />
            <DetailRow label="Email" value={data.email} />
            <DetailRow label="Số điện thoại" value={data.phone ?? '--'} />
            <DetailRow label="Địa chỉ" value={data.address} />
            <DetailRow label="Giới tính" value={data.gender ? GENDER_LABELS[data.gender] : '--'} />
            <DetailRow label="Ngày tạo" value={formatDate(data.createdAt)} />
          </>
        )}
      </div>
    </div>
  )
}

