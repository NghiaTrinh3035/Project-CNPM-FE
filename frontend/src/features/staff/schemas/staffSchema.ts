import { z } from 'zod'

const vietnamPhoneRegex = /^(\+84|0)[3-9]\d{8}$/
const staffCodeRegex = /^[A-Za-z0-9_-]{3,30}$/

const commonFields = {
  fullName: z.string().trim().min(1, 'Vui lòng nhập họ và tên').max(80, 'Họ và tên tối đa 80 ký tự'),
  email: z.string().trim().min(1, 'Vui lòng nhập email').email('Email không đúng định dạng'),
  phone: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || vietnamPhoneRegex.test(value), 'Số điện thoại không hợp lệ'),
  address: z.string().trim().max(255, 'Địa chỉ tối đa 255 ký tự'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Vui lòng chọn giới tính',
  }),
  staffId: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã nhân viên')
    .max(30, 'Mã nhân viên tối đa 30 ký tự')
    .regex(staffCodeRegex, 'Mã nhân viên chỉ được gồm chữ, số, _, - (3-30 ký tự)'),
}

export const staffCreateSchema = z.object({
  ...commonFields,
  username: z
    .string()
    .trim()
    .min(3, 'Tên đăng nhập tối thiểu 3 ký tự')
    .max(50, 'Tên đăng nhập tối đa 50 ký tự'),
  password: z
    .string()
    .trim()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .max(100, 'Mật khẩu tối đa 100 ký tự'),
})

export const staffUpdateSchema = z.object({
  ...commonFields,
  username: z.string().optional(),
  password: z.string().optional(),
})

export type StaffCreateFormValues = z.infer<typeof staffCreateSchema>
export type StaffUpdateFormValues = z.infer<typeof staffUpdateSchema>
export type StaffFormValues = StaffUpdateFormValues

