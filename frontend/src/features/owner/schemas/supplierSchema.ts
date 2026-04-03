import { z } from "zod";

export const supplierFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên nhà cung cấp.")
    .max(100, "Tên nhà cung cấp tối đa 100 ký tự."),
  contractInfo: z
    .string()
    .trim()
    .max(500, "Thông tin liên hệ tối đa 500 ký tự.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  address: z
    .string()
    .trim()
    .max(255, "Địa chỉ tối đa 255 ký tự.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;

