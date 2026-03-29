import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { toast } from "sonner";

import { adminService } from "@/services/adminService";
import { orderService } from "@/services/orderService";
import { toCurrency } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const statusColor: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#0ea5e9",
  SHIPPING: "#6366f1",
  DELIVERED: "#10b981",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
  RETURNED: "#f97316",
};

export const OwnerReportsPage = () => {
  const reportsQuery = useQuery({
    queryKey: ["owner-report-revenue"],
    queryFn: adminService.listReports,
  });
  const ordersQuery = useQuery({
    queryKey: ["owner-report-orders"],
    queryFn: orderService.getAllOrders,
  });
  const overviewQuery = useQuery({
    queryKey: ["owner-report-overview"],
    queryFn: adminService.getOwnerOverview,
  });
  const customersQuery = useQuery({
    queryKey: ["owner-report-customers"],
    queryFn: adminService.listCustomers,
  });

  const orderStatusData = Object.entries(
    (ordersQuery.data ?? []).reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const topCustomers = (customersQuery.data ?? [])
    .map((customer) => {
      const relatedOrders = (ordersQuery.data ?? []).filter((order) => order.userId === customer.id);
      return {
        name: customer.fullName,
        spending: relatedOrders.reduce((sum, order) => sum + order.total, 0),
      };
    })
    .sort((a, b) => b.spending - a.spending)
    .slice(0, 5);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Reports</h1>
        <Button
          variant="outline"
          onClick={() =>
            toast.success("Đã mô phỏng export báo cáo CSV thành công.")
          }
        >
          <Download className="mr-2 h-4 w-4" />
          Export (Mock)
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by month</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportsQuery.data ?? []}>
                <XAxis dataKey="period" />
                <Tooltip formatter={(value) => toCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#C9A55C" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order status distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={96}
                  label
                >
                  {orderStatusData.map((entry) => (
                    <Cell key={entry.name} fill={statusColor[entry.name] ?? "#8884d8"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top customers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topCustomers.map((customer) => (
              <div key={customer.name} className="rounded-lg border border-border/60 p-3">
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{toCurrency(customer.spending)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best selling watches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overviewQuery.data?.bestSellerStats.map((item) => (
              <div key={item.name} className="rounded-lg border border-border/60 p-3">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">Đã bán: {item.sold}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
