import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { warrantyProcessSchema, type WarrantyProcessFormValues } from '@/features/warranty/schemas/warrantySchema'

interface WarrantyProcessFormProps {
  initialValues?: Partial<WarrantyProcessFormValues>
  onSubmit: (values: WarrantyProcessFormValues) => Promise<void>
  onCancel: () => void
  submitError?: string | null
}

export function WarrantyProcessForm({ initialValues, onSubmit, onCancel, submitError }: WarrantyProcessFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WarrantyProcessFormValues>({
    resolver: zodResolver(warrantyProcessSchema),
    defaultValues: {
      status: 'RECEIVED',
      technicianNote: '',
      rejectReason: '',
      ...initialValues,
    },
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <FormField error={errors.status?.message} label="Trạng thái" required>
        <select className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('status')}>
          <option value="RECEIVED">Đã nhận</option>
          <option value="PROCESSING">Đang xử lý</option>
          <option value="COMPLETED">Hoàn tất</option>
          <option value="REJECTED">Từ chối</option>
        </select>
      </FormField>

      <FormField error={errors.technicianNote?.message} label="Ghi chú kỹ thuật">
        <textarea className="min-h-24 w-full rounded-lg border border-app-border px-3 py-2 text-sm" {...register('technicianNote')} />
      </FormField>

      <FormField error={errors.rejectReason?.message} label="Lý do từ chối (chỉ bắt buộc khi chọn trạng thái Từ chối)">
        <textarea className="min-h-24 w-full rounded-lg border border-app-border px-3 py-2 text-sm" {...register('rejectReason')} />
      </FormField>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex items-center gap-2 pt-2">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Đang lưu...' : 'Cập nhật'}
        </Button>
        <Button onClick={onCancel} variant="secondary">
          Hủy
        </Button>
      </div>
    </form>
  )
}
