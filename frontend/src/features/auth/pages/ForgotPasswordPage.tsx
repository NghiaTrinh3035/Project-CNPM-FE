import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { AuthShell } from "@/features/auth/components/AuthShell";
import { forgotPasswordSchema } from "@/features/auth/schemas/authSchemas";
import { authService } from "@/services/authService";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type ForgotValues = z.infer<typeof forgotPasswordSchema>;

const resetSchema = z.object({
  newPassword: z.string().min(8, "Mật khẩu mới tối thiểu 8 ký tự."),
});

type ResetValues = z.infer<typeof resetSchema>;

export const ForgotPasswordPage = () => {
  const [emailToReset, setEmailToReset] = useState<string | null>(null);
  const forgotForm = useForm<ForgotValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "" },
  });

  const forgotMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (_, email) => {
      toast.success("Đã gửi email hướng dẫn (mock).");
      setEmailToReset(email);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const resetMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.resetPassword(email, password),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.");
      resetForm.reset();
    },
    onError: (error: Error) => toast.error(error.message),
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
            Gửi hướng dẫn
          </Button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={resetForm.handleSubmit((values) =>
            resetMutation.mutate({
              email: emailToReset,
              password: values.newPassword,
            }),
          )}
        >
          <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-sm text-muted-foreground">
            Email đặt lại: <span className="font-medium text-foreground">{emailToReset}</span>
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
          <Button type="submit" className="w-full" variant="luxury" disabled={resetMutation.isPending}>
            Đặt lại mật khẩu
          </Button>
        </form>
      )}
    </AuthShell>
  );
};
