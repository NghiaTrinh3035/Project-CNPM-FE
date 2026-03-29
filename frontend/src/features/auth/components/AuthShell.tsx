import type { ReactNode } from "react";

import { Logo } from "@/shared/components/layout/Logo";
import { Card, CardContent } from "@/shared/ui/card";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export const AuthShell = ({ title, subtitle, children }: AuthShellProps) => (
  <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden px-4 py-10">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,165,92,0.16),transparent_48%)]" />
    <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2">
      <Card className="border-luxury-gold/20 bg-luxury-onyx/70 p-8 text-white">
        <CardContent className="space-y-4 p-0">
          <Logo />
          <p className="text-xs uppercase tracking-[0.25em] text-luxury-gold">Luxury account</p>
          <h1 className="font-display text-4xl">Đăng nhập để mở khóa trải nghiệm mua sắm cao cấp.</h1>
          <p className="text-sm text-white/70">
            Quản lý đơn hàng, bảo hành, thông báo và nhận tư vấn cá nhân hóa bằng AI.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="space-y-5 p-6">
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  </section>
);
