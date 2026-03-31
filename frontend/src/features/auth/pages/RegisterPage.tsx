import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";

import { AuthShell } from "@/features/auth/components/AuthShell";
import { PasswordStrengthMeter } from "@/features/auth/components/PasswordStrengthMeter";
import { registerSchema } from "@/features/auth/schemas/authSchemas";
import { authApi } from "@/services/api/authApi";
import type { OtpResponse, RegisterPayload } from "@/services/api/authApi";
import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type RegisterValues = z.infer<typeof registerSchema>;

const getErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? (error instanceof Error ? error.message : fallback);
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      phone: "",
      address: "",
      gender: "MALE",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: (values: RegisterValues) => {
      const payload: RegisterPayload = {
        username: values.username || values.email.split("@")[0],
        password: values.password,
        email: values.email,
        phone: values.phone,
        address: values.address || "",
        gender: values.gender ?? undefined,
      };
      return authApi.register(payload);
    },
    onSuccess: (result: OtpResponse) => {
      toast.success(result.message ?? "Đăng ký thành công. Vui lòng kiểm tra email.");
      navigate(ROUTES.auth.verifyEmail, { state: { email: result.email ?? form.getValues("email") } });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Đăng ký thất bại")),
  });

  return (
    <AuthShell title="Tạo tài khoản mới" subtitle="Đăng ký nhanh để bắt đầu mua sắm và theo dõi đơn hàng">
      <form className="space-y-4" onSubmit={form.handleSubmit((values) => registerMutation.mutate(values))}>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tên đăng nhập</label>
          <Input {...form.register("username")} placeholder="username" />
          {form.formState.errors.username ? (
            <p className="text-xs text-red-500">{form.formState.errors.username.message}</p>
          ) : null}

          <label className="text-sm font-medium">Họ và tên</label>
          <Input {...form.register("fullName")} placeholder="Nguyễn Văn A" />
          {form.formState.errors.fullName ? (
            <p className="text-xs text-red-500">{form.formState.errors.fullName.message}</p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input {...form.register("email")} placeholder="you@example.com" />
            {form.formState.errors.email ? (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Số điện thoại</label>
            <Input {...form.register("phone")} placeholder="0909xxxxxx" />
            {form.formState.errors.phone ? (
              <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Địa chỉ</label>
          <Input {...form.register("address")} placeholder="123 Đường A, Quận B" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Giới tính</label>
          <select {...form.register("gender")} className="w-full rounded-md border px-3 py-2">
            <option value="">Chọn giới tính</option>        
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mật khẩu</label>
            <Input type="password" {...form.register("password")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Xác nhận mật khẩu</label>
            <Input type="password" {...form.register("confirmPassword")} />
          </div>
        </div>

        <PasswordStrengthMeter password={String(form.watch("password") ?? "")} />
        {form.formState.errors.confirmPassword ? (
          <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
        ) : null}

        <Button type="submit" variant="luxury" className="w-full" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Đang tạo tài khoản..." : "Đăng ký"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link className="text-luxury-gold hover:underline" to={ROUTES.auth.login}>
            Đăng nhập ngay
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};
