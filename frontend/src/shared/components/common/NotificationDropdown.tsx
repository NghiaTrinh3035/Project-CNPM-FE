import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

import { queryKeys } from "@/shared/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import { toShortDate } from "@/shared/lib/format";
import { notificationService } from "@/services/notificationService";
import { useSession } from "@/shared/hooks/useSession";
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

export const NotificationDropdown = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  const { data = [] } = useQuery({
    queryKey: queryKeys.notifications(user?.id),
    queryFn: () => (user ? notificationService.listByUser(user.id) : Promise.resolve([])),
    enabled: Boolean(user),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => {
      if (!user) {
        return Promise.resolve();
      }
      return notificationService.markAsRead(user.id, notificationId);
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user.id) });
      }
    },
  });

  const unreadCount = data.filter((item) => !item.isRead).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Thông báo">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-luxury-gold" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Thông báo</span>
          {unreadCount > 0 ? <Badge variant="warning">{unreadCount} mới</Badge> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {data.slice(0, 5).map((item) => (
          <DropdownMenuItem
            key={item.id}
            onSelect={() => markAsReadMutation.mutate(item.id)}
            className="block space-y-1 p-3"
          >
            <Link to={item.href ?? ROUTES.customer.notifications} className="block">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.message}</p>
              <p className="text-[11px] text-muted-foreground">{toShortDate(item.createdAt)}</p>
            </Link>
          </DropdownMenuItem>
        ))}
        {data.length === 0 ? (
          <DropdownMenuItem className="p-3 text-sm text-muted-foreground">Chưa có thông báo mới.</DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={ROUTES.customer.notifications}>Xem tất cả thông báo</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
