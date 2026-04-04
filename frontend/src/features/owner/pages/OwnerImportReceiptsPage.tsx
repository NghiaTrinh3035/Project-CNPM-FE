import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { OwnerImportReceiptFormDialog } from "@/features/owner/components/OwnerImportReceiptFormDialog";
import type { ImportReceiptFormValues } from "@/features/owner/schemas/importReceiptSchema";
import { adminService, type ImportReceiptRecord } from "@/services/adminService";
import { ROUTES } from "@/shared/constants/routes";
import { toCurrency, toShortDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

const sumQuantity = (receipt: ImportReceiptRecord) =>
  receipt.items.reduce((sum, item) => sum + item.quantity, 0);

export const OwnerImportReceiptsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [keyword, setKeyword] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<ImportReceiptRecord | null>(null);

  const suppliersQuery = useQuery({
    queryKey: ["owner-suppliers-for-import-receipt"],
    queryFn: () =>
      adminService.listSuppliers({
        page: 1,
        pageSize: 200,
      }),
  });

  const productsQuery = useQuery({
    queryKey: ["owner-products-for-import-receipt"],
    queryFn: adminService.listProducts,
  });

  const receiptsQuery = useQuery({
    queryKey: ["owner-import-receipts", keyword, supplierId, fromDate, toDate],
    queryFn: () =>
      adminService.listImportReceipts({
        keyword,
        supplierId,
        fromDate,
        toDate,
      }),
  });

  const createMutation = useMutation({
    mutationFn: adminService.createImportReceipt,
    onSuccess: () => {
      toast.success("Đã tạo phiếu nhập thành công.");
      queryClient.invalidateQueries({ queryKey: ["owner-import-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["owner-products-for-import-receipt"] });
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const rows = receiptsQuery.data ?? [];
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [page, pageSize, rows]);

  const supplierOptions = suppliersQuery.data?.items ?? [];
  const productOptions = productsQuery.data ?? [];
  const productById = useMemo(
    () => new Map(productOptions.map((product) => [product.id, product])),
    [productOptions],
  );

  return (
    <>
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Quản lý phiếu nhập</CardTitle>
            <Button variant="luxury" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Tạo phiếu nhập
            </Button>
          </div>

          <div className="grid gap-2 md:grid-cols-4">
            <Input
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo mã phiếu, nhà cung cấp, ghi chú..."
            />

            <Select
              value={supplierId}
              onChange={(event) => {
                setSupplierId(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả nhà cung cấp</option>
              {supplierOptions.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </Select>

            <Input
              type="date"
              value={fromDate}
              onChange={(event) => {
                setFromDate(event.target.value);
                setPage(1);
              }}
            />

            <Input
              type="date"
              value={toDate}
              onChange={(event) => {
                setToDate(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </CardHeader>

        <CardContent>
          {receiptsQuery.isError ? (
            <p className="mb-3 text-sm text-red-500">{(receiptsQuery.error as Error).message}</p>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Ngày nhập</TableHead>
                <TableHead>Nhà cung cấp</TableHead>
                <TableHead>Số mặt hàng</TableHead>
                <TableHead>Tổng SL</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRows.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.id}</TableCell>
                  <TableCell>{toShortDate(receipt.importDate)}</TableCell>
                  <TableCell>{receipt.supplierName}</TableCell>
                  <TableCell>{receipt.items.length}</TableCell>
                  <TableCell>{sumQuantity(receipt)}</TableCell>
                  <TableCell>{toCurrency(receipt.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant="success">Đã nhập kho</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setDetailTarget(receipt)}>
                      <Eye className="mr-1 h-4 w-4" />
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {!receiptsQuery.isLoading && pagedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                    Chưa có phiếu nhập phù hợp.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Trang {page} / {totalPages} - Tổng {totalItems} phiếu nhập
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
                disabled={page <= 1 || receiptsQuery.isFetching}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages || receiptsQuery.isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <OwnerImportReceiptFormDialog
        open={isCreateOpen}
        suppliers={supplierOptions}
        products={productOptions}
        submitting={createMutation.isPending}
        onOpenChange={setIsCreateOpen}
        onSubmit={async (values: ImportReceiptFormValues) => {
          await createMutation.mutateAsync({
            supplierId: values.supplierId,
            note: values.note,
            items: values.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              importPrice: item.importPrice,
            })),
          });
        }}
      />

      <Dialog
        open={Boolean(detailTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailTarget(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết phiếu nhập</DialogTitle>
            <DialogDescription>
              Mã phiếu: {detailTarget?.id ?? "--"} - Ngày nhập:{" "}
              {detailTarget ? toShortDate(detailTarget.importDate) : "--"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Nhà cung cấp</p>
                <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-sm">
                  {detailTarget?.supplierName ?? "--"}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Tổng tiền</p>
                <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-sm font-semibold">
                  {detailTarget ? toCurrency(detailTarget.totalAmount) : "--"}
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className="text-sm font-medium">Ghi chú</p>
                <div className="min-h-20 rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-sm">
                  {detailTarget?.note || "--"}
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-border/70 p-3">
              <p className="text-sm font-semibold">Danh sách sản phẩm nhập</p>

              <div className="space-y-2">
                {detailTarget?.items.map((item, index) => {
                  const product = productById.get(item.productId);
                  return (
                    <div
                      key={item.id}
                      className="grid gap-2 rounded-md border border-border/60 p-3 md:grid-cols-12"
                    >
                      <div className="space-y-1 md:col-span-5">
                        <p className="text-xs font-medium text-muted-foreground">Sản phẩm</p>
                        <p className="text-sm font-medium">
                          {index + 1}. {item.productName}
                        </p>
                        <div className="rounded-md border border-dashed border-border/70 bg-muted/30 px-2 py-1.5 text-xs text-muted-foreground">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p>
                              SKU: {product?.sku ?? "--"} | Danh mục:{" "}
                              {product?.category?.name ?? "--"}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() =>
                                navigate(ROUTES.owner.productDetail.replace(":id", item.productId))
                              }
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Chi tiết SP
                            </Button>
                          </div>
                          <p>
                            Tồn kho hiện tại: {product?.stockQuantity ?? "--"} | Giá bán:{" "}
                            {product ? toCurrency(product.price) : "--"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground">Số lượng</p>
                        <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-sm">
                          {item.quantity}
                        </div>
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground">Giá nhập</p>
                        <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-sm">
                          {toCurrency(item.importPrice)}
                        </div>
                      </div>

                      <div className="space-y-1 md:col-span-3">
                        <p className="text-xs font-medium text-muted-foreground">Thành tiền</p>
                        <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-sm font-semibold">
                          {toCurrency(item.lineTotal)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-2 rounded-md border border-border/60 bg-muted/20 p-3 text-sm md:grid-cols-3">
                <p>
                  <span className="font-medium">Số mặt hàng:</span>{" "}
                  {detailTarget?.items.length ?? 0}
                </p>
                <p>
                  <span className="font-medium">Tổng số lượng:</span>{" "}
                  {detailTarget ? sumQuantity(detailTarget) : 0}
                </p>
                <p>
                  <span className="font-medium">Tổng tiền:</span>{" "}
                  {detailTarget ? toCurrency(detailTarget.totalAmount) : "--"}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
