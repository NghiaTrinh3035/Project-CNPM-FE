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

const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "SHIPPING",
  SHIPPING: "DELIVERED",
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
        return order.id.toLowerCase().includes(keyword.toLowerCase());
      }
      return true;
    });
  }, [ordersQuery.data, keyword, statusFilter]);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle>Quản lý đơn hàng</CardTitle>
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo mã đơn..." />
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
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.shipping.address.fullName}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === "PENDING" ? "warning" : "outline"}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.total.toLocaleString("vi-VN")} VND</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/staff/orders/${order.id}`}>Chi tiết</Link>
                      </Button>
                      {next ? (
                        <Button
                          size="sm"
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
      </CardContent>
    </Card>
  );
};
