import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChartLine, ClipboardList, DollarSign, Package, ShieldCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { adminService } from "@/services/adminService";
import { ORDER_STATUS_LABEL } from "@/shared/constants/labels";
import { toCurrency } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export const OwnerDashboardPage = () => {
  const overviewQuery = useQuery({
    queryKey: ["owner-overview"],
    queryFn: adminService.getOwnerOverview,
  });

  const reportsQuery = useQuery({
    queryKey: ["owner-overview-reports"],
    queryFn: adminService.listReports,
  });

  const overview = overviewQuery.data;

  return (
    <section className="space-y-5">
      <h1 className="font-display text-3xl">Tổng quan Chủ cửa hàng</h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Doanh thu", value: toCurrency(overview?.revenue ?? 0), icon: DollarSign },
          { label: "Tổng đơn hàng", value: overview?.totalOrders ?? 0, icon: ClipboardList },
          { label: "Đơn chờ xác nhận", value: overview?.pendingOrders ?? 0, icon: ChartLine },
          { label: "Sắp hết hàng", value: overview?.lowStockProducts.length ?? 0, icon: Package },
          { label: "Yêu cầu bảo hành", value: overview?.warrantyCount ?? 0, icon: ShieldCheck },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="space-y-2 p-5">
              <item.icon className="h-5 w-5 text-luxury-gold" />
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportsQuery.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="period" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#C9A55C" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview?.bestSellerStats.map((item) => (
              <div key={item.name} className="rounded-lg border border-border/60 p-3">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">Đã bán: {item.sold}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overview?.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.shipping.address.fullName}</p>
                </div>
                <Badge variant={order.status === "PENDING" ? "warning" : "outline"}>
                  {ORDER_STATUS_LABEL[order.status]}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cảnh báo tồn kho thấp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overview?.lowStockProducts.length ? (
              overview.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                  <div className="flex items-center gap-2 text-amber-500">
                    <AlertTriangle className="h-4 w-4" />
                    {product.stockQuantity}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Không có cảnh báo tồn kho thấp.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
