import { z } from "zod";

const warrantyStatusSchema = z.enum(["RECEIVED", "PROCESSING", "COMPLETED", "REJECTED"]);

const optionalText = z.string().trim().max(1000, "Tối đa 1000 ký tự");

const dateTimeStringSchema = z.string().trim().min(1, "Vui lòng chọn thời gian");

export const warrantyCreateSchema = z
  .object({
    customerName: z.string().trim().min(1, "Vui lòng nhập tên khách hàng").max(100, "Tối đa 100 ký tự"),
    customerPhone: z.string().trim().min(1, "Vui lòng nhập số điện thoại").max(20, "Tối đa 20 ký tự"),
    productId: z.string().trim().min(1, "Vui lòng nhập mã sản phẩm"),
    quantity: z.coerce.number().int("Số lượng phải là số nguyên").min(1, "Số lượng tối thiểu là 1"),
    issueDescription: z.string().trim().min(1, "Vui lòng nhập mô tả vấn đề").max(1000, "Tối đa 1000 ký tự"),
    receivedDate: dateTimeStringSchema,
    expectedReturnDate: dateTimeStringSchema,
    technicianNote: optionalText,
  })
  .refine(
    (value) => new Date(value.expectedReturnDate).getTime() >= new Date(value.receivedDate).getTime(),
    {
      message: "Ngày dự kiến trả phải từ ngày nhận trở đi",
      path: ["expectedReturnDate"],
    },
  );

export const warrantyProcessSchema = z
  .object({
    status: warrantyStatusSchema,
    technicianNote: optionalText,
    rejectReason: optionalText,
  })
  .superRefine((value, context) => {
    if (value.status === "REJECTED" && value.rejectReason.trim().length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rejectReason"],
        message: "Vui lòng nhập lý do từ chối khi chọn trạng thái Từ chối",
      });
    }
  });

export type WarrantyCreateFormValues = z.infer<typeof warrantyCreateSchema>;
export type WarrantyProcessFormValues = z.infer<typeof warrantyProcessSchema>;

