import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { WarrantyCreateDialog } from "@/features/warranty/components/WarrantyCreateDialog";
import { WarrantyStatusDialog } from "@/features/warranty/components/WarrantyStatusDialog";
import type { WarrantyCreateFormValues, WarrantyProcessFormValues } from "@/features/warranty/schemas/warrantyAdminSchema";
import type { WarrantyAdminItem } from "@/features/warranty/types/warrantyAdmin";
import { adminService } from "@/services/adminService";
import { WARRANTY_STATUS_LABEL } from "@/shared/constants/labels";
import { ROUTES } from "@/shared/constants/routes";
import type { WarrantyStatus } from "@/shared/types/domain";
import { toShortDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

const isFinalStatus = (status: WarrantyStatus) => status === "COMPLETED" || status === "REJECTED";

const toStatusVariant = (status: WarrantyStatus) => {
  if (status === "COMPLETED") return "success" as const;
  if (status === "REJECTED") return "danger" as const;
  if (status === "PROCESSING") return "warning" as const;
  return "outline" as const;
};

export const OwnerWarrantiesPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<WarrantyStatus | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<WarrantyAdminItem | null>(null);

  const query = useQuery({
    queryKey: ["owner-warranties", keyword, status, page, pageSize],
    queryFn: () => adminService.listWarranties({ keyword, status, page, pageSize }),
  });

  const createMutation = useMutation({
    mutationFn: (values: WarrantyCreateFormValues) =>
      adminService.createWarranty({
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        issueDescription: values.issueDescription,
        receivedDate: new Date(values.receivedDate).toISOString(),
        expectedReturnDate: new Date(values.expectedReturnDate).toISOString(),
        technicianNote: values.technicianNote,
        quantity: values.quantity,
        productId: values.productId,
      }),
    onSuccess: () => {
      toast.success("Đã tạo phiếu bảo hành.");
      queryClient.invalidateQueries({ queryKey: ["owner-warranties"] });
      queryClient.invalidateQueries({ queryKey: ["staff-warranties"] });
      setCreateOpen(false);
      setPage(1);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: WarrantyProcessFormValues }) =>
      adminService.updateWarrantyStatus(id, {
        status: values.status,
        rejectReason: values.rejectReason,
        technicianNote: values.technicianNote,
      }),
    onSuccess: (updatedWarranty) => {
      queryClient.setQueryData(["owner-warranty-detail", updatedWarranty.id], updatedWarranty);
      queryClient.setQueryData(["staff-warranty-detail", updatedWarranty.id], updatedWarranty);
      toast.success("Đã cập nhật bảo hành.");
      queryClient.invalidateQueries({ queryKey: ["owner-warranties"] });
      queryClient.invalidateQueries({ queryKey: ["staff-warranties"] });
      setStatusTarget(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = query.data?.items ?? [];
  const totalPages = query.data?.totalPages ?? 0;
  const totalItems = query.data?.total ?? 0;

  return (
    <>
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Quản lý bảo hành (Owner)</CardTitle>
            <Button variant="luxury" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Thêm mới
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <Input
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên khách, số điện thoại, mô tả lỗi..."
            />
            <Select
              value={status ?? ""}
              onChange={(event) => {
                setStatus(event.target.value ? (event.target.value as WarrantyStatus) : null);
                setPage(1);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="RECEIVED">{WARRANTY_STATUS_LABEL.RECEIVED}</option>
              <option value="PROCESSING">{WARRANTY_STATUS_LABEL.PROCESSING}</option>
              <option value="COMPLETED">{WARRANTY_STATUS_LABEL.COMPLETED}</option>
              <option value="REJECTED">{WARRANTY_STATUS_LABEL.REJECTED}</option>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Tên khách hàng</TableHead>
                <TableHead>Ngày dự kiến trả</TableHead>
                <TableHead>Mô tả vấn đề</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.customerName}</TableCell>
                  <TableCell>{toShortDate(item.expectedReturnDate)}</TableCell>
                  <TableCell className="max-w-xs truncate" title={item.issueDescription}>
                    {item.issueDescription}
                  </TableCell>
                  <TableCell>{item.productName ?? item.productId}</TableCell>
                  <TableCell>
                    <Badge variant={toStatusVariant(item.status)}>{WARRANTY_STATUS_LABEL[item.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.owner.warrantyDetail.replace(":id", item.id))}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Xem
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isFinalStatus(item.status)}
                        onClick={() => setStatusTarget(item)}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Cập nhật
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {!query.isLoading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                    Không có phiếu bảo hành phù hợp.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Trang {page} / {Math.max(totalPages, 1)} - Tổng {totalItems} phiếu bảo hành
            </div>
            <div className="flex items-center gap-2">
              <Select
                className="w-24"
                value={String(pageSize)}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                <option value="10">10 / trang</option>
                <option value="20">20 / trang</option>
                <option value="50">50 / trang</option>
              </Select>
              <Button variant="outline" disabled={page <= 1 || query.isFetching} onClick={() => setPage((prev) => prev - 1)}>
                Trước
              </Button>
              <Button
                variant="outline"
                disabled={page >= Math.max(totalPages, 1) || query.isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <WarrantyCreateDialog
        open={createOpen}
        submitting={createMutation.isPending}
        onOpenChange={setCreateOpen}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
      />

      <WarrantyStatusDialog
        open={Boolean(statusTarget)}
        warranty={statusTarget}
        submitting={updateMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setStatusTarget(null);
          }
        }}
        onSubmit={async (values) => {
          if (!statusTarget) {
            return;
          }
          await updateMutation.mutateAsync({ id: statusTarget.id, values });
        }}
      />
    </>
  );
};

export default OwnerWarrantiesPage;


