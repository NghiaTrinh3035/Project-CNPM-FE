import { Link } from "react-router-dom";

import { ROUTES } from "@/shared/constants/routes";
import type { User } from "@/shared/types/domain";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface UserAccountMenuProps {
  user: User;
  showAdminLink?: boolean;
  adminRoute?: string;
  onLogout: () => void;
}

export const UserAccountMenu = ({ user, showAdminLink = false, adminRoute, onLogout }: UserAccountMenuProps) => {
  const displayName = user.fullName ?? user.username ?? "";
  const initials = (displayName || "U").slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar>
            <AvatarImage src={user.avatar} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p className="font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <Badge className="mt-1 w-fit" variant="outline">
            {user.role}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showAdminLink && adminRoute ? (
          <DropdownMenuItem asChild>
            <Link to={adminRoute}>Trang quản trị</Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link to={ROUTES.customer.profile}>Tài khoản</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={ROUTES.customer.orders}>Đơn hàng</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout}>Đăng xuất</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
