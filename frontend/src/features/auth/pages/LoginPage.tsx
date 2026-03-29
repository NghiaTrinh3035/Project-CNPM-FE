import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";

import { AuthShell } from "@/features/auth/components/AuthShell";
import { loginSchema } from "@/features/auth/schemas/authSchemas";
import { authApi } from "@/services/api/authApi";
import { setAuthToken } from "@/api/axiosClient";
import { DEMO_ACCOUNTS } from "@/shared/constants/demoAccounts";
import { ROUTES } from "@/shared/constants/routes";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type LoginValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "customer@example.com",
      password: "Demo@123",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (input: LoginValues) => authApi.login({ email: input.email, password: input.password }),
    onSuccess: (resp) => {
      const session = {
        token: resp.accessToken,
        refreshToken: "",
        user: {
          id: resp.userId,
          fullName: resp.username ?? resp.email,
          email: resp.email,
          phone: "",
          role: resp.role as any,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      } as any;

      setSession(session);
      setAuthToken(resp.accessToken);
      toast.success("Đăng nhập thành công.");
      const redirect = location.state?.from ?? ROUTES.home;
      navigate(redirect, { replace: true });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message ?? error?.message ?? "Đăng nhập thất bại";
      toast.error(message);
    },
  });

  return (
    <AuthShell title="Đăng nhập" subtitle="Truy cập tài khoản khách hàng, staff hoặc owner">
      <form className="space-y-4" onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" {...form.register("email")} />
          </div>
          {form.formState.errors.email ? (
            <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input type="password" className="pl-9" {...form.register("password")} />
          </div>
          {form.formState.errors.password ? (
            <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-sm">
          <Link className="text-luxury-gold hover:underline" to={ROUTES.auth.forgotPassword}>
            Quên mật khẩu?
          </Link>
          <Link className="text-luxury-gold hover:underline" to={ROUTES.auth.register}>
            Chưa có tài khoản? Đăng ký ngay
          </Link>
        </div>

        <Button type="submit" className="w-full" variant="luxury" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>

        <Button type="button" variant="outline" className="w-full">
          Đăng nhập bằng Google (UI Placeholder)
        </Button>
      </form>

      <div className="space-y-2 rounded-xl border border-border/60 bg-card/40 p-4">
        <p className="text-sm font-medium">Demo accounts</p>
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            className="w-full rounded-md border border-border/50 px-3 py-2 text-left text-xs hover:border-luxury-gold"
            onClick={() => {
              form.setValue("email", account.email);
              form.setValue("password", account.password);
            }}
          >
            <p className="font-medium">
              {account.role}: {account.email}
            </p>
            <p className="text-muted-foreground">Password: {account.password}</p>
          </button>
        ))}
      </div>
    </AuthShell>
  );
};
