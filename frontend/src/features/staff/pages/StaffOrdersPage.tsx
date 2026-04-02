import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { ORDER_STATUS_LABEL } from "@/shared/constants/labels";
import { orderService } from "@/services/orderService";
import type { OrderStatus } from "@/shared/types/domain";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { LoadingState } from "@/shared/components/states/LoadingState";
import { EmptyState } from "@/shared/components/states/EmptyState";

const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "DELIVERED",
  DELIVERED: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
  RETURNED: null,
};

export const StaffOrdersPage = () => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  const ordersQuery = useQuery({
    queryKey: ["staff-orders"],
    queryFn: orderService.getAllOrders,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderService.updateOrderStatus(id, status, "Cập nhật bởi nhân viên"),
    onSuccess: () => {
      toast.success("Cập nhật trạng thái thành công.");
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const filteredOrders = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false;
      }
      if (keyword) {
        const searchLower = keyword.toLowerCase();
        return (
          order.id.toLowerCase().includes(searchLower) ||
          order.shipping.address.fullName.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [ordersQuery.data, keyword, statusFilter]);

  if (ordersQuery.isLoading) {
    return <LoadingState text="Đang tải danh sách đơn hàng..." />;
  }

  if (ordersQuery.isError) {
    return (
      <EmptyState
        title="Lỗi tải dữ liệu"
        description="Không thể tải danh sách đơn hàng. Vui lòng thử lại sau."
        actionLabel="Thử lại"
        onAction={() => ordersQuery.refetch()}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle>Quản lý đơn hàng</CardTitle>
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo mã đơn hoặc tên khách hàng..." />
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as OrderStatus | "ALL")}>
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(ORDER_STATUS_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredOrders.length === 0 ? (
          <EmptyState
            title="Không tìm thấy đơn hàng"
            description="Không có đơn hàng nào phù hợp với bộ lọc hiện tại."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const next = nextStatusMap[order.status];
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{order.shipping.address.fullName}</span>
                        <span className="text-xs text-muted-foreground">{order.shipping.address.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.status === "PENDING" ? "warning" : order.status === "CANCELLED" ? "danger" : "outline"}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{order.total.toLocaleString("vi-VN")} ₫</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/staff/orders/${order.id}`}>Chi tiết</Link>
                        </Button>
                        {next ? (
                          <Button
                            size="sm"
                            disabled={updateStatusMutation.isPending}
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: next })}
                          >
                            {ORDER_STATUS_LABEL[next]}
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
