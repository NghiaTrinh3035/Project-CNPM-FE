import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { OwnerVoucherFormDialog } from "@/features/owner/components/OwnerVoucherFormDialog";
import { VOUCHER_STATUS_LABELS, type VoucherFormValues } from "@/features/owner/schemas/voucherSchema";
import { adminService } from "@/services/adminService";
import type { Voucher } from "@/shared/types/domain";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

const toDateTimeLabel = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const toStatusVariant = (status: Voucher["status"]) => {
  if (status === "ACTIVE") return "success" as const;
  if (status === "USED_UP") return "warning" as const;
  return "danger" as const;
};

export const OwnerVouchersPage = () => {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Voucher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null);
  const queryClient = useQueryClient();

  const vouchersQuery = useQuery({
    queryKey: ["owner-vouchers", keyword, page, pageSize],
    queryFn: () =>
      adminService.listVouchers({
        keyword,
        page,
        pageSize,
      }),
  });

  const createMutation = useMutation({
    mutationFn: adminService.createVoucher,
    onSuccess: () => {
      toast.success("Đã thêm voucher mới.");
      queryClient.invalidateQueries({ queryKey: ["owner-vouchers"] });
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ voucherId, payload }: { voucherId: string; payload: VoucherFormValues }) =>
      adminService.updateVoucher(voucherId, payload),
    onSuccess: () => {
      toast.success("Cập nhật voucher thành công.");
      queryClient.invalidateQueries({ queryKey: ["owner-vouchers"] });
      setEditTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.removeVoucher,
    onSuccess: () => {
      toast.success("Đã xóa voucher.");
      queryClient.invalidateQueries({ queryKey: ["owner-vouchers"] });
      setDeleteTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const rows = vouchersQuery.data?.items ?? [];
  const totalPages = vouchersQuery.data?.totalPages ?? 0;
  const totalItems = vouchersQuery.data?.total ?? 0;

  return (
    <>
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Quản lý voucher</CardTitle>
            <Button variant="luxury" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Thêm mới
            </Button>
          </div>
          <Input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo mã voucher..."
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Mã code</TableHead>
                <TableHead>Giảm (%)</TableHead>
                <TableHead>Số lần sử dụng</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tạo lúc</TableHead>
                <TableHead>Valid from</TableHead>
                <TableHead>Valid to</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium">{voucher.id}</TableCell>
                  <TableCell>{voucher.code}</TableCell>
                  <TableCell>{voucher.discountPercent}%</TableCell>
                  <TableCell>{voucher.usedCount}</TableCell>
                  <TableCell>{voucher.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={toStatusVariant(voucher.status)}>
                      {VOUCHER_STATUS_LABELS[voucher.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{toDateTimeLabel(voucher.createdAt)}</TableCell>
                  <TableCell>{toDateTimeLabel(voucher.validFrom)}</TableCell>
                  <TableCell>{toDateTimeLabel(voucher.validTo)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditTarget(voucher)}>
                        <Pencil className="mr-1 h-4 w-4" />
                        Sửa
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(voucher)}>
                        <Trash2 className="mr-1 h-4 w-4" />
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {!vouchersQuery.isLoading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-6 text-center text-muted-foreground">
                    Chưa có voucher phù hợp.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Trang {page} / {Math.max(totalPages, 1)} - Tổng {totalItems} voucher
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
              <Button
                variant="outline"
                disabled={page <= 1 || vouchersQuery.isFetching}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                disabled={page >= Math.max(totalPages, 1) || vouchersQuery.isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Sau
              </Button>
            </div>
          </div>

          {vouchersQuery.isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Đang tải danh sách voucher...</p>
          ) : null}
        </CardContent>
      </Card>

      <OwnerVoucherFormDialog
        open={isCreateOpen}
        mode="create"
        submitting={createMutation.isPending}
        onOpenChange={setIsCreateOpen}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
      />

      <OwnerVoucherFormDialog
        open={Boolean(editTarget)}
        mode="update"
        initialVoucher={editTarget}
        submitting={updateMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setEditTarget(null);
          }
        }}
        onSubmit={async (values) => {
          if (!editTarget) {
            return;
          }
          await updateMutation.mutateAsync({ voucherId: editTarget.id, payload: values });
        }}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa voucher</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa voucher {deleteTarget?.code ?? "này"} không?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              disabled={!deleteTarget || deleteMutation.isPending}
              onClick={() => {
                if (!deleteTarget) {
                  return;
                }
                deleteMutation.mutate(deleteTarget.id);
              }}
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
