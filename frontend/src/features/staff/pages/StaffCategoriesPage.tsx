import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CategoryFormDialog } from "@/features/categories/components/CategoryFormDialog";
import type { CategoryFormValues } from "@/features/categories/schemas/categorySchema";
import { categoryAdminService } from "@/services/categoryAdminService";
import type { Category } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

export const StaffCategoriesPage = () => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["staff-categories", keyword, page, pageSize],
    queryFn: () =>
      categoryAdminService.list({
        keyword,
        page,
        pageSize,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      categoryAdminService.create({
        name: values.name,
        description: values.description,
      }),
    onSuccess: () => {
      toast.success("Đã thêm danh mục mới.");
      queryClient.invalidateQueries({ queryKey: ["staff-categories"] });
      queryClient.invalidateQueries({ queryKey: ["owner-categories"] });
      setIsCreateOpen(false);
      setPage(1);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ categoryId, payload }: { categoryId: string; payload: CategoryFormValues }) =>
      categoryAdminService.update(categoryId, {
        name: payload.name,
        description: payload.description,
      }),
    onSuccess: () => {
      toast.success("Cập nhật danh mục thành công.");
      queryClient.invalidateQueries({ queryKey: ["staff-categories"] });
      queryClient.invalidateQueries({ queryKey: ["owner-categories"] });
      setEditTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoryAdminService.remove,
    onSuccess: () => {
      toast.success("Đã xóa danh mục.");
      queryClient.invalidateQueries({ queryKey: ["staff-categories"] });
      queryClient.invalidateQueries({ queryKey: ["owner-categories"] });
      setDeleteTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const rows = categoriesQuery.data?.items ?? [];
  const totalPages = categoriesQuery.data?.totalPages ?? 0;
  const totalItems = categoriesQuery.data?.total ?? 0;

  return (
    <>
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Quản lý danh mục</CardTitle>
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
            placeholder="Tìm theo tên hoặc mô tả danh mục..."
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.id}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description || "--"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditTarget(category)}>
                        <Pencil className="mr-1 h-4 w-4" />
                        Sửa
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(category)}>
                        <Trash2 className="mr-1 h-4 w-4" />
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {!categoriesQuery.isLoading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    Chưa có danh mục phù hợp.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Trang {page} / {Math.max(totalPages, 1)} - Tổng {totalItems} danh mục
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
                disabled={page <= 1 || categoriesQuery.isFetching}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                disabled={page >= Math.max(totalPages, 1) || categoriesQuery.isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={isCreateOpen}
        mode="create"
        submitting={createMutation.isPending}
        onOpenChange={setIsCreateOpen}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
      />

      <CategoryFormDialog
        open={Boolean(editTarget)}
        mode="update"
        initialCategory={editTarget}
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
          await updateMutation.mutateAsync({ categoryId: editTarget.id, payload: values });
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
            <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa danh mục {deleteTarget?.name ?? "này"} không?
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

export default StaffCategoriesPage;


