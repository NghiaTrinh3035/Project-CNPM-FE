import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCustomer } from '@/features/customers/api/customerService'
import { CustomerForm } from '@/features/customers/components/CustomerForm'
import type { CustomerFormValues } from '@/features/customers/schemas/customerSchema'
import type { CustomerCreatePayload } from '@/features/customers/types/customer'
import { ROUTES } from '@/routes/paths'

function normalizeNullable(value: string): string | null {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

export function CustomerCreatePage() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (values: CustomerFormValues) => {
    if (!values.username || !values.password) {
      throw new Error('Thiếu thông tin tên đăng nhập hoặc mật khẩu.')
    }

    setSubmitError(null)

    const payload: CustomerCreatePayload = {
      username: values.username.trim(),
      password: values.password.trim(),
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: normalizeNullable(values.phone),
      address: values.address.trim(),
      gender: values.gender,
    }

    try {
      await createCustomer(payload)
      window.alert('Thêm khách hàng thành công')
      navigate(ROUTES.customers)
    } catch (nextError) {
      setSubmitError(nextError instanceof Error ? nextError.message : 'Không thể tạo khách hàng. Vui lòng thử lại.')
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

      <h1 className="text-[32px] font-bold leading-tight text-slate-900">Thêm khách hàng mới</h1>
      <p className="mt-1 text-sm text-slate-500">Điền thông tin theo đúng contract tạo mới từ backend</p>

      <div className="mt-5 max-w-xl rounded-xl border border-app-border bg-white p-5">
        <CustomerForm
          mode="create"
          onCancel={() => navigate(ROUTES.customers)}
          onSubmit={handleSubmit}
          submitError={submitError}
        />
      </div>
    </div>
  )
}

