import { z } from "zod";

export const loginSchema = z.object({
  usernameOrEmail: z
    .string()
    .trim()
    .min(3, "Vui lòng nhập email hoặc tên đăng nhập."),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự."),
});

export const registerSchema = z
  .object({
    username: z.string().min(3, "Tên đăng nhập tối thiểu 3 ký tự."),
    fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự."),
    email: z.email("Email không hợp lệ."),
    phone: z
      .string()
      .min(9, "Số điện thoại không hợp lệ.")
      .max(11, "Số điện thoại không hợp lệ."),
    address: z.string().min(1, "Địa chỉ là bắt buộc."),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    password: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự.")
      .regex(/[A-Z]/, "Mật khẩu cần ít nhất 1 chữ in hoa.")
      .regex(/[0-9]/, "Mật khẩu cần ít nhất 1 chữ số."),
    confirmPassword: z.string(),
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "Xác nhận mật khẩu không khớp.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.email("Email không hợp lệ."),
});
