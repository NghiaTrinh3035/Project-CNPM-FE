import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { adminService } from "@/services/adminService";
import { orderService } from "@/services/orderService";
import { toCurrency } from "@/shared/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

export const OwnerCustomersPage = () => {
  const [keyword, setKeyword] = useState("");
  const customersQuery = useQuery({
    queryKey: ["owner-customers"],
    queryFn: adminService.listCustomers,
  });
  const ordersQuery = useQuery({
    queryKey: ["owner-customers-orders"],
    queryFn: orderService.getAllOrders,
  });

  const rows = useMemo(() => {
    const customers = customersQuery.data ?? [];
    const orders = ordersQuery.data ?? [];
    return customers
      .filter((customer) => {
        if (!keyword) return true;
        return (
          customer.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
          customer.email.toLowerCase().includes(keyword.toLowerCase())
        );
      })
      .map((customer) => {
        const customerOrders = orders.filter((order) => order.userId === customer.id);
        return {
          ...customer,
          totalOrders: customerOrders.length,
          totalRevenue: customerOrders.reduce((sum, order) => sum + order.total, 0),
        };
      });
  }, [customersQuery.data, ordersQuery.data, keyword]);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle>Quản lý khách hàng</CardTitle>
        <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo tên hoặc email..." />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Đơn hàng</TableHead>
              <TableHead>Tổng chi tiêu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <p className="font-medium">{customer.fullName}</p>
                  <p className="text-xs text-muted-foreground">{customer.phone}</p>
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.totalOrders}</TableCell>
                <TableCell>{toCurrency(customer.totalRevenue)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
