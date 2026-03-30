import dayjs from 'dayjs'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/Button'
import { VoucherStatusBadge } from '@/features/vouchers/components/VoucherStatusBadge'
import { useVoucherDetail } from '@/features/vouchers/hooks/useVoucherDetail'
import { ROUTES, getVoucherUpdatePath } from '@/routes/paths'

function formatDate(value: string | null): string {
  if (!value) {
    return '--'
  }
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : '--'
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

export function VoucherDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data, loading, error, reload } = useVoucherDetail(id)

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
          <h1 className="text-[32px] font-bold leading-tight text-slate-900">Chi tiết khuyến mãi</h1>
          <p className="mt-1 text-sm text-slate-500">Thông tin voucher theo dữ liệu backend</p>
        </div>
        {data && (
          <Button className="gap-1" onClick={() => navigate(getVoucherUpdatePath(data.id))}>
            <Pencil className="h-4 w-4" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-app-border bg-white p-5">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && !data && <ErrorState message="Không tìm thấy voucher." onRetry={() => navigate(ROUTES.vouchers)} />}

        {!loading && !error && data && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{data.code}</h2>
              <VoucherStatusBadge status={data.status} />
            </div>

            <DetailRow label="Mã voucher" value={data.code} />
            <DetailRow label="Giảm giá" value={`${data.discountPercent}%`} />
            <DetailRow label="Hiệu lực từ" value={formatDate(data.validFrom)} />
            <DetailRow label="Hiệu lực đến" value={formatDate(data.validTo)} />
            <DetailRow label="Số lượng" value={String(data.quantity)} />
            <DetailRow label="Đã sử dụng" value={data.isUsed ? 'Có' : 'Không'} />
            <DetailRow label="Ngày sử dụng" value={formatDate(data.usedAt)} />
          </>
        )}
      </div>
    </div>
  )
}

