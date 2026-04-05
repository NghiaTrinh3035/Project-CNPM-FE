import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";

import { AuthShell } from "@/features/auth/components/AuthShell";
import { loginSchema } from "@/features/auth/schemas/authSchemas";
import { authApi } from "@/services/api/authApi";
import { ROUTES } from "@/shared/constants/routes";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import { resolvePostLoginRedirect } from "@/shared/lib/authRedirect";
import type { AuthSession, UserRole } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type LoginValues = z.infer<typeof loginSchema>;

const normalizeRole = (role: string): UserRole => {
  if (role === "OWNER" || role === "STAFF" || role === "CUSTOMER") {
    return role;
  }
  return "CUSTOMER";
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? (error instanceof Error ? error.message : fallback);
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (input: LoginValues) =>
      authApi.login({ usernameOrEmail: input.usernameOrEmail, password: input.password }),
    onSuccess: (resp) => {
      const session: AuthSession = {
        token: resp.accessToken,
        refreshToken: "",
        user: {
          id: resp.userId,
          username: resp.username || resp.email.split("@")[0],
          fullName: resp.username ?? resp.email,
          email: resp.email,
          phone: "",
          role: normalizeRole(resp.role),
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      };

      setSession(session);
      toast.success("Đăng nhập thành công.", { duration: 3000 });
      const redirect = resolvePostLoginRedirect(
        session.user.role,
        (location.state as { from?: string } | null)?.from,
      );
      navigate(redirect, { replace: true });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Đăng nhập thất bại")),
  });

  return (
    <AuthShell title="Đăng nhập" subtitle="Truy cập tài khoản khách hàng, staff hoặc owner">
      <form className="space-y-4" onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email hoặc username</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" {...form.register("usernameOrEmail")} />
          </div>
          {form.formState.errors.usernameOrEmail ? (
            <p className="text-xs text-red-500">{form.formState.errors.usernameOrEmail.message}</p>
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
      </form>
    </AuthShell>
  );
};


