import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { EmptyState } from "@/shared/components/states/EmptyState";
import { ORDER_STATUS_LABEL } from "@/shared/constants/labels";
import { orderService } from "@/services/orderService";
import { useSession } from "@/shared/hooks/useSession";
import { toCurrency, toShortDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

export const OrdersPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const ordersQuery = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: () => (user ? orderService.getOrdersByUser(user.id) : Promise.resolve([])),
    enabled: Boolean(user),
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) =>
      user ? orderService.cancelOrder(orderId, user.id) : Promise.reject(new Error("Chưa đăng nhập")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
      toast.success("Hủy đơn thành công.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (ordersQuery.data?.length === 0) {
    return (
      <EmptyState
        title="Bạn chưa có đơn hàng"
        description="Các đơn hàng sau khi thanh toán sẽ hiển thị tại đây."
        actionLabel="Đi mua sắm"
        onAction={() => (window.location.href = "/shop")}
      />
    );
  }

  return (
    <div className="space-y-4">
      {ordersQuery.data?.map((order) => (
        <Card key={order.id}>
          <CardContent className="space-y-3 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Đơn hàng #{order.id}</p>
                <p className="text-xs text-muted-foreground">{toShortDate(order.createdAt)}</p>
              </div>
              <Badge variant={order.status === "PENDING" ? "warning" : "outline"}>{ORDER_STATUS_LABEL[order.status]}</Badge>
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
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/orders/${order.id}`}>Xem chi tiết</Link>
              </Button>
              {order.status === "PENDING" ? (
                <Button variant="danger" onClick={() => cancelMutation.mutate(order.id)}>
                  Hủy đơn
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
