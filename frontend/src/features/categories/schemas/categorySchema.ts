import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên danh mục").max(100, "Tên danh mục tối đa 100 ký tự"),
  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự"),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

