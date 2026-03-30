import { z } from 'zod'

const optionalContractInfo = z.string().trim().max(500, 'Thông tin hợp đồng tối đa 500 ký tự')
const optionalAddress = z.string().trim().max(255, 'Địa chỉ tối đa 255 ký tự')

const commonFields = {
  name: z.string().trim().min(1, 'Vui lòng nhập tên nhà cung cấp').max(100, 'Tên nhà cung cấp tối đa 100 ký tự'),
  contractInfo: optionalContractInfo,
  address: optionalAddress,
}

export const supplierCreateSchema = z.object(commonFields)
export const supplierUpdateSchema = z.object(commonFields)

export type SupplierCreateFormValues = z.infer<typeof supplierCreateSchema>
export type SupplierUpdateFormValues = z.infer<typeof supplierUpdateSchema>
export type SupplierFormValues = SupplierUpdateFormValues

