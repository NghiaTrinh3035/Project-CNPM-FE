import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import {
  supplierCreateSchema,
  supplierUpdateSchema,
  type SupplierFormValues,
} from '@/features/suppliers/schemas/supplierSchema'

interface SupplierFormProps {
  mode: 'create' | 'update'
  initialValues?: Partial<SupplierFormValues>
  submitError?: string | null
  onSubmit: (values: SupplierFormValues) => Promise<void>
  onCancel: () => void
}

export function SupplierForm({ mode, initialValues, submitError, onSubmit, onCancel }: SupplierFormProps) {
  const schema = mode === 'create' ? supplierCreateSchema : supplierUpdateSchema

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      contractInfo: '',
      address: '',
      ...initialValues,
    },
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <FormField error={errors.name?.message} label="Tên nhà cung cấp" required>
        <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('name')} />
      </FormField>

      <FormField error={errors.contractInfo?.message} label="Thông tin hợp đồng">
        <textarea className="min-h-24 w-full rounded-lg border border-app-border px-3 py-2 text-sm" {...register('contractInfo')} />
      </FormField>

      <FormField error={errors.address?.message} label="Địa chỉ">
        <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('address')} />
      </FormField>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex items-center gap-2 pt-2">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Đang lưu...' : mode === 'create' ? 'Thêm mới' : 'Cập nhật'}
        </Button>
        <Button onClick={onCancel} variant="secondary">
          Hủy
        </Button>
      </div>
    </form>
  )
}

