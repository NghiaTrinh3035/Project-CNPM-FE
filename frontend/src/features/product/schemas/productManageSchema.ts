import { z } from "zod";

const optionalText100 = z.string().trim().max(100, "Tối đa 100 ký tự");
const optionalColorText = z
  .string()
  .trim()
  .max(100, "Tối đa 100 ký tự")
  .regex(/^[\p{L}\s-]*$/u, "Chỉ được nhập chữ cho trường màu sắc");

export const productManageSchema = z.object({
  brand: z.string().trim().min(1, "Vui lòng nhập thương hiệu").max(100, "Tối đa 100 ký tự"),
  name: z.string().trim().min(1, "Vui lòng nhập tên đồng hồ").max(200, "Tối đa 200 ký tự"),
  description: z.string().trim().max(1000, "Mô tả tối đa 1000 ký tự"),
  price: z.coerce.number().int("Giá phải là số nguyên").min(1, "Giá phải lớn hơn 0"),
  stockQuantity: z.coerce.number().int("Tồn kho phải là số nguyên").min(0, "Tồn kho không được âm"),
  categoryIds: z.array(z.string().trim().min(1)).min(1, "Vui lòng chọn ít nhất một danh mục"),
  movementType: optionalText100,
  glassMaterial: optionalText100,
  waterResistance: optionalText100,
  faceSize: optionalText100,
  wireMaterial: optionalText100,
  wireColor: optionalColorText,
  caseColor: optionalColorText,
  faceColor: optionalColorText,
  status: z.enum(["ACTIVE", "OUT_OF_STOCK", "DISCONTINUED"]),
});

export type ProductManageValues = z.infer<typeof productManageSchema>;

