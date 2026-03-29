import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";

export const ForbiddenPage = () => (
  <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
    <ShieldAlert className="h-12 w-12 text-luxury-gold" />
    <h1 className="mt-4 font-display text-4xl">Bạn không có quyền truy cập</h1>
    <p className="mt-2 text-sm text-muted-foreground">
      Trang này yêu cầu quyền hạn cao hơn. Vui lòng đăng nhập đúng vai trò.
    </p>
    <Button className="mt-6" asChild>
      <Link to={ROUTES.home}>Về trang chủ</Link>
    </Button>
  </section>
);
