import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";

export const NotFoundPage = () => (
  <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
    <Compass className="h-12 w-12 text-luxury-gold" />
    <h1 className="mt-4 font-display text-5xl">404</h1>
    <p className="mt-2 text-sm text-muted-foreground">Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
    <Button className="mt-6" asChild>
      <Link to={ROUTES.home}>Quay lại trang chủ</Link>
    </Button>
  </section>
);
