import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { EmptyState } from "@/shared/components/states/EmptyState";
import { queryKeys } from "@/shared/constants/queryKeys";
import { notificationService } from "@/services/notificationService";
import { useSession } from "@/shared/hooks/useSession";
import { useWebSocket } from "@/shared/hooks/useWebSocket";
import { toShortDate } from "@/shared/lib/format";
import type { NotificationType } from "@/shared/types/domain";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Select } from "@/shared/ui/select";

type ReadFilter = "ALL" | "UNREAD" | "READ";
type TypeFilter = "ALL" | NotificationType;

const TYPE_FILTERS: Array<{ value: TypeFilter; label: string }> = [
  { value: "ALL", label: "Tất cả loại" },
  { value: "ORDER", label: "Đơn hàng" },
  { value: "PROMOTION", label: "Khuyến mại" },
  { value: "SYSTEM", label: "Hệ thống" },
  { value: "NEWS", label: "Tin tức" },
  { value: "WARRANTY", label: "Bảo hành" },
  { value: "SUPPORT", label: "Hỗ trợ" },
];

export const NotificationsPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [readFilter, setReadFilter] = useState<ReadFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications(user?.id),
    queryFn: () => (user ? notificationService.listByUser(user.id) : Promise.resolve([])),
    enabled: Boolean(user),
  });

  // Kích hoạt kết nối WebSocket để nhận thông báo realtime
  useWebSocket();

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        if (readFilter === "UNREAD" && notification.isRead) {
          return false;
        }
        if (readFilter === "READ" && !notification.isRead) {
          return false;
        }
        if (typeFilter !== "ALL" && notification.type !== typeFilter) {
          return false;
        }
        return true;
      }),
    [notifications, readFilter, typeFilter],
  );

  const refreshNotifications = () => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user.id) });
    }
  };

  const markAllMutation = useMutation({
    mutationFn: () => (user ? notificationService.markAllAsRead(user.id) : Promise.resolve()),
    onSuccess: () => {
      toast.success("Đã đánh dấu tất cả là đã đọc.");
      refreshNotifications();
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (notificationId: string) =>
      user ? notificationService.markAsRead(user.id, notificationId) : Promise.resolve(),
    onSuccess: refreshNotifications,
  });

  const deleteOneMutation = useMutation({
    mutationFn: (notificationId: string) =>
      user ? notificationService.deleteOne(user.id, notificationId) : Promise.resolve(),
    onSuccess: () => {
      toast.success("Đã xóa thông báo.");
      refreshNotifications();
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => (user ? notificationService.clearAll(user.id) : Promise.resolve()),
    onSuccess: () => {
      toast.success("Đã xóa tất cả thông báo.");
      refreshNotifications();
    },
  });

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Trung tâm thông báo</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 ? <Badge variant="warning">{unreadCount} chưa đọc</Badge> : <Badge variant="outline">Đã đọc hết</Badge>}
            <Button variant="outline" onClick={() => markAllMutation.mutate()} disabled={notifications.length === 0}>
              Đánh dấu đã đọc tất cả
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!notifications.length) {
                  return;
                }
                if (window.confirm("Xóa tất cả thông báo?")) {
                  clearAllMutation.mutate();
                }
              }}
              disabled={notifications.length === 0}
            >
              Xóa tất cả
            </Button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Select value={readFilter} onChange={(event) => setReadFilter(event.target.value as ReadFilter)}>
            <option value="ALL">Tất cả</option>
            <option value="UNREAD">Chưa đọc</option>
            <option value="READ">Đã đọc</option>
          </Select>
          <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}>
            {TYPE_FILTERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {filteredNotifications.length ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-4 ${
                notification.isRead ? "border-border/60 bg-card/40" : "border-luxury-gold/40 bg-luxury-gold/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{notification.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{toShortDate(notification.createdAt)}</p>
                </div>
                {!notification.isRead ? <Badge variant="warning">Mới</Badge> : null}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {notification.href ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={notification.href}
                      onClick={() => {
                        if (!notification.isRead) {
                          markOneMutation.mutate(notification.id);
                        }
                      }}
                    >
                      Mở chi tiết
                    </Link>
                  </Button>
                ) : null}

                {!notification.isRead ? (
                  <Button variant="ghost" size="sm" onClick={() => markOneMutation.mutate(notification.id)}>
                    Đánh dấu đã đọc
                  </Button>
                ) : null}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm("Xóa thông báo này?")) {
                      deleteOneMutation.mutate(notification.id);
                    }
                  }}
                >
                  Xóa
                </Button>
              </div>
            </div>
          ))
        ) : notifications.length ? (
          <EmptyState title="Không có kết quả" description="Không có thông báo nào phù hợp với bộ lọc hiện tại." />
        ) : (
          <EmptyState title="Chưa có thông báo" description="Thông báo mới sẽ hiển thị tại đây." />
        )}
      </CardContent>
    </Card>
  );
};
