import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { updateVoucher } from '@/features/vouchers/api/voucherService'
import { VoucherForm } from '@/features/vouchers/components/VoucherForm'
import { useVoucherDetail } from '@/features/vouchers/hooks/useVoucherDetail'
import type { VoucherFormValues } from '@/features/vouchers/schemas/voucherSchema'
import type { VoucherUpdatePayload } from '@/features/vouchers/types/voucher'
import { ROUTES } from '@/routes/paths'

function toIso(value: string): string {
  return new Date(value).toISOString()
}

function toDateTimeLocalValue(value: string): string {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function mapPayload(values: VoucherFormValues): VoucherUpdatePayload {
  return {
    code: values.code.trim(),
    discountPercent: values.discountPercent,
    validFrom: toIso(values.validFrom),
    validTo: toIso(values.validTo),
    quantity: values.quantity,
    status: values.status,
  }
}

export function VoucherUpdatePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data, loading, error, reload } = useVoucherDetail(id)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const initialValues = data
    ? {
        code: data.code,
        discountPercent: data.discountPercent,
        validFrom: toDateTimeLocalValue(data.validFrom),
        validTo: toDateTimeLocalValue(data.validTo),
        quantity: data.quantity,
        status: data.status,
      }
    : null

  const handleSubmit = async (values: VoucherFormValues) => {
    if (!id) {
      throw new Error('Không tìm thấy mã voucher cần cập nhật.')
    }

    setSubmitError(null)
    try {
      await updateVoucher(id, mapPayload(values))
      window.alert('Cập nhật voucher thành công')
      navigate(ROUTES.vouchers)
    } catch (nextError) {
      setSubmitError(nextError instanceof Error ? nextError.message : 'Không thể cập nhật voucher. Vui lòng thử lại.')
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

      <h1 className="text-[32px] font-bold leading-tight text-slate-900">Cập nhật khuyến mãi</h1>
      <p className="mt-1 text-sm text-slate-500">Chỉnh sửa thông tin theo contract cập nhật từ backend</p>

      <div className="mt-5 max-w-3xl rounded-xl border border-app-border bg-white p-5">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && initialValues && (
          <VoucherForm
            initialValues={initialValues}
            mode="update"
            onCancel={() => navigate(ROUTES.vouchers)}
            onSubmit={handleSubmit}
            submitError={submitError}
          />
        )}
      </div>
    </div>
  )
}



