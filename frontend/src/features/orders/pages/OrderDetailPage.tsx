import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, Clock, Truck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { EmptyState } from "@/shared/components/states/EmptyState";
import { ORDER_STATUS_LABEL } from "@/shared/constants/labels";
import { orderService } from "@/services/orderService";
import { useSession } from "@/shared/hooks/useSession";
import { toCurrency, toShortDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useSession();
  const queryClient = useQueryClient();

  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: () => (id ? orderService.getOrderById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  const cancelMutation = useMutation({
    mutationFn: () =>
      id && user ? orderService.cancelOrder(id, user.id) : Promise.reject(new Error("Không thể hủy đơn.")),
    onSuccess: () => {
      toast.success("Đã hủy đơn thành công.");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const order = orderQuery.data;
  if (!order) {
    return <EmptyState title="Không tìm thấy đơn hàng" description="Vui lòng kiểm tra lại mã đơn." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chi tiết đơn #{order.id}</CardTitle>
          <Badge variant={order.status === "PENDING" ? "warning" : "outline"}>{ORDER_STATUS_LABEL[order.status]}</Badge>
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
                <div className="flex items-center gap-3">
                  <p className="font-medium">{toCurrency(item.unitPrice * item.quantity)}</p>
                  {[
                    "DELIVERED",
                    "COMPLETED",
                  ].includes(order.status) ? (
                    <Button variant="outline" asChild>
                      <Link to={`/warranty/new?orderId=${order.id}&orderItemId=${item.id}`}>Tạo bảo hành</Link>
                    </Button>
                  ) : null}
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
          ))}
          {order.shipping.trackingCode ? (
            <div className="rounded-lg border border-border/60 p-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <Truck className="h-4 w-4" />
                Mã vận đơn: {order.shipping.trackingCode}
              </p>
              <p className="mt-1 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Dự kiến giao: {order.shipping.estimatedDelivery ? toShortDate(order.shipping.estimatedDelivery) : "Đang cập nhật"}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
