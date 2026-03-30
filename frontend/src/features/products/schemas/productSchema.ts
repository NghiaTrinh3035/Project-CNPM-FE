import { z } from 'zod'

const optionalText = z.string().trim().max(255, 'Thông tin tối đa 255 ký tự')

export const productFormSchema = z.object({
  brand: z.string().trim().min(1, 'Vui lòng nhập thương hiệu').max(100, 'Thương hiệu tối đa 100 ký tự'),
  name: z.string().trim().min(1, 'Vui lòng nhập tên sản phẩm').max(200, 'Tên sản phẩm tối đa 200 ký tự'),
  description: z.string().trim().max(1000, 'Mô tả tối đa 1000 ký tự'),
  price: z.number().min(1, 'Giá bán phải lớn hơn 0'),
  stockQuantity: z.number().int().min(0, 'Tồn kho không được âm'),
  categoryId: z.string().trim().min(1, 'Vui lòng chọn danh mục'),
  movementType: optionalText,
  glassMaterial: optionalText,
  waterResistance: optionalText,
  faceSize: optionalText,
  wireMaterial: optionalText,
  wireColor: optionalText,
  caseColor: optionalText,
  faceColor: optionalText,
  status: z.enum(['ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED']),
})

export type ProductFormValues = z.infer<typeof productFormSchema>


