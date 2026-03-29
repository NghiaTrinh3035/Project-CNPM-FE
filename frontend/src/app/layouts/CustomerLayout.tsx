import { Bell, ShieldCheck, ShoppingBag, UserCircle2, Wallet } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { ROUTES } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";

const items = [
  { to: ROUTES.customer.profile, label: "Thông tin tài khoản", icon: UserCircle2 },
  { to: ROUTES.customer.orders, label: "Đơn hàng", icon: ShoppingBag },
  { to: ROUTES.customer.warranty, label: "Bảo hành", icon: ShieldCheck },
  { to: ROUTES.customer.notifications, label: "Thông báo", icon: Bell },
  { to: ROUTES.customer.cart, label: "Giỏ hàng", icon: Wallet },
];

export const CustomerLayout = () => (
  <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[260px_1fr] md:px-6">
    <aside className="rounded-2xl border border-border/60 bg-card/50 p-4">
      <h2 className="font-display text-xl">Tài khoản của tôi</h2>
      <nav className="mt-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground",
                isActive && "bg-accent text-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
    <div>
      <Outlet />
    </div>
  </section>
);
