import { z } from "zod";

const importReceiptItemSchema = z.object({
  productId: z.string().trim().min(1, "Vui long chon san pham."),
  quantity: z.coerce
    .number({ message: "Số lượng không hợp lệ." })
    .int("Số lượng phải là số nguyên.")
    .min(1, "Số lượng phải lớn hơn 0."),
  importPrice: z.coerce
    .number({ message: "Giá nhập không hợp lệ." })
    .int("Giá nhập phải là số nguyên.")
    .min(0, "Giá nhập không được âm."),
});

export const importReceiptFormSchema = z.object({
  supplierId: z.string().trim().min(1, "Vui lòng chọn nhà cung cấp."),
  note: z
    .string()
    .max(500, "Ghi chú không được vượt quá 500 ký tự.")
    .optional()
    .default(""),
  items: z.array(importReceiptItemSchema).min(1, "ần ít nhất 1 dòng sản phẩm."),
});

export type ImportReceiptFormValues = z.infer<typeof importReceiptFormSchema>;
