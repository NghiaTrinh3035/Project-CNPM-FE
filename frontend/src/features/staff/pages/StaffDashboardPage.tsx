import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, Headset, Package, ShieldCheck, Truck } from "lucide-react";

import { adminService } from "@/services/adminService";
import { orderService } from "@/services/orderService";
import { chatSupportService } from "@/services/chatSupportService";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export const StaffDashboardPage = () => {
  const ordersQuery = useQuery({
    queryKey: ["staff-orders-overview"],
    queryFn: orderService.getAllOrders,
  });
  const receivedWarrantyQuery = useQuery({
    queryKey: ["staff-warranties-overview", "RECEIVED"],
    queryFn: () => adminService.listWarranties({ status: "RECEIVED", page: 1, pageSize: 1 }),
  });
  const processingWarrantyQuery = useQuery({
    queryKey: ["staff-warranties-overview", "PROCESSING"],
    queryFn: () => adminService.listWarranties({ status: "PROCESSING", page: 1, pageSize: 1 }),
  });
  const ticketsQuery = useQuery({
    queryKey: ["staff-support-overview"],
    queryFn: chatSupportService.listPending,
  });

  const totalOrders = ordersQuery.data?.length ?? 0;
  const pendingOrders = ordersQuery.data?.filter((item) => item.status === "PENDING").length ?? 0;
  const processingOrders = ordersQuery.data?.filter((item) => item.status === "CONFIRMED").length ?? 0;
  const openWarranties = (receivedWarrantyQuery.data?.total ?? 0) + (processingWarrantyQuery.data?.total ?? 0);
  const openTickets = ticketsQuery.data?.length ?? 0;

  return (
    <section className="space-y-5">
      <h1 className="font-display text-3xl">Tổng quan Nhân viên</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Tổng đơn hàng", value: totalOrders, icon: Package },
          { label: "Chờ xác nhận", value: pendingOrders, icon: ClipboardCheck },
          { label: "Đang xử lý", value: processingOrders, icon: Truck },
          { label: "Bảo hành mở", value: openWarranties, icon: ShieldCheck },
          { label: "Yêu cầu hỗ trợ", value: openTickets, icon: Headset },
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

      <Card>
        <CardHeader>
          <CardTitle>Gợi ý vận hành hôm nay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>- Ưu tiên xử lý đơn PENDING trước 12h để đảm bảo SLA giao hàng.</p>
          <p>- Kiểm tra các yêu cầu AI chuyển cấp để phản hồi trong vòng 30 phút.</p>
          <p>- Cập nhật trạng thái bảo hành ngay sau khi kỹ thuật viên bàn giao kết quả.</p>
        </CardContent>
      </Card>
    </section>
  );
};
