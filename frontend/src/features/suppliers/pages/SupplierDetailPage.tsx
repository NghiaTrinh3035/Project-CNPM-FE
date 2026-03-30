import { ArrowLeft, Pencil } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/Button'
import { useSupplierDetail } from '@/features/suppliers/hooks/useSupplierDetail'
import { ROUTES, getSupplierUpdatePath } from '@/routes/paths'

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

export function SupplierDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data, loading, error, reload } = useSupplierDetail(id)

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
          <h1 className="text-[32px] font-bold leading-tight text-slate-900">Chi tiết nhà cung cấp</h1>
          <p className="mt-1 text-sm text-slate-500">Thông tin chi tiết theo dữ liệu backend</p>
        </div>
        {data && (
          <Button className="gap-1" onClick={() => navigate(getSupplierUpdatePath(data.id))}>
            <Pencil className="h-4 w-4" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-app-border bg-white p-5">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && !data && (
          <ErrorState message="Không tìm thấy nhà cung cấp." onRetry={() => navigate(ROUTES.suppliers)} />
        )}

        {!loading && !error && data && (
          <>
            <DetailRow label="Mã nhà cung cấp" value={data.id} />
            <DetailRow label="Tên nhà cung cấp" value={data.name} />
            <DetailRow label="Thông tin hợp đồng" value={data.contractInfo ?? '--'} />
            <DetailRow label="Địa chỉ" value={data.address ?? '--'} />
          </>
        )}
      </div>
    </div>
  )
}

