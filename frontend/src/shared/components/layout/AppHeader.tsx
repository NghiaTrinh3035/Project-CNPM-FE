import { AnimatePresence, motion } from "framer-motion";
import { Menu, Scale, Search, ShoppingBag, UserCircle2, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { ThemeToggle } from "@/shared/components/common/ThemeToggle";
import { NotificationDropdown } from "@/shared/components/common/NotificationDropdown";
import { Logo } from "@/shared/components/layout/Logo";
import { ROUTES } from "@/shared/constants/routes";
import { cartService } from "@/services/cartService";
import { useCompareStore } from "@/shared/hooks/useCompareStore";
import { useSession } from "@/shared/hooks/useSession";
import { cn } from "@/shared/lib/cn";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Input } from "@/shared/ui/input";

const mainNav = [
  { to: ROUTES.shop, label: "Bộ sưu tập" },
  { to: ROUTES.compare, label: "So sánh" },
  { to: ROUTES.about, label: "Về chúng tôi" },
  { to: ROUTES.contact, label: "Liên hệ" },
];

export const AppHeader = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useSession();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const compareCount = useCompareStore((state) => state.productIds.length);

  const { data: cartData } = useQuery({
    queryKey: ["header-cart", user?.id],
    queryFn: () => (user ? cartService.getCart(user.id) : Promise.resolve(null)),
    enabled: Boolean(user),
  });

  const cartCount = cartData?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`${ROUTES.search}?keyword=${encodeURIComponent(keyword)}`);
  };

  const roleDashboardPath =
    user?.role === "STAFF" ? ROUTES.staff.dashboard : user?.role === "OWNER" ? ROUTES.owner.dashboard : ROUTES.customer.profile;

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 lg:flex">
            {mainNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors hover:text-luxury-gold",
                    isActive ? "text-luxury-gold" : "text-muted-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSearch} className="hidden max-w-md flex-1 items-center gap-2 md:flex">
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm thương hiệu, mẫu hoặc bộ máy..."
            className="bg-card/40"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button variant="ghost" size="icon" className="relative rounded-full" asChild>
            <Link to={ROUTES.compare} aria-label="So sánh sản phẩm">
              <Scale className="h-5 w-5" />
              {compareCount > 0 ? (
                <span className="absolute right-1 top-1 rounded-full bg-luxury-gold px-1.5 text-[10px] text-black">
                  {compareCount}
                </span>
              ) : null}
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="relative rounded-full" asChild>
            <Link to={ROUTES.customer.cart} aria-label="Giỏ hàng">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute right-1 top-1 rounded-full bg-luxury-gold px-1.5 text-[10px] text-black">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </Button>

          {isAuthenticated ? <NotificationDropdown /> : null}

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.fullName} />
                    <AvatarFallback>{user.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <Badge className="mt-1 w-fit" variant="outline">
                    {user.role}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={roleDashboardPath}>Trang quản trị</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.customer.profile}>Tài khoản</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.customer.orders}>Đơn hàng</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    logout();
                    navigate(ROUTES.home);
                  }}
                >
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" className="hidden sm:inline-flex" asChild>
              <Link to={ROUTES.auth.login}>
                <UserCircle2 className="mr-2 h-4 w-4" />
                Đăng nhập
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full lg:hidden"
            aria-label="Mở menu"
            onClick={() => setIsMobileOpen((value) => !value)}
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border/50 bg-background lg:hidden"
          >
            <div className="space-y-2 px-4 py-4">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm kiếm đồng hồ..."
                />
                <Button type="submit" variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              {mainNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated ? (
                <Link
                  to={ROUTES.auth.login}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-luxury-gold hover:bg-accent"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Đăng nhập / Đăng ký
                </Link>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};
