import { BarChart3, Boxes, FileText, LayoutDashboard, LogOut, PackageSearch, ShieldCheck, Ticket, Truck, Users } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

import { ROUTES } from "@/shared/constants/routes";
import { useSession } from "@/shared/hooks/useSession";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

interface DashboardLayoutProps {
  role: "STAFF" | "OWNER";
}

const staffMenu = [
  { to: ROUTES.staff.dashboard, label: "Tổng quan", icon: LayoutDashboard },
  { to: ROUTES.staff.orders, label: "Quản lý đơn", icon: Truck },
  { to: ROUTES.staff.warranties, label: "Bảo hành", icon: ShieldCheck },
  { to: ROUTES.staff.products, label: "Sản phẩm", icon: PackageSearch },
  { to: ROUTES.staff.customers, label: "Khách hàng", icon: Users },
  { to: ROUTES.staff.support, label: "Hỗ trợ khách hàng", icon: Ticket },
];

const ownerMenu = [
  { to: ROUTES.owner.dashboard, label: "Tổng quan", icon: LayoutDashboard },
  { to: ROUTES.owner.products, label: "Sản phẩm", icon: PackageSearch },
  { to: ROUTES.owner.inventory, label: "Tồn kho", icon: Boxes },
  { to: ROUTES.owner.suppliers, label: "Nhà cung cấp", icon: Users },
  { to: ROUTES.owner.importReceipts, label: "Phiếu nhập", icon: FileText },
  { to: ROUTES.owner.customers, label: "Khách hàng", icon: Users },
  { to: ROUTES.owner.warranties, label: "Bảo hành", icon: ShieldCheck },
  { to: ROUTES.owner.staff, label: "Nhân viên", icon: Users },
  { to: ROUTES.owner.vouchers, label: "Voucher", icon: Ticket },
  { to: ROUTES.owner.reports, label: "Báo cáo", icon: BarChart3 },
  { to: ROUTES.owner.content, label: "Nội dung tĩnh", icon: FileText },
];

export const DashboardLayout = ({ role }: DashboardLayoutProps) => {
  const { logout } = useSession();
  const menu = role === "OWNER" ? ownerMenu : staffMenu;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-72 border-r border-border/60 bg-card/40 p-6 lg:block">
        <p className="text-xs uppercase tracking-[0.3em] text-luxury-gold">ChronoLux Console</p>
        <h2 className="mt-2 font-display text-2xl">{role === "OWNER" ? "Bảng điều khiển Chủ cửa hàng" : "Bảng điều khiển Nhân viên"}</h2>
        <nav className="mt-8 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
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

      <div className="flex flex-1 flex-col">
        <header className="border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center justify-between">
            <div className="space-x-3">
              <Button variant="outline" asChild>
                <Link to={ROUTES.home}>Về trang khách</Link>
              </Button>
              <Button variant="ghost" onClick={() => window.location.reload()}>Làm mới màn hình</Button>
            </div>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
