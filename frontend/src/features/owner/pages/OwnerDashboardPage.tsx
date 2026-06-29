import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChartLine, ClipboardList, DollarSign, Package, ShieldCheck, Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { reportApi } from "@/services/api/reportApi";
import { ORDER_STATUS_LABEL } from "@/shared/constants/labels";
import { toCurrency } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";

export const OwnerDashboardPage = () => {
  const overviewQuery = useQuery({
    queryKey: ["owner-dashboard-overview"],
    queryFn: () => reportApi.getOwnerOverview(),
  });

  const reportsQuery = useQuery({
    queryKey: ["owner-report-revenue"],
    queryFn: () => reportApi.getRevenue(),
  });

  const overview = overviewQuery.data;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Tổng quan Chủ cửa hàng</h1>
        <div className="flex gap-3">
          <Button 
            onClick={async () => {
              try {
                await reportApi.exportExcel();
                toast.success("Tải báo cáo Excel thành công!");
              } catch (error) {
                toast.error("Tải báo cáo thất bại, vui lòng thử lại sau.");
              }
            }}
            className="gap-2 bg-luxury-gold text-white hover:bg-luxury-gold/90"
          >
            <Download className="h-4 w-4" />
            Xuất Excel
          </Button>
          <Button 
            onClick={async () => {
              try {
                await reportApi.exportPdf();
                toast.success("Tải báo cáo PDF thành công!");
              } catch (error) {
                toast.error("Tải báo cáo PDF thất bại, vui lòng thử lại sau.");
              }
            }}
            className="gap-2 bg-rose-700 text-white hover:bg-rose-800"
          >
            <Download className="h-4 w-4" />
            Xuất PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: "Doanh thu",
            value: toCurrency(overview?.revenue ?? 0),
            icon: DollarSign,
          },
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
            {overview?.recentOrders.length ? (
              overview.recentOrders.map((order) => (
                <div key={order.id} className="rounded-lg border border-border/60 p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.shipping.address.fullName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                    </div>
                    <Badge variant={order.status === "PENDING" ? "warning" : "outline"}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{order.items.length} sản phẩm</span>
                    <span>{toCurrency(order.total)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có đơn hàng gần đây.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cảnh báo tồn kho thấp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overview?.lowStockProducts.length ? (
              overview.lowStockProducts.map((product) => (
                <div key={product.id} className="rounded-lg border border-border/60 p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    <div className="flex items-center gap-2 text-amber-500">
                      <AlertTriangle className="h-4 w-4" />
                      {product.stockQuantity}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Danh mục: {product.category.name}</p>
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
