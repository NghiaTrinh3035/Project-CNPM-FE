import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { adminService } from "@/services/adminService";
import { ROUTES } from "@/shared/constants/routes";
import { toShortDate } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-3 gap-3 border-b border-border/60 py-3 text-sm last:border-0">
	<p className="font-semibold">{label}</p>
	<p className="col-span-2 text-muted-foreground">{value}</p>
  </div>
);

export const StaffCustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const customerQuery = useQuery({
	queryKey: ["staff-customer-detail", id],
	queryFn: () => (id ? adminService.getCustomerById(id) : Promise.resolve(null)),
	enabled: Boolean(id),
  });

  const customer = customerQuery.data;

  return (
	<Card>
	  <CardHeader className="space-y-3">
		<Button variant="ghost" className="w-fit" onClick={() => navigate(-1)}>
		  <ArrowLeft className="mr-2 h-4 w-4" />
		  Quay lại
		</Button>
		<CardTitle>Chi tiết khách hàng (Staff)</CardTitle>
	  </CardHeader>
	  <CardContent>
		{!customerQuery.isLoading && !customer ? (
		  <p className="text-sm text-muted-foreground">Không tìm thấy khách hàng. <button className="underline" onClick={() => navigate(ROUTES.staff.customers)}>Về danh sách</button></p>
		) : null}

		{customer ? (
		  <div>
			<DetailRow label="Mã khách hàng" value={customer.id} />
			<DetailRow label="Tài khoản" value={customer.username || "--"} />
			<DetailRow label="Họ và tên" value={customer.fullName || "--"} />
			<DetailRow label="Email" value={customer.email || "--"} />
			<DetailRow label="Số điện thoại" value={customer.phone || "--"} />
			<DetailRow label="Địa chỉ" value={customer.address || "--"} />
			<DetailRow label="Giới tính" value={customer.gender || "--"} />
			<DetailRow label="Vai trò" value={customer.role} />
			<DetailRow label="Trạng thái" value={customer.isActive ? "ACTIVE" : "INACTIVE"} />
			<DetailRow label="Avatar" value={customer.avatar || "--"} />
			<DetailRow label="Ngày tạo" value={toShortDate(customer.createdAt)} />
		  </div>
		) : null}
	  </CardContent>
	</Card>
  );
};

export default StaffCustomerDetailPage;


