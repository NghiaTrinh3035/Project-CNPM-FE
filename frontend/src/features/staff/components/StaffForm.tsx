import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import {
  staffCreateSchema,
  staffUpdateSchema,
  type StaffFormValues,
} from '@/features/staff/schemas/staffSchema'

interface StaffFormProps {
  onSubmit: (values: StaffFormValues) => Promise<void>
  onCancel: () => void
  mode: 'create' | 'update'
  initialValues?: Partial<StaffFormValues>
  submitError?: string | null
}

export function StaffForm({ onSubmit, onCancel, mode, initialValues, submitError }: StaffFormProps) {
  const schema = mode === 'create' ? staffCreateSchema : staffUpdateSchema

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      password: '',
      fullName: '',
      email: '',
      phone: '',
      address: '',
      gender: 'MALE',
      staffId: '',
      ...initialValues,
    },
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {mode === 'create' && (
        <>
          <FormField error={errors.username?.message} label="Tên đăng nhập" required>
            <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('username')} />
          </FormField>

          <FormField error={errors.password?.message} label="Mật khẩu" required>
            <input
              className="h-11 w-full rounded-lg border border-app-border px-3 text-sm"
              type="password"
              {...register('password')}
            />
          </FormField>
        </>
      )}

      <FormField error={errors.staffId?.message} label="Mã nhân viên" required>
        <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('staffId')} />
      </FormField>

      <FormField error={errors.fullName?.message} label="Họ và tên" required>
        <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('fullName')} />
      </FormField>

      <FormField error={errors.email?.message} label="Email" required>
        <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('email')} />
      </FormField>

      <FormField error={errors.phone?.message} label="Số điện thoại">
        <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('phone')} />
      </FormField>

      <FormField error={errors.address?.message} label="Địa chỉ">
        <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('address')} />
      </FormField>

      <FormField error={errors.gender?.message} label="Giới tính" required>
        <select className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('gender')}>
          <option value="MALE">Nam</option>
          <option value="FEMALE">Nữ</option>
          <option value="OTHER">Khác</option>
        </select>
      </FormField>

      <div className="flex items-center gap-2 pt-2">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Đang lưu...' : mode === 'create' ? 'Thêm mới' : 'Cập nhật'}
        </Button>
        <Button onClick={onCancel} variant="secondary">
          Hủy
        </Button>
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
    </form>
  )
}

