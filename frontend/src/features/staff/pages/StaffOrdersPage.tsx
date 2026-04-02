import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

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


export const StaffOrdersPage = () => {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const ordersQuery = useQuery({
    queryKey: ["staff-orders"],
    queryFn: orderService.getAllOrders,
  });


  const filteredOrders = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false;
      }
      if (dateFilter) {
        const orderDate = order.createdAt.slice(0, 10);
        if (orderDate !== dateFilter) {
          return false;
        }
      }
      if (keyword) {
        const searchLower = keyword.toLowerCase();
        return (
          order.id.toLowerCase().includes(searchLower) ||
          order.shipping.address.fullName.toLowerCase().includes(searchLower) ||
          order.shipping.address.phone.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [ordersQuery.data, keyword, statusFilter, dateFilter]);

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
        <div className="grid gap-3 md:grid-cols-[1fr_200px_200px]">
          <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo mã đơn, tên KH hoặc SĐT..." />
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as OrderStatus | "ALL")}>
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(ORDER_STATUS_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
          <Input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} placeholder="Lọc theo ngày" />
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
              {filteredOrders.map((order) => (
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
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/staff/orders/${order.id}`}>Cập nhật trạng thái</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
