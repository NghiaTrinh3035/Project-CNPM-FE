import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { warrantyCreateSchema, type WarrantyCreateFormValues } from '@/features/warranty/schemas/warrantySchema'

interface WarrantyFormProps {
  onSubmit: (values: WarrantyCreateFormValues) => Promise<void>
  onCancel: () => void
  submitError?: string | null
}

export function WarrantyForm({ onSubmit, onCancel, submitError }: WarrantyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WarrantyCreateFormValues>({
    resolver: zodResolver(warrantyCreateSchema),
    defaultValues: {
      customerPhone: '',
      customerName: '',
      issueDescription: '',
      receivedDate: '',
      expectedReturnDate: '',
      status: 'RECEIVED',
      technicianNote: '',
      quantity: 1,
      productId: '',
    },
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField error={errors.customerName?.message} label="Tên khách hàng" required>
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('customerName')} />
        </FormField>

        <FormField error={errors.customerPhone?.message} label="Số điện thoại" required>
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('customerPhone')} />
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField error={errors.productId?.message} label="Mã sản phẩm" required>
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('productId')} />
        </FormField>

        <FormField error={errors.quantity?.message} label="Số lượng" required>
          <input
            className="h-11 w-full rounded-lg border border-app-border px-3 text-sm"
            type="number"
            {...register('quantity', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField error={errors.issueDescription?.message} label="Mô tả lỗi" required>
        <textarea className="min-h-24 w-full rounded-lg border border-app-border px-3 py-2 text-sm" {...register('issueDescription')} />
      </FormField>

      <div className="grid gap-4 md:grid-cols-3">
        <FormField error={errors.receivedDate?.message} label="Ngày nhận" required>
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" type="date" {...register('receivedDate')} />
        </FormField>

        <FormField error={errors.expectedReturnDate?.message} label="Ngày hẹn trả" required>
          <input
            className="h-11 w-full rounded-lg border border-app-border px-3 text-sm"
            type="date"
            {...register('expectedReturnDate')}
          />
        </FormField>

        <FormField error={errors.status?.message} label="Trạng thái" required>
          <select className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('status')}>
            <option value="RECEIVED">Đã nhận</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="COMPLETED">Hoàn tất</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </FormField>
      </div>

      <FormField error={errors.technicianNote?.message} label="Ghi chú kỹ thuật">
        <textarea className="min-h-20 w-full rounded-lg border border-app-border px-3 py-2 text-sm" {...register('technicianNote')} />
      </FormField>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex items-center gap-2 pt-2">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Đang lưu...' : 'Thêm mới'}
        </Button>
        <Button onClick={onCancel} variant="secondary">
          Hủy
        </Button>
      </div>
    </form>
  )
}

