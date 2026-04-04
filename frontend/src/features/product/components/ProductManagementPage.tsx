import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { productAdminService } from "@/services/productAdminService";
import { PRODUCT_STATUS_LABEL } from "@/shared/constants/labels";
import { ROUTES } from "@/shared/constants/routes";
import { toCurrency } from "@/shared/lib/format";
import type { ProductStatus } from "@/shared/types/domain";
import { ConfirmDialog } from "@/shared/components/common/ConfirmDialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

type ProductManagementPageProps = {
  role: "OWNER" | "STAFF";
};

export const ProductManagementPage = ({ role }: ProductManagementPageProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const routeConfig = useMemo(() => {
    if (role === "OWNER") {
      return {
        create: ROUTES.owner.productCreate,
        detail: ROUTES.owner.productDetail,
        edit: ROUTES.owner.productEdit,
        queryKey: "owner-products",
      };
    }
    return {
      create: ROUTES.staff.productCreate,
      detail: ROUTES.staff.productDetail,
      edit: ROUTES.staff.productEdit,
      queryKey: "staff-products",
    };
  }, [role]);

  const productsQuery = useQuery({
    queryKey: [routeConfig.queryKey, keyword, statusFilter, page, pageSize],
    queryFn: () =>
      productAdminService.list({
        keyword,
        status: statusFilter === "ALL" ? null : statusFilter,
        page,
        pageSize,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => productAdminService.remove(productId),
    onSuccess: () => {
      toast.success("Xóa sản phẩm thành công.");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: [routeConfig.queryKey] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const totalPages = Math.max(productsQuery.data?.totalPages ?? 1, 1);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Quản lý sản phẩm ({role === "OWNER" ? "Owner" : "Staff"})</CardTitle>
          <Button onClick={() => navigate(routeConfig.create)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-[1fr_220px_auto]">
          <Input
            placeholder="Tìm theo tên hoặc thương hiệu..."
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
          />
          <Select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value as ProductStatus | "ALL");
            }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang bán</option>
            <option value="OUT_OF_STOCK">Hết hàng</option>
            <option value="DISCONTINUED">Ngừng kinh doanh</option>
          </Select>
          <div />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã sản phẩm</TableHead>
              <TableHead>Tên đồng hồ</TableHead>
              <TableHead>Thương hiệu</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Số lượng tồn kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(productsQuery.data?.items ?? []).map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.brand ?? "--"}</TableCell>
                <TableCell>{toCurrency(product.price)}</TableCell>
                <TableCell>{product.stockQuantity}</TableCell>
                <TableCell>
                  <Badge variant="outline">{PRODUCT_STATUS_LABEL[product.status]}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(routeConfig.detail.replace(":id", product.id))}
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(routeConfig.edit.replace(":id", product.id))}
                      title="Cập nhật"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="danger"
                      onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {productsQuery.data && productsQuery.data.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có sản phẩm phù hợp.</p>
        ) : null}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {productsQuery.data?.page ?? page}/{totalPages} - Tổng {productsQuery.data?.total ?? 0} sản phẩm
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={(productsQuery.data?.page ?? page) <= 1 || productsQuery.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              disabled={(productsQuery.data?.page ?? page) >= totalPages || productsQuery.isFetching}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Sau
            </Button>
          </div>
        </div>
      </CardContent>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Xác nhận xóa sản phẩm"
        description={`Bạn có chắc chắn muốn xóa sản phẩm "${deleteTarget?.name ?? ""}" không?`}
        confirmText="Xóa sản phẩm"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
      />
    </Card>
  );
};


