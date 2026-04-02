import { z } from "zod";

const vietnamPhoneRegex = /^(\+84|0)[3-9]\d{8}$/;

const commonFields = {
  fullName: z.string().trim().min(1, "Vui long nhap ho va ten").max(80, "Ho va ten toi da 80 ky tu"),
  email: z.string().trim().min(1, "Vui long nhap email").email("Email khong dung dinh dang"),
  phone: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || vietnamPhoneRegex.test(value), "So dien thoai khong hop le"),
  address: z.string().trim().min(1, "Vui long nhap dia chi").max(255, "Dia chi toi da 255 ky tu"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Vui long chon gioi tinh",
  }),
};

export const customerCreateSchema = z.object({
  ...commonFields,
  username: z.string().trim().min(3, "Ten dang nhap toi thieu 3 ky tu").max(50, "Ten dang nhap toi da 50 ky tu"),
  password: z.string().trim().min(8, "Mat khau toi thieu 8 ky tu").max(100, "Mat khau toi da 100 ky tu"),
});

export const customerUpdateSchema = z.object({
  ...commonFields,
  username: z.string().trim().min(3, "Ten dang nhap toi thieu 3 ky tu").max(50, "Ten dang nhap toi da 50 ky tu"),
  password: z.string().optional(),
});

export type CustomerCreateFormValues = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateFormValues = z.infer<typeof customerUpdateSchema>;
export type CustomerFormValues = CustomerUpdateFormValues;


