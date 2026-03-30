import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { productFormSchema, type ProductFormValues } from '@/features/products/schemas/productSchema'
import type { ProductCategory } from '@/features/products/types/product'

interface ProductFormProps {
  mode: 'create' | 'update'
  categories: ProductCategory[]
  initialValues?: Partial<ProductFormValues>
  submitError?: string | null
  onSubmit: (values: ProductFormValues) => Promise<void>
  onCancel: () => void
}

export function ProductForm({ mode, categories, initialValues, submitError, onSubmit, onCancel }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      brand: '',
      name: '',
      description: '',
      price: 1,
      stockQuantity: 0,
      categoryId: '',
      movementType: '',
      glassMaterial: '',
      waterResistance: '',
      faceSize: '',
      wireMaterial: '',
      wireColor: '',
      caseColor: '',
      faceColor: '',
      status: 'ACTIVE',
      ...initialValues,
    },
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField error={errors.brand?.message} label="Thương hiệu" required>
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('brand')} />
        </FormField>

        <FormField error={errors.name?.message} label="Tên sản phẩm" required>
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('name')} />
        </FormField>
      </div>

      <FormField error={errors.description?.message} label="Mô tả">
        <textarea className="min-h-24 w-full rounded-lg border border-app-border px-3 py-2 text-sm" {...register('description')} />
      </FormField>

      <div className="grid gap-4 md:grid-cols-3">
        <FormField error={errors.price?.message} label="Giá bán" required>
          <input
            className="h-11 w-full rounded-lg border border-app-border px-3 text-sm"
            type="number"
            {...register('price', { valueAsNumber: true })}
          />
        </FormField>

        <FormField error={errors.stockQuantity?.message} label="Tồn kho" required>
          <input
            className="h-11 w-full rounded-lg border border-app-border px-3 text-sm"
            type="number"
            {...register('stockQuantity', { valueAsNumber: true })}
          />
        </FormField>

        <FormField error={errors.categoryId?.message} label="Danh mục" required>
          <select className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('categoryId')}>
            <option value="">Chọn danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField error={errors.movementType?.message} label="Bộ máy">
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('movementType')} />
        </FormField>
        <FormField error={errors.glassMaterial?.message} label="Kính">
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('glassMaterial')} />
        </FormField>
        <FormField error={errors.waterResistance?.message} label="Chống nước">
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('waterResistance')} />
        </FormField>
        <FormField error={errors.faceSize?.message} label="Kích thước mặt">
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('faceSize')} />
        </FormField>
        <FormField error={errors.wireMaterial?.message} label="Chất liệu dây">
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('wireMaterial')} />
        </FormField>
        <FormField error={errors.wireColor?.message} label="Màu dây">
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('wireColor')} />
        </FormField>
        <FormField error={errors.caseColor?.message} label="Màu vỏ">
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('caseColor')} />
        </FormField>
        <FormField error={errors.faceColor?.message} label="Màu mặt">
          <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('faceColor')} />
        </FormField>
        {mode === 'update' && (
          <FormField error={errors.status?.message} label="Trạng thái" required>
            <select className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('status')}>
              <option value="ACTIVE">Đang kinh doanh</option>
              <option value="OUT_OF_STOCK">Hết hàng</option>
              <option value="DISCONTINUED">Ngừng kinh doanh</option>
            </select>
          </FormField>
        )}
      </div>

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


