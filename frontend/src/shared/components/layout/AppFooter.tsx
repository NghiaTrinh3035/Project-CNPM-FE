import { Facebook, MessageCircleMore } from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "@/shared/components/layout/Logo";
import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export const AppFooter = () => (
  <footer className="border-t border-border/60 bg-card/30">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
      <div className="space-y-4 md:col-span-2">
        <Logo />
        <p className="max-w-md text-sm text-muted-foreground">
          ChronoLux mang đến trải nghiệm mua đồng hồ cao cấp với sản phẩm chính hãng, tư vấn chuyên sâu
          và dịch vụ hậu mãi minh bạch.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <Facebook className="mr-2 h-4 w-4" />
              Tư vấn Facebook
            </a>
          </Button>
          <Button variant="luxury" asChild>
            <a href="https://zalo.me" target="_blank" rel="noreferrer">
              <MessageCircleMore className="mr-2 h-4 w-4" />
              Tư vấn Zalo
            </a>
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold">Liên kết nhanh</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <Link to={ROUTES.shop}>Mua sắm</Link>
          </li>
          <li>
            <Link to={ROUTES.compare}>So sánh sản phẩm</Link>
          </li>
          <li>
            <Link to={ROUTES.about}>Về chúng tôi</Link>
          </li>
          <li>
            <Link to={ROUTES.contact}>Liên hệ</Link>
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Nhận ưu đãi mới</h4>
        <p className="text-sm text-muted-foreground">
          Đăng ký newsletter để nhận thông tin bộ sưu tập mới và ưu đãi riêng.
        </p>
        <form className="space-y-2">
          <Input type="email" placeholder="Email của bạn" />
          <Button className="w-full" variant="luxury">
            Đăng ký
          </Button>
        </form>
      </div>
    </div>

    <div className="border-t border-border/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-muted-foreground md:flex-row md:px-6">
        <p>© {new Date().getFullYear()} ChronoLux. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to={ROUTES.policies.terms}>Điều khoản</Link>
          <Link to={ROUTES.policies.privacy}>Bảo mật</Link>
          <Link to={ROUTES.policies.returnPolicy}>Đổi trả & Bảo hành</Link>
        </div>
      </div>
    </div>
  </footer>
);
