import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSupplier } from '@/features/suppliers/api/supplierService'
import { SupplierForm } from '@/features/suppliers/components/SupplierForm'
import type { SupplierFormValues } from '@/features/suppliers/schemas/supplierSchema'
import type { SupplierCreatePayload } from '@/features/suppliers/types/supplier'
import { ROUTES } from '@/routes/paths'

function toNullable(value: string): string | null {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function mapPayload(values: SupplierFormValues): SupplierCreatePayload {
  return {
    name: values.name.trim(),
    contractInfo: toNullable(values.contractInfo),
    address: toNullable(values.address),
  }
}

export function SupplierCreatePage() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (values: SupplierFormValues) => {
    setSubmitError(null)
    try {
      await createSupplier(mapPayload(values))
      window.alert('Thêm nhà cung cấp thành công')
      navigate(ROUTES.suppliers)
    } catch (nextError) {
      setSubmitError(nextError instanceof Error ? nextError.message : 'Không thể tạo nhà cung cấp. Vui lòng thử lại.')
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

      <h1 className="text-[32px] font-bold leading-tight text-slate-900">Thêm nhà cung cấp mới</h1>
      <p className="mt-1 text-sm text-slate-500">Điền thông tin theo contract tạo mới từ backend</p>

      <div className="mt-5 max-w-xl rounded-xl border border-app-border bg-white p-5">
        <SupplierForm
          mode="create"
          onCancel={() => navigate(ROUTES.suppliers)}
          onSubmit={handleSubmit}
          submitError={submitError}
        />
      </div>
    </div>
  )
}

