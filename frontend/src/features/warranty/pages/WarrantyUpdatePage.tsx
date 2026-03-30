import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { updateWarrantyStatus } from '@/features/warranty/api/warrantyService'
import { WarrantyProcessForm } from '@/features/warranty/components/WarrantyProcessForm'
import { useWarrantyDetail } from '@/features/warranty/hooks/useWarrantyDetail'
import type { WarrantyProcessFormValues } from '@/features/warranty/schemas/warrantySchema'
import type { WarrantyProcessPayload } from '@/features/warranty/types/warranty'
import { ROUTES } from '@/routes/paths'

function toNullable(value: string): string | null {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function mapPayload(values: WarrantyProcessFormValues): WarrantyProcessPayload {
  return {
    status: values.status,
    technicianNote: toNullable(values.technicianNote),
    rejectReason: values.status === 'REJECTED' ? toNullable(values.rejectReason) : null,
  }
}

export function WarrantyUpdatePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data, loading, error, reload } = useWarrantyDetail(id)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (values: WarrantyProcessFormValues) => {
    if (!id) {
      throw new Error('Không tìm thấy mã phiếu bảo hành cần cập nhật.')
    }

    setSubmitError(null)
    try {
      await updateWarrantyStatus(id, mapPayload(values))
      window.alert('Cập nhật trạng thái bảo hành thành công')
      navigate(ROUTES.warranty)
    } catch (nextError) {
      setSubmitError(nextError instanceof Error ? nextError.message : 'Không thể cập nhật trạng thái bảo hành. Vui lòng thử lại.')
    }
  }

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

      <h1 className="text-[32px] font-bold leading-tight text-slate-900">Cập nhật trạng thái bảo hành</h1>
      <p className="mt-1 text-sm text-slate-500">Xử lý phiếu bảo hành theo contract cập nhật từ backend</p>

      <div className="mt-5 max-w-3xl rounded-xl border border-app-border bg-white p-5">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && data && (
          <>
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-700">Khách hàng:</span> {data.customerName}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Sản phẩm:</span> {data.productName ?? data.productId}
              </p>
            </div>

            <WarrantyProcessForm
              initialValues={{
                status: data.status,
                technicianNote: data.technicianNote ?? '',
                rejectReason: data.rejectReason ?? '',
              }}
              onCancel={() => navigate(ROUTES.warranty)}
              onSubmit={handleSubmit}
              submitError={submitError}
            />
          </>
        )}
      </div>
    </div>
  )
}

