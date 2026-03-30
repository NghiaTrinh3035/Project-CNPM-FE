import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createStaff } from '@/features/staff/api/staffService'
import { StaffForm } from '@/features/staff/components/StaffForm'
import type { StaffFormValues } from '@/features/staff/schemas/staffSchema'
import type { StaffCreatePayload } from '@/features/staff/types/staff'
import { ROUTES } from '@/routes/paths'

function normalizeNullable(value: string): string | null {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

export function StaffCreatePage() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (values: StaffFormValues) => {
    if (!values.username || !values.password) {
      throw new Error('Thiếu thông tin tên đăng nhập hoặc mật khẩu.')
    }

    setSubmitError(null)

    const payload: StaffCreatePayload = {
      username: values.username.trim(),
      password: values.password.trim(),
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: normalizeNullable(values.phone),
      address: normalizeNullable(values.address),
      gender: values.gender,
      staffId: values.staffId.trim(),
      role: 'STAFF',
    }

    try {
      await createStaff(payload)
      window.alert('Thêm nhân viên thành công')
      navigate(ROUTES.staffList)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể tạo nhân viên. Vui lòng thử lại.')
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

      <h1 className="text-[32px] font-bold leading-tight text-slate-900">Thêm nhân viên mới</h1>
      <p className="mt-1 text-sm text-slate-500">Điền thông tin theo đúng contract tạo mới từ backend</p>

      <div className="mt-5 max-w-xl rounded-xl border border-app-border bg-white p-5">
        <StaffForm
          mode="create"
          onCancel={() => navigate(ROUTES.staffList)}
          onSubmit={handleSubmit}
          submitError={submitError}
        />
      </div>
    </div>
  )
}

