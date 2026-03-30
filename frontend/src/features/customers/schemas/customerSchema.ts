import { z } from 'zod'

const vietnamPhoneRegex = /^(\+84|0)[3-9]\d{8}$/

const commonFields = {
  fullName: z.string().trim().min(1, 'Vui lòng nhập họ và tên').max(80, 'Họ và tên tối đa 80 ký tự'),
  email: z.string().trim().min(1, 'Vui lòng nhập email').email('Email không đúng định dạng'),
  phone: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || vietnamPhoneRegex.test(value), 'Số điện thoại không hợp lệ'),
  address: z.string().trim().min(1, 'Vui lòng nhập địa chỉ').max(255, 'Địa chỉ tối đa 255 ký tự'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Vui lòng chọn giới tính',
  }),
}

export const customerCreateSchema = z.object({
  ...commonFields,
  username: z.string().trim().min(3, 'Tên đăng nhập tối thiểu 3 ký tự').max(50, 'Tên đăng nhập tối đa 50 ký tự'),
  password: z.string().trim().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(100, 'Mật khẩu tối đa 100 ký tự'),
})

export const customerUpdateSchema = z.object({
  ...commonFields,
  username: z.string().optional(),
  password: z.string().optional(),
})

export type CustomerCreateFormValues = z.infer<typeof customerCreateSchema>
export type CustomerUpdateFormValues = z.infer<typeof customerUpdateSchema>
export type CustomerFormValues = CustomerUpdateFormValues

