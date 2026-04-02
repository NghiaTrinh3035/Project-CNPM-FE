import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

import { ORDER_STATUS_LABEL } from "@/shared/constants/labels";
import { orderService } from "@/services/orderService";
import type { OrderStatus } from "@/shared/types/domain";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Select } from "@/shared/ui/select";

// Theo usecase [19] Update Order Status:
// Pending → Confirmed / Cancelled
// Confirmed → Shipping / Cancelled
// Shipping → Delivered
// Delivered → Completed / Returned
const availableTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED"],
  DELIVERED: ["COMPLETED", "RETURNED"],
  COMPLETED: [],
  CANCELLED: [],
  RETURNED: [],
};

export const StaffOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const orderQuery = useQuery({
    queryKey: ["staff-order-detail", id],
    queryFn: () => (id ? orderService.getOrderById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");

  const updateMutation = useMutation({
    mutationFn: (status: OrderStatus) => {
      if (!id) {
        throw new Error("Không có mã đơn.");
      }
      // CANCELLED phải dùng endpoint riêng
      if (status === "CANCELLED") {
        return orderService.cancelOrder(id, order?.userId ?? "");
      }
      return orderService.updateOrderStatus(id, status, "Cập nhật bởi staff");
    },
    onSuccess: () => {
      toast.success("Cập nhật trạng thái thành công.");
      setSelectedStatus("");
      queryClient.invalidateQueries({ queryKey: ["staff-order-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const order = orderQuery.data;
  if (!order) {
    return <Card><CardContent className="p-6">Không tìm thấy đơn hàng.</CardContent></Card>;
  }

  const nextStatuses = availableTransitions[order.status];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng #{order.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge>{ORDER_STATUS_LABEL[order.status]}</Badge>
            <span className="text-sm text-muted-foreground">{order.shipping.address.fullName}</span>
          </div>

          <div className="space-y-2 rounded-xl border border-border/60 p-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span>{item.productName}</span>
                <span>x{item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-xl border border-border/60 p-4 text-sm">
            <p><strong>Địa chỉ:</strong> {order.shipping.address.detailAddress}, {order.shipping.address.ward}, {order.shipping.address.district}, {order.shipping.address.province}</p>
            <p><strong>SĐT:</strong> {order.shipping.address.phone}</p>
            <p><strong>Ghi chú:</strong> {order.shipping.note ?? "Không có"}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Lịch sử trạng thái</p>
            {order.timeline.map((event) => (
              <div key={`${event.status}-${event.at}`} className="rounded-md bg-accent/60 p-2 text-xs">
                {ORDER_STATUS_LABEL[event.status]} - {new Date(event.at).toLocaleString("vi-VN")}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Cập nhật trạng thái</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {nextStatuses.length > 0 ? (
            <>
              <Select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as OrderStatus | "")}>
                <option value="" disabled>
                  Chọn trạng thái tiếp theo
                </option>
                {nextStatuses.map((status) => (
                  <option key={status} value={status}>
                    {ORDER_STATUS_LABEL[status]}
                  </option>
                ))}
              </Select>
              <Button
                className="w-full"
                disabled={!selectedStatus || updateMutation.isPending}
                onClick={() => {
                  if (selectedStatus) {
                    updateMutation.mutate(selectedStatus);
                  }
                }}
              >
                Xác nhận
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center">Đơn hàng đã hoàn tất, không thể cập nhật thêm.</p>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["staff-order-detail", id] });
              orderQuery.refetch();
            }}
          >
            Làm mới
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
