import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import {
  voucherCreateSchema,
  voucherUpdateSchema,
  type VoucherFormValues,
} from '@/features/vouchers/schemas/voucherSchema'

interface VoucherFormProps {
  mode: 'create' | 'update'
  initialValues?: Partial<VoucherFormValues>
  submitError?: string | null
  onSubmit: (values: VoucherFormValues) => Promise<void>
  onCancel: () => void
}

export function VoucherForm({ mode, initialValues, submitError, onSubmit, onCancel }: VoucherFormProps) {
  const schema = mode === 'create' ? voucherCreateSchema : voucherUpdateSchema

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VoucherFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      discountPercent: 0,
      validFrom: '',
      validTo: '',
      quantity: 1,
      status: 'ACTIVE',
      ...initialValues,
    },
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField error={errors.code?.message} label="Ma voucher" required>
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('code')} />
        </FormField>

        <FormField error={errors.discountPercent?.message} label="Phan tram giam" required>
          <input
            className="h-11 w-full rounded-lg border border-app-border px-3 text-sm"
            type="number"
            {...register('discountPercent', { valueAsNumber: true })}
          />
        </FormField>

        <FormField error={errors.validFrom?.message} label="Ngay bat dau" required>
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" type="datetime-local" {...register('validFrom')} />
        </FormField>

        <FormField error={errors.validTo?.message} label="Ngay ket thuc" required>
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" type="datetime-local" {...register('validTo')} />
        </FormField>

        <FormField error={errors.quantity?.message} label="So luong" required>
          <input
            className="h-11 w-full rounded-lg border border-app-border px-3 text-sm"
            type="number"
            {...register('quantity', { valueAsNumber: true })}
          />
        </FormField>

        <FormField error={errors.status?.message} label="Trang thai" required>
          <select className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('status')}>
            <option value="ACTIVE">Dang hoat dong</option>
            <option value="EXPIRED">Het han</option>
            <option value="USED_UP">Da dung het</option>
          </select>
        </FormField>
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex items-center gap-2 pt-2">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Dang luu...' : mode === 'create' ? 'Them moi' : 'Cap nhat'}
        </Button>
        <Button onClick={onCancel} variant="secondary">
          Huy
        </Button>
      </div>
    </form>
  )
}

