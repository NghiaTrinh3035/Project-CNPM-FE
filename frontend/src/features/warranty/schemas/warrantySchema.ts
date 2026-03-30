import { z } from 'zod'

const optionalText = z.string().trim().max(1000, 'Nội dung tối đa 1000 ký tự')

const warrantyStatusSchema = z.enum(['RECEIVED', 'PROCESSING', 'COMPLETED', 'REJECTED'])

export const warrantyCreateSchema = z
  .object({
    customerPhone: z.string().trim().min(1, 'Vui lòng nhập số điện thoại khách hàng').max(20, 'Tối đa 20 ký tự'),
    customerName: z.string().trim().min(1, 'Vui lòng nhập tên khách hàng').max(100, 'Tối đa 100 ký tự'),
    issueDescription: z.string().trim().min(1, 'Vui lòng nhập mô tả lỗi').max(1000, 'Tối đa 1000 ký tự'),
    receivedDate: z.string().trim().min(1, 'Vui lòng chọn ngày nhận'),
    expectedReturnDate: z.string().trim().min(1, 'Vui lòng chọn ngày hẹn trả'),
    status: warrantyStatusSchema,
    technicianNote: optionalText,
    quantity: z.number().int().min(1, 'Số lượng tối thiểu là 1'),
    productId: z.string().trim().min(1, 'Vui lòng nhập mã sản phẩm'),
  })
  .refine((value) => new Date(value.expectedReturnDate).getTime() >= new Date(value.receivedDate).getTime(), {
    message: 'Ngày hẹn trả phải từ ngày nhận trở đi',
    path: ['expectedReturnDate'],
  })

export const warrantyProcessSchema = z
  .object({
    status: warrantyStatusSchema,
    technicianNote: optionalText,
    rejectReason: optionalText,
  })
  .superRefine((value, context) => {
    if (value.status === 'REJECTED' && value.rejectReason.trim().length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rejectReason'],
        message: 'Vui lòng nhập lý do từ chối khi chọn trạng thái Từ chối',
      })
    }
  })

export type WarrantyCreateFormValues = z.infer<typeof warrantyCreateSchema>
export type WarrantyProcessFormValues = z.infer<typeof warrantyProcessSchema>

