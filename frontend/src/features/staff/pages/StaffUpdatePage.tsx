import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { getStaffById, updateStaff } from '@/features/staff/api/staffService'
import { StaffForm } from '@/features/staff/components/StaffForm'
import type { StaffFormValues } from '@/features/staff/schemas/staffSchema'
import type { StaffUpdatePayload } from '@/features/staff/types/staff'
import { ROUTES } from '@/routes/paths'

function normalizeNullable(value: string): string | null {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

export function StaffUpdatePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [initialValues, setInitialValues] = useState<StaffFormValues | null>(null)

  useEffect(() => {
    const loadStaff = async () => {
      if (!id) {
        setError('Không tìm thấy mã nhân viên cần cập nhật.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const staff = await getStaffById(id)
        setInitialValues({
          username: staff.username,
          password: '',
          fullName: staff.fullName,
          email: staff.email,
          phone: staff.phone ?? '',
          address: staff.address ?? '',
          gender: staff.gender ?? 'MALE',
          staffId: staff.staffId,
        })
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Không thể tải thông tin nhân viên.')
      } finally {
        setLoading(false)
      }
    }

    void loadStaff()
  }, [id])

  const handleSubmit = async (values: StaffFormValues) => {
    if (!id) {
      throw new Error('Không tìm thấy mã nhân viên cần cập nhật.')
    }

    setSubmitError(null)

    const payload: StaffUpdatePayload = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: normalizeNullable(values.phone),
      address: normalizeNullable(values.address),
      gender: values.gender,
      staffId: values.staffId.trim(),
    }

    try {
      await updateStaff(id, payload)
      window.alert('Cập nhật nhân viên thành công')
      navigate(ROUTES.staffList)
    } catch (updateError) {
      setSubmitError(updateError instanceof Error ? updateError.message : 'Không thể cập nhật nhân viên. Vui lòng thử lại.')
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

      <h1 className="text-[32px] font-bold leading-tight text-slate-900">Cập nhật nhân viên</h1>
      <p className="mt-1 text-sm text-slate-500">Chỉnh sửa thông tin theo đúng contract cập nhật từ backend</p>

      <div className="mt-5 max-w-xl rounded-xl border border-app-border bg-white p-5">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && initialValues && (
          <StaffForm
            initialValues={initialValues}
            mode="update"
            onCancel={() => navigate(ROUTES.staffList)}
            onSubmit={handleSubmit}
            submitError={submitError}
          />
        )}
      </div>
    </div>
  )
}

