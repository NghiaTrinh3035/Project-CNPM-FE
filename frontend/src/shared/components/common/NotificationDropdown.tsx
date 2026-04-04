import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { notificationService } from "@/services/notificationService";
import { queryKeys } from "@/shared/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import { useSession } from "@/shared/hooks/useSession";
import { toShortDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export const NotificationDropdown = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full"
        aria-label="Thông báo"
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-luxury-gold" />
        ) : null}
      </Button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[22rem] overflow-hidden rounded-md border border-border/70 bg-popover/95 text-popover-foreground shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-popover/78">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-semibold">Thông báo</span>
            {unreadCount > 0 ? <Badge variant="warning">{unreadCount} mới</Badge> : null}
          </div>
          <div className="h-px bg-muted" />

          <div className="max-h-80 overflow-y-auto p-1">
            {data.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                to={item.href ?? ROUTES.customer.notifications}
                className="block rounded-sm p-3 transition-colors hover:bg-accent"
                onClick={() => {
                  if (!item.isRead) {
                    markAsReadMutation.mutate(item.id);
                  }
                  setOpen(false);
                }}
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.message}</p>
                <p className="text-[11px] text-muted-foreground">{toShortDate(item.createdAt)}</p>
              </Link>
            ))}

            {data.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">Chưa có thông báo mới.</p>
            ) : null}
          </div>

          <div className="h-px bg-muted" />
          <Link
            to={ROUTES.customer.notifications}
            className="block px-3 py-2 text-sm transition-colors hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            Xem tất cả thông báo
          </Link>
        </div>
      ) : null}
    </div>
  );
};
