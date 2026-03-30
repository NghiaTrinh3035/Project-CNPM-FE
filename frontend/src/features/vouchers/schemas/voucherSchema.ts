import { z } from 'zod'

const voucherStatusSchema = z.enum(['ACTIVE', 'EXPIRED', 'USED_UP'])

const baseVoucherSchema = {
  code: z.string().trim().min(4, 'Ma voucher toi thieu 4 ky tu').max(50, 'Ma voucher toi da 50 ky tu'),
  discountPercent: z.number().int().min(0, 'Giam gia khong duoc am').max(100, 'Giam gia toi da 100%'),
  validFrom: z.string().trim().min(1, 'Vui long chon ngay bat dau'),
  validTo: z.string().trim().min(1, 'Vui long chon ngay ket thuc'),
  quantity: z.number().int().min(1, 'So luong toi thieu la 1'),
  status: voucherStatusSchema,
}

export const voucherCreateSchema = z
  .object(baseVoucherSchema)
  .refine((values) => new Date(values.validTo).getTime() > new Date(values.validFrom).getTime(), {
    path: ['validTo'],
    message: 'Ngay ket thuc phai sau ngay bat dau',
  })

export const voucherUpdateSchema = z
  .object(baseVoucherSchema)
  .refine((values) => new Date(values.validTo).getTime() > new Date(values.validFrom).getTime(), {
    path: ['validTo'],
    message: 'Ngay ket thuc phai sau ngay bat dau',
  })

export type VoucherCreateFormValues = z.infer<typeof voucherCreateSchema>
export type VoucherUpdateFormValues = z.infer<typeof voucherUpdateSchema>
export type VoucherFormValues = VoucherUpdateFormValues

