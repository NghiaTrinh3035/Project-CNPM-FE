import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { EmptyState } from "@/shared/components/states/EmptyState";
import { queryKeys } from "@/shared/constants/queryKeys";
import { notificationService } from "@/services/notificationService";
import { useSession } from "@/shared/hooks/useSession";
import { toShortDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export const NotificationsPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications(user?.id),
    queryFn: () => (user ? notificationService.listByUser(user.id) : Promise.resolve([])),
    enabled: Boolean(user),
  });

  const markAllMutation = useMutation({
    mutationFn: () => (user ? notificationService.markAllAsRead(user.id) : Promise.resolve()),
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user.id) });
      }
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (notificationId: string) =>
      user ? notificationService.markAsRead(user.id, notificationId) : Promise.resolve(),
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user.id) });
      }
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trung tâm thông báo</CardTitle>
        <Button variant="outline" onClick={() => markAllMutation.mutate()}>
          Đánh dấu đã đọc tất cả
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {notificationsQuery.data?.length ? (
          notificationsQuery.data.map((notification) => (
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
              <div className="mt-3 flex gap-2">
                {notification.href ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={notification.href}>Mở chi tiết</Link>
                  </Button>
                ) : null}
                {!notification.isRead ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markOneMutation.mutate(notification.id)}
                  >
                    Đánh dấu đã đọc
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="Chưa có thông báo" description="Thông báo mới sẽ hiển thị tại đây." />
        )}
      </CardContent>
    </Card>
  );
};
