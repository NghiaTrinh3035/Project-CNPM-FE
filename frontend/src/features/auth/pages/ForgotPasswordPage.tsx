import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";

import { AuthShell } from "@/features/auth/components/AuthShell";
import { forgotPasswordSchema } from "@/features/auth/schemas/authSchemas";
import { authApi } from "@/services/api/authApi";
import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type ForgotValues = z.infer<typeof forgotPasswordSchema>;

const resetSchema = z
  .object({
    otp: z.string().length(6, "OTP phải gồm 6 chữ số."),
    newPassword: z.string().min(8, "Mật khẩu mới tối thiểu 8 ký tự."),
    confirmPassword: z.string().min(8, "Vui lòng xác nhận mật khẩu."),
  })
  .refine((input) => input.newPassword === input.confirmPassword, {
    message: "Xác nhận mật khẩu không khớp.",
    path: ["confirmPassword"],
  });

type ResetValues = z.infer<typeof resetSchema>;

const getErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? (error instanceof Error ? error.message : fallback);
};

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [emailToReset, setEmailToReset] = useState<string | null>(null);
  const forgotForm = useForm<ForgotValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  const forgotMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (result, email) => {
      toast.success(result.message ?? "Đã gửi OTP đến email của bạn.");
      setEmailToReset(email);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Không thể gửi OTP.")),
  });

  const resetMutation = useMutation({
    mutationFn: (payload: { email: string; values: ResetValues }) =>
      authApi.resetPassword({
        email: payload.email,
        otp: payload.values.otp,
        newPassword: payload.values.newPassword,
        confirmPassword: payload.values.confirmPassword,
      }),
    onSuccess: (result) => {
      toast.success(result.message ?? "Đặt lại mật khẩu thành công.");
      forgotForm.reset();
      resetForm.reset();
      setEmailToReset(null);
      navigate(ROUTES.auth.login, { replace: true });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Đặt lại mật khẩu thất bại.")),
  });

  return (
    <AuthShell title="Quên mật khẩu" subtitle="Khôi phục tài khoản nhanh và an toàn">
      {!emailToReset ? (
        <form className="space-y-4" onSubmit={forgotForm.handleSubmit((values) => forgotMutation.mutate(values.email))}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email đã đăng ký</label>
            <Input {...forgotForm.register("email")} placeholder="customer@example.com" />
            {forgotForm.formState.errors.email ? (
              <p className="text-xs text-red-500">{forgotForm.formState.errors.email.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" variant="luxury" disabled={forgotMutation.isPending}>
            {forgotMutation.isPending ? "Đang gửi OTP..." : "Gửi OTP"}
          </Button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={resetForm.handleSubmit((values) =>
            resetMutation.mutate({
              email: emailToReset,
              values,
            }),
          )}
        >
          <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-sm text-muted-foreground">
            OTP đã được gửi tới: <span className="font-medium text-foreground">{emailToReset}</span>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mã OTP</label>
            <Input {...resetForm.register("otp")} placeholder="Nhập OTP 6 chữ số" />
            {resetForm.formState.errors.otp ? (
              <p className="text-xs text-red-500">{resetForm.formState.errors.otp.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mật khẩu mới</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input type="password" className="pl-9" {...resetForm.register("newPassword")} />
            </div>
            {resetForm.formState.errors.newPassword ? (
              <p className="text-xs text-red-500">{resetForm.formState.errors.newPassword.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
            <Input type="password" {...resetForm.register("confirmPassword")} />
            {resetForm.formState.errors.confirmPassword ? (
              <p className="text-xs text-red-500">{resetForm.formState.errors.confirmPassword.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" variant="luxury" disabled={resetMutation.isPending}>
            {resetMutation.isPending ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setEmailToReset(null);
              resetForm.reset();
            }}
          >
            Dùng email khác
          </Button>
        </form>
      )}
    </AuthShell>
  );
};
