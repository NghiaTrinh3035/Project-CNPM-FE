import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, Clock, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import type { OrderStatus } from "@/shared/types/domain";
import { toCurrency, toShortDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const TRACKING_STEPS: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "COMPLETED"];

const getStatusBadgeVariant = (status: string) => {
  if (status === "PENDING") {
    return "warning" as const;
  }
  if (status === "CANCELLED") {
    return "danger" as const;
  }
  return "outline" as const;
};

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [dialogMode, setDialogMode] = useState<"cancel" | "request" | null>(null);

  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: () => (id ? orderService.getOrderById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  const cancelMutation = useMutation({
    mutationFn: (input: CancelOrderInput) =>
      id && user ? orderService.cancelOrder(id, user.id, input) : Promise.reject(new Error("Không thể hủy đơn.")),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
      if (order.refundRequired) {
        toast.success(order.refundMessage ?? "Đơn hàng đã hủy. Hoàn tiền sẽ được xử lý trong 3-7 ngày làm việc.");
      } else {
        toast.success("Đơn hàng đã được hủy thành công.");
      }
      setDialogMode(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const requestCancelMutation = useMutation({
    mutationFn: (input: CancelOrderInput) =>
      id && user ? orderService.requestCancel(id, user.id, input) : Promise.reject(new Error("Không thể gửi yêu cầu hủy.")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
      toast.success("Yêu cầu hủy đơn đã được gửi. Nhân viên sẽ liên hệ với bạn.");
      setDialogMode(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const order = orderQuery.data;

  const stepIndex = useMemo(() => {
    if (!order) {
      return -1;
    }
    const index = TRACKING_STEPS.indexOf(order.status);
    return index;
  }, [order]);

  const handleConfirmCancellation = (input: CancelOrderInput) => {
    if (dialogMode === "request") {
      requestCancelMutation.mutate(input);
      return;
    }
    cancelMutation.mutate(input);
  };

  if (orderQuery.isLoading) {
    return <LoadingState text="Đang tải chi tiết đơn hàng..." />;
  }

  if (orderQuery.isError) {
    return (
      <ErrorState
        message={orderQuery.error instanceof Error ? orderQuery.error.message : "Không thể tải chi tiết đơn hàng."}
        onRetry={() => orderQuery.refetch()}
      />
    );
  }

  if (!order) {
    return <EmptyState title="Không tìm thấy đơn hàng" description="Vui lòng kiểm tra lại mã đơn hàng." />;
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Chi tiết đơn #{order.id}</CardTitle>
            <Badge variant={getStatusBadgeVariant(order.status)}>{ORDER_STATUS_LABEL[order.status]}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
              <p>Ngày tạo: {toShortDate(order.createdAt)}</p>
              <p>Thanh toán: {order.payment.method}</p>
              <p>Tổng tiền: {toCurrency(order.total)}</p>
            </div>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                  <div className="flex items-center gap-3">
                    <img src={item.productImage} alt={item.productName} className="h-16 w-16 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">{toCurrency(item.unitPrice * item.quantity)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-medium">{toCurrency(item.unitPrice * item.quantity)}</p>
                  {[
                    "DELIVERED",
                    "COMPLETED",
                  ].includes(order.status) ? (
                    <Button variant="outline" asChild>
                      <Link to={`/warranty/new?orderId=${order.id}&orderItemId=${item.id}`}>Tạo bảo hành</Link>
                    </Button>
                  ) : null}}
                </div>
              </div>
            ))}
          </div>
          {order.status === "PENDING" ? (
            <Button variant="danger" onClick={() => cancelMutation.mutate()}>
              Hủy đơn hàng
            </Button>
          ) : null}
          {["DELIVERED", "COMPLETED"].includes(order.status) ? (
            <Button variant="outline" asChild>
              <Link to="/shop">Viết đánh giá sản phẩm</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline trạng thái</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.timeline.map((event, index) => (
            <div key={`${event.status}-${event.at}`} className="flex gap-3">
              <div className="pt-0.5">
                {index === order.timeline.length - 1 ? (
                  <CheckCircle2 className="h-4 w-4 text-luxury-gold" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{ORDER_STATUS_LABEL[event.status]}</p>
                <p className="text-xs text-muted-foreground">{toShortDate(event.at)}</p>
                {event.note ? <p className="text-xs text-muted-foreground">{event.note}</p> : null}
              </div>
            </div>

            {order.refundRequired ? (
              <p className="rounded-lg border border-border/60 bg-accent/40 p-3 text-sm text-muted-foreground">
                {order.refundMessage ?? "Hoàn tiền sẽ được xử lý trong 3-7 ngày làm việc."}
              </p>
            ) : null}

            {order.cancellationNote ? (
              <p className="rounded-lg border border-border/60 p-3 text-sm text-muted-foreground">
                Ghi chú hủy đơn: {order.cancellationNote}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {order.canCancel ? (
                <Button variant="danger" onClick={() => setDialogMode("cancel")}>
                  Hủy đơn hàng
                </Button>
              ) : null}
              {!order.canCancel && order.canRequestCancel ? (
                <Button variant="outline" onClick={() => setDialogMode("request")}>
                  Gửi yêu cầu hủy
                </Button>
              ) : null}
              {["DELIVERED", "COMPLETED"].includes(order.status) ? (
                <Button variant="outline" asChild>
                  <Link to={ROUTES.shop}>Viết đánh giá sản phẩm</Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theo dõi đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.status !== "CANCELLED" ? (
              <div className="grid gap-3 md:grid-cols-5">
                {TRACKING_STEPS.map((step, index) => {
                  const isDone = stepIndex >= index;
                  return (
                    <div key={step} className="rounded-lg border border-border/60 p-3 text-center">
                      {isDone ? (
                        <CheckCircle2 className="mx-auto h-5 w-5 text-luxury-gold" />
                      ) : (
                        <Circle className="mx-auto h-5 w-5 text-muted-foreground" />
                      )}
                      <p className="mt-2 text-xs font-medium">{ORDER_STATUS_LABEL[step]}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-lg border border-border/60 bg-accent/40 p-3 text-sm text-muted-foreground">
                Đơn hàng đã được hủy.
              </p>
            )}

            <div className="space-y-3">
              {order.timeline.map((event, index) => (
                <div key={`${event.status}-${event.at}-${index}`} className="flex gap-3">
                  <div className="pt-0.5">
                    {index === order.timeline.length - 1 ? (
                      <CheckCircle2 className="h-4 w-4 text-luxury-gold" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{ORDER_STATUS_LABEL[event.status]}</p>
                    <p className="text-xs text-muted-foreground">{toShortDate(event.at)}</p>
                    {event.note ? <p className="text-xs text-muted-foreground">{event.note}</p> : null}
                  </div>
                </div>
              ))}
            </div>

            {order.shipping.trackingCode ? (
              <div className="rounded-lg border border-border/60 p-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <Truck className="h-4 w-4" />
                  Mã vận đơn: {order.shipping.trackingCode}
                </p>
                <p className="mt-1 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Dự kiến giao:{" "}
                  {order.shipping.estimatedDelivery ? toShortDate(order.shipping.estimatedDelivery) : "Đang cập nhật"}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <OrderCancellationDialog
        open={Boolean(dialogMode)}
        mode={dialogMode === "request" ? "request" : "cancel"}
        onOpenChange={(open) => {
          if (!open) {
            setDialogMode(null);
          }
        }}
        onConfirm={handleConfirmCancellation}
        loading={cancelMutation.isPending || requestCancelMutation.isPending}
      />
    </>
  );
};
