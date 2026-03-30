import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createWarranty } from '@/features/warranty/api/warrantyService'
import { WarrantyForm } from '@/features/warranty/components/WarrantyForm'
import type { WarrantyCreateFormValues } from '@/features/warranty/schemas/warrantySchema'
import type { WarrantyCreatePayload } from '@/features/warranty/types/warranty'
import { ROUTES } from '@/routes/paths'

function toNullable(value: string): string | null {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function toIsoDate(value: string): string {
  return new Date(`${value}T00:00:00`).toISOString()
}

function mapPayload(values: WarrantyCreateFormValues): WarrantyCreatePayload {
  return {
    customerPhone: values.customerPhone.trim(),
    customerName: values.customerName.trim(),
    issueDescription: values.issueDescription.trim(),
    receivedDate: toIsoDate(values.receivedDate),
    expectedReturnDate: toIsoDate(values.expectedReturnDate),
    status: values.status,
    technicianNote: toNullable(values.technicianNote),
    quantity: values.quantity,
    productId: values.productId.trim(),
  }
}

export function WarrantyCreatePage() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (values: WarrantyCreateFormValues) => {
    setSubmitError(null)

    try {
      await createWarranty(mapPayload(values))
      window.alert('Tạo phiếu bảo hành thành công')
      navigate(ROUTES.warranty)
    } catch (nextError) {
      setSubmitError(nextError instanceof Error ? nextError.message : 'Không thể tạo phiếu bảo hành. Vui lòng thử lại.')
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

      <h1 className="text-[32px] font-bold leading-tight text-slate-900">Tạo phiếu bảo hành</h1>
      <p className="mt-1 text-sm text-slate-500">Nhập thông tin theo contract tạo mới từ backend</p>

      <div className="mt-5 max-w-3xl rounded-xl border border-app-border bg-white p-5">
        <WarrantyForm onCancel={() => navigate(ROUTES.warranty)} onSubmit={handleSubmit} submitError={submitError} />
      </div>
    </div>
  )
}

