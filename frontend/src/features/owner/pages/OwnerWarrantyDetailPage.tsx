import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { adminService } from "@/services/adminService";
import { WARRANTY_STATUS_LABEL } from "@/shared/constants/labels";
import { ROUTES } from "@/shared/constants/routes";
import { toShortDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-3 gap-3 border-b border-border/60 py-3 text-sm last:border-0">
    <p className="font-semibold">{label}</p>
    <p className="col-span-2 text-muted-foreground">{value}</p>
  </div>
);

export const OwnerWarrantyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["owner-warranty-detail", id],
    queryFn: () => (id ? adminService.getWarrantyById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  const warranty = query.data;

  return (
    <Card>
      <CardHeader className="space-y-3">
        <Button variant="ghost" className="w-fit" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <CardTitle>Chi tiết bảo hành (Owner)</CardTitle>
      </CardHeader>
      <CardContent>
        {!query.isLoading && !warranty ? (
          <p className="text-sm text-muted-foreground">Không tìm thấy phiếu bảo hành. <button className="underline" onClick={() => navigate(ROUTES.owner.warranties)}>Về danh sách</button></p>
        ) : null}

        {warranty ? (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-lg font-semibold">Phiếu #{warranty.id}</h3>
              <Badge variant={warranty.status === "REJECTED" ? "danger" : "outline"}>{WARRANTY_STATUS_LABEL[warranty.status]}</Badge>
            </div>
            <DetailRow label="Mã bảo hành" value={warranty.id} />
            <DetailRow label="Tên khách hàng" value={warranty.customerName || "--"} />
            <DetailRow label="Số điện thoại khách hàng" value={warranty.customerPhone || "--"} />
            <DetailRow label="Sản phẩm" value={warranty.productName || warranty.productId || "--"} />
            <DetailRow label="Số lượng" value={String(warranty.quantity)} />
            <DetailRow label="Ngày nhận" value={toShortDate(warranty.receivedDate)} />
            <DetailRow label="Ngày dự kiến trả" value={toShortDate(warranty.expectedReturnDate)} />
            <DetailRow label="Mô tả vấn đề" value={warranty.issueDescription || "--"} />
            <DetailRow label="Ghi chú kỹ thuật" value={warranty.technicianNote || "--"} />
            <DetailRow label="Lý do từ chối" value={warranty.rejectReason || "--"} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default OwnerWarrantyDetailPage;


