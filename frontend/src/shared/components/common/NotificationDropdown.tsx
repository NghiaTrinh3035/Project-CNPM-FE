import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

import { notificationService } from "@/services/notificationService";
import { queryKeys } from "@/shared/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import { useSession } from "@/shared/hooks/useSession";
import { toShortDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
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
      <DropdownMenuTrigger
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={"Th\u00f4ng b\u00e1o"}
      >
        <span className="pointer-events-none">
          <Bell className="h-5 w-5" />
        </span>
        {unreadCount > 0 ? (
          <span className="pointer-events-none absolute right-2 top-2 h-2 w-2 rounded-full bg-luxury-gold" />
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{"Th\u00f4ng b\u00e1o"}</span>
          {unreadCount > 0 ? <Badge variant="warning">{`${unreadCount} m\u1edbi`}</Badge> : null}
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
          <DropdownMenuItem className="p-3 text-sm text-muted-foreground">
            {"Ch\u01b0a c\u00f3 th\u00f4ng b\u00e1o m\u1edbi."}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={ROUTES.customer.notifications}>{"Xem t\u1ea5t c\u1ea3 th\u00f4ng b\u00e1o"}</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
