import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { updateSupplier } from '@/features/suppliers/api/supplierService'
import { SupplierForm } from '@/features/suppliers/components/SupplierForm'
import { useSupplierDetail } from '@/features/suppliers/hooks/useSupplierDetail'
import type { SupplierFormValues } from '@/features/suppliers/schemas/supplierSchema'
import type { SupplierUpdatePayload } from '@/features/suppliers/types/supplier'
import { ROUTES } from '@/routes/paths'

function toNullable(value: string): string | null {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function mapPayload(values: SupplierFormValues): SupplierUpdatePayload {
  return {
    name: values.name.trim(),
    contractInfo: toNullable(values.contractInfo),
    address: toNullable(values.address),
  }
}

export function SupplierUpdatePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data, loading, error, reload } = useSupplierDetail(id)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (values: SupplierFormValues) => {
    if (!id) {
      throw new Error('Không tìm thấy mã nhà cung cấp cần cập nhật.')
    }

    setSubmitError(null)
    try {
      await updateSupplier(id, mapPayload(values))
      window.alert('Cập nhật nhà cung cấp thành công')
      navigate(ROUTES.suppliers)
    } catch (nextError) {
      setSubmitError(nextError instanceof Error ? nextError.message : 'Không thể cập nhật nhà cung cấp. Vui lòng thử lại.')
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

      <h1 className="text-[32px] font-bold leading-tight text-slate-900">Cập nhật nhà cung cấp</h1>
      <p className="mt-1 text-sm text-slate-500">Chỉnh sửa thông tin theo contract cập nhật từ backend</p>

      <div className="mt-5 max-w-xl rounded-xl border border-app-border bg-white p-5">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && data && (
          <SupplierForm
            initialValues={{
              name: data.name,
              contractInfo: data.contractInfo ?? '',
              address: data.address ?? '',
            }}
            mode="update"
            onCancel={() => navigate(ROUTES.suppliers)}
            onSubmit={handleSubmit}
            submitError={submitError}
          />
        )}
      </div>
    </div>
  )
}

