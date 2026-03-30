import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createVoucher } from '@/features/vouchers/api/voucherService'
import { VoucherForm } from '@/features/vouchers/components/VoucherForm'
import type { VoucherFormValues } from '@/features/vouchers/schemas/voucherSchema'
import type { VoucherCreatePayload } from '@/features/vouchers/types/voucher'
import { ROUTES } from '@/routes/paths'

function toIso(value: string): string {
  return new Date(value).toISOString()
}

function mapPayload(values: VoucherFormValues): VoucherCreatePayload {
  return {
    code: values.code.trim(),
    discountPercent: values.discountPercent,
    validFrom: toIso(values.validFrom),
    validTo: toIso(values.validTo),
    quantity: values.quantity,
    status: values.status,
  }
}

export function VoucherCreatePage() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (values: VoucherFormValues) => {
    setSubmitError(null)
    try {
      await createVoucher(mapPayload(values))
      window.alert('Thêm voucher thành công')
      navigate(ROUTES.vouchers)
    } catch (nextError) {
      setSubmitError(nextError instanceof Error ? nextError.message : 'Không thể tạo voucher. Vui lòng thử lại.')
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

      <h1 className="text-[32px] font-bold leading-tight text-slate-900">Thêm khuyến mãi mới</h1>
      <p className="mt-1 text-sm text-slate-500">Điền thông tin theo contract tạo mới từ backend</p>

      <div className="mt-5 max-w-3xl rounded-xl border border-app-border bg-white p-5">
        <VoucherForm
          mode="create"
          onCancel={() => navigate(ROUTES.vouchers)}
          onSubmit={handleSubmit}
          submitError={submitError}
        />
      </div>
    </div>
  )
}

