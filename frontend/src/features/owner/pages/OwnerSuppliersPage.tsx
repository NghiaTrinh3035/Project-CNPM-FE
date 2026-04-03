import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { OwnerSupplierFormDialog } from "@/features/owner/components/OwnerSupplierFormDialog";
import type { SupplierFormValues } from "@/features/owner/schemas/supplierSchema";
import { adminService } from "@/services/adminService";
import type { Supplier } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

export const OwnerSuppliersPage = () => {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const queryClient = useQueryClient();

  const suppliersQuery = useQuery({
    queryKey: ["owner-suppliers", keyword, page, pageSize],
    queryFn: () =>
      adminService.listSuppliers({
        keyword,
        page,
        pageSize,
      }),
  });

  const createMutation = useMutation({
    mutationFn: adminService.createSupplier,
    onSuccess: () => {
      toast.success("Đã thêm nhà cung cấp mới.");
      queryClient.invalidateQueries({ queryKey: ["owner-suppliers"] });
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ supplierId, payload }: { supplierId: string; payload: SupplierFormValues }) =>
      adminService.updateSupplier(supplierId, payload),
    onSuccess: () => {
      toast.success("Cập nhật nhà cung cấp thành công.");
      queryClient.invalidateQueries({ queryKey: ["owner-suppliers"] });
      setEditTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.removeSupplier,
    onSuccess: () => {
      toast.success("Đã xóa nhà cung cấp.");
      queryClient.invalidateQueries({ queryKey: ["owner-suppliers"] });
      setDeleteTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const rows = suppliersQuery.data?.items ?? [];
  const totalPages = suppliersQuery.data?.totalPages ?? 0;
  const totalItems = suppliersQuery.data?.total ?? 0;

  return (
    <>
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Quản lý nhà cung cấp</CardTitle>
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
            placeholder="Tìm theo tên, địa chỉ hoặc thông tin hợp đồng..."
          />
        </CardHeader>
        <CardContent>
          {suppliersQuery.isError ? (
            <p className="mb-3 text-sm text-red-500">{(suppliersQuery.error as Error).message}</p>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã nhà cung cấp</TableHead>
                <TableHead>Tên nhà cung cấp</TableHead>
                <TableHead>Thông tin hợp đồng</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.id}</TableCell>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.contractInfo || "--"}</TableCell>
                  <TableCell>{supplier.address || "--"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditTarget(supplier)}>
                        <Pencil className="mr-1 h-4 w-4" />
                        Sửa
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(supplier)}>
                        <Trash2 className="mr-1 h-4 w-4" />
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {!suppliersQuery.isLoading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    Chưa có nhà cung cấp phù hợp.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Trang {page} / {Math.max(totalPages, 1)} - Tổng {totalItems} nhà cung cấp
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
                disabled={page <= 1 || suppliersQuery.isFetching}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                disabled={page >= Math.max(totalPages, 1) || suppliersQuery.isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <OwnerSupplierFormDialog
        open={isCreateOpen}
        mode="create"
        submitting={createMutation.isPending}
        onOpenChange={setIsCreateOpen}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
      />

      <OwnerSupplierFormDialog
        open={Boolean(editTarget)}
        mode="update"
        initialSupplier={editTarget}
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
          await updateMutation.mutateAsync({ supplierId: editTarget.id, payload: values });
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
            <DialogTitle>Xác nhận xóa nhà cung cấp</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa nhà cung cấp {deleteTarget?.name ?? "này"} không?
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
