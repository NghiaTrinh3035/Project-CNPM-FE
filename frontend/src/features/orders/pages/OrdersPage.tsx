import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, PackageSearch } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { OrderCancellationDialog } from "@/features/orders/components/OrderCancellationDialog";
import type { CancelOrderInput } from "@/services/orderService";
import { orderService } from "@/services/orderService";
import { EmptyState } from "@/shared/components/states/EmptyState";
import { ErrorState } from "@/shared/components/states/ErrorState";
import { LoadingState } from "@/shared/components/states/LoadingState";
import { ORDER_STATUS_LABEL } from "@/shared/constants/labels";
import { ROUTES } from "@/shared/constants/routes";
import { useSession } from "@/shared/hooks/useSession";
import { toCurrency, toShortDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

const getStatusBadgeVariant = (status: string) => {
  if (status === "PENDING") {
    return "warning" as const;
  }
  if (status === "CANCELLED") {
    return "danger" as const;
  }
  return "outline" as const;
};

export const OrdersPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<"cancel" | "request" | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: () => (user ? orderService.getOrdersByUser(user.id) : Promise.resolve([])),
    enabled: Boolean(user),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ orderId, input }: { orderId: string; input: CancelOrderInput }) =>
      user ? orderService.cancelOrder(orderId, user.id, input) : Promise.reject(new Error("Chưa đăng nhập")),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
      if (order.refundRequired) {
        toast.success(order.refundMessage ?? "Đơn hàng đã hủy. Hoàn tiền sẽ được xử lý trong 3-7 ngày làm việc.");
      } else {
        toast.success("Đơn hàng đã được hủy thành công.");
      }
      setDialogMode(null);
      setActiveOrderId(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const requestCancelMutation = useMutation({
    mutationFn: ({ orderId, input }: { orderId: string; input: CancelOrderInput }) =>
      user ? orderService.requestCancel(orderId, user.id, input) : Promise.reject(new Error("Chưa đăng nhập")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
      toast.success("Yêu cầu hủy đơn đã được gửi. Nhân viên sẽ liên hệ với bạn.");
      setDialogMode(null);
      setActiveOrderId(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const orders = ordersQuery.data ?? [];
  const activeOrder = useMemo(
    () => orders.find((order) => order.id === activeOrderId) ?? null,
    [orders, activeOrderId],
  );

  const handleCancelAction = (mode: "cancel" | "request", orderId: string) => {
    setActiveOrderId(orderId);
    setDialogMode(mode);
  };

  const handleConfirmCancellation = (input: CancelOrderInput) => {
    if (!activeOrderId || !dialogMode) {
      return;
    }
    if (dialogMode === "cancel") {
      cancelMutation.mutate({ orderId: activeOrderId, input });
      return;
    }
    requestCancelMutation.mutate({ orderId: activeOrderId, input });
  };

  if (ordersQuery.isLoading) {
    return <LoadingState text="Đang tải danh sách đơn hàng..." />;
  }

  if (ordersQuery.isError) {
    return (
      <ErrorState
        message={ordersQuery.error instanceof Error ? ordersQuery.error.message : "Không thể tải danh sách đơn hàng."}
        onRetry={() => ordersQuery.refetch()}
      />
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="Bạn chưa có đơn hàng"
        description="Các đơn hàng sau khi thanh toán sẽ hiển thị tại đây."
        actionLabel="Đi mua sắm"
        onAction={() => (window.location.href = ROUTES.shop)}
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">Đơn hàng #{order.id}</p>
                  <p className="text-xs text-muted-foreground">{toShortDate(order.createdAt)}</p>
                </div>
                <Badge variant={getStatusBadgeVariant(order.status)}>{ORDER_STATUS_LABEL[order.status]}</Badge>
              </div>

              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <p className="flex items-center gap-1">
                  <PackageSearch className="h-4 w-4" />
                  {order.items.length} sản phẩm
                </p>
                <p className="flex items-center gap-1">
                  <Clock3 className="h-4 w-4" />
                  Thanh toán: {order.payment.method}
                </p>
                <p className="font-medium text-luxury-gold">{toCurrency(order.total)}</p>
              </div>

              {order.status === "CANCELLED" && order.refundRequired ? (
                <p className="text-xs text-muted-foreground">
                  {order.refundMessage ?? "Hoàn tiền sẽ được xử lý trong 3-7 ngày làm việc."}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <Link to={`/orders/${order.id}`}>Xem chi tiết</Link>
                </Button>
                {order.canCancel ? (
                  <Button variant="danger" onClick={() => handleCancelAction("cancel", order.id)}>
                    Hủy đơn
                  </Button>
                ) : null}
                {!order.canCancel && order.canRequestCancel ? (
                  <Button variant="outline" onClick={() => handleCancelAction("request", order.id)}>
                    Gửi yêu cầu hủy
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <OrderCancellationDialog
        open={Boolean(dialogMode && activeOrder)}
        mode={dialogMode === "request" ? "request" : "cancel"}
        onOpenChange={(open) => {
          if (!open) {
            setDialogMode(null);
            setActiveOrderId(null);
          }
        }}
        onConfirm={handleConfirmCancellation}
        loading={cancelMutation.isPending || requestCancelMutation.isPending}
      />
    </>
  );
};
