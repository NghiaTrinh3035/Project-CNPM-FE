import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { getCustomerById, updateCustomer } from '@/features/customers/api/customerService'
import { CustomerForm } from '@/features/customers/components/CustomerForm'
import type { CustomerFormValues } from '@/features/customers/schemas/customerSchema'
import type { CustomerUpdatePayload } from '@/features/customers/types/customer'
import { ROUTES } from '@/routes/paths'

function normalizeNullable(value: string): string | null {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

export function CustomerUpdatePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [initialValues, setInitialValues] = useState<CustomerFormValues | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Không tìm thấy mã khách hàng cần cập nhật.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const customer = await getCustomerById(id)
        setInitialValues({
          username: customer.username,
          password: '',
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone ?? '',
          address: customer.address,
          gender: customer.gender ?? 'OTHER',
        })
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : 'Không thể tải thông tin khách hàng.')
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [id])

  const handleSubmit = async (values: CustomerFormValues) => {
    if (!id) {
      throw new Error('Không tìm thấy mã khách hàng cần cập nhật.')
    }

    setSubmitError(null)

    const payload: CustomerUpdatePayload = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: normalizeNullable(values.phone),
      address: values.address.trim(),
      gender: values.gender,
    }

    try {
      await updateCustomer(id, payload)
      window.alert('Cập nhật khách hàng thành công')
      navigate(ROUTES.customers)
    } catch (nextError) {
      setSubmitError(nextError instanceof Error ? nextError.message : 'Không thể cập nhật khách hàng. Vui lòng thử lại.')
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

      <h1 className="text-[32px] font-bold leading-tight text-slate-900">Cập nhật khách hàng</h1>
      <p className="mt-1 text-sm text-slate-500">Chỉnh sửa thông tin theo đúng contract cập nhật từ backend</p>

      <div className="mt-5 max-w-xl rounded-xl border border-app-border bg-white p-5">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && initialValues && (
          <CustomerForm
            initialValues={initialValues}
            mode="update"
            onCancel={() => navigate(ROUTES.customers)}
            onSubmit={handleSubmit}
            submitError={submitError}
          />
        )}
      </div>
    </div>
  )
}

