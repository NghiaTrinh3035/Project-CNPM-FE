import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { adminService } from "@/services/adminService";
import { ROUTES } from "@/shared/constants/routes";
import { toShortDate } from "@/shared/lib/format";
import type { User } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-3 gap-3 border-b border-border/60 py-3 text-sm last:border-0">
    <p className="font-semibold">{label}</p>
    <p className="col-span-2 text-muted-foreground">{value}</p>
  </div>
);

export const OwnerStaffDetailPage = () => {
  const staffApi = adminService as typeof adminService & {
    getStaffById: (staffId: string) => Promise<User | null>;
  };
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const staffQuery = useQuery({
    queryKey: ["owner-staff-detail", id],
    queryFn: () => (id ? staffApi.getStaffById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  const staff = staffQuery.data;

  return (
    <Card>
      <CardHeader className="space-y-3">
        <Button variant="ghost" className="w-fit" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <CardTitle>Chi tiết nhân viên</CardTitle>
      </CardHeader>
      <CardContent>
        {!staffQuery.isLoading && !staff ? (
          <p className="text-sm text-muted-foreground">
            Không tìm thấy nhân viên. {" "}
            <button className="underline" onClick={() => navigate(ROUTES.owner.staff)}>
              Về danh sách
            </button>
          </p>
        ) : null}

        {staff ? (
          <div>
            <DetailRow label="Mã nhân viên" value={staff.id} />
            <DetailRow label="Tài khoản" value={staff.username || "--"} />
            <DetailRow label="Họ và tên" value={staff.fullName || "--"} />
            <DetailRow label="Email" value={staff.email || "--"} />
            <DetailRow label="Số điện thoại" value={staff.phone || "--"} />
            <DetailRow label="Địa chỉ" value={staff.address || "--"} />
            <DetailRow label="Giới tính" value={staff.gender || "--"} />
            <DetailRow label="Vai trò" value={staff.role} />
            <DetailRow label="Trạng thái" value={staff.isActive ? "Đang hoạt động" : "Đã khóa"} />
            <DetailRow label="Ngày tạo" value={toShortDate(staff.createdAt)} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default OwnerStaffDetailPage;


