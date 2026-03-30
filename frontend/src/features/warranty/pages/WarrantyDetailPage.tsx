import dayjs from 'dayjs'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useWarrantyDetail } from '@/features/warranty/hooks/useWarrantyDetail'
import type { WarrantyStatus } from '@/features/warranty/types/warranty'
import { ROUTES, getWarrantyUpdatePath } from '@/routes/paths'

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

export function WarrantyDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data, loading, error, reload } = useWarrantyDetail(id)

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
          <h1 className="text-[32px] font-bold leading-tight text-slate-900">Chi tiết bảo hành</h1>
          <p className="mt-1 text-sm text-slate-500">Thông tin phiếu bảo hành từ backend</p>
        </div>
        {data && (
          <Button className="gap-1" onClick={() => navigate(getWarrantyUpdatePath(data.id))}>
            <Pencil className="h-4 w-4" />
            Cập nhật trạng thái
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-app-border bg-white p-5">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && !data && <ErrorState message="Không tìm thấy phiếu bảo hành." onRetry={() => navigate(ROUTES.warranty)} />}

        {!loading && !error && data && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{data.customerName}</h2>
              <StatusBadge label={STATUS_LABELS[data.status]} tone={STATUS_TONES[data.status]} />
            </div>

            <DetailRow label="Mã bảo hành" value={data.id} />
            <DetailRow label="Số điện thoại" value={data.customerPhone} />
            <DetailRow label="Sản phẩm" value={data.productName ?? data.productId} />
            <DetailRow label="Số lượng" value={String(data.quantity)} />
            <DetailRow label="Ngày nhận" value={formatDate(data.receivedDate)} />
            <DetailRow label="Ngày hẹn trả" value={formatDate(data.expectedReturnDate)} />
            <DetailRow label="Mô tả lỗi" value={data.issueDescription} />
            <DetailRow label="Ghi chú kỹ thuật" value={data.technicianNote ?? '--'} />
            <DetailRow label="Lý do từ chối" value={data.rejectReason ?? '--'} />
          </>
        )}
      </div>
    </div>
  )
}

