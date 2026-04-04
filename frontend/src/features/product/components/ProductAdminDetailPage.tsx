import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { productAdminService } from "@/services/productAdminService";
import { PRODUCT_STATUS_LABEL } from "@/shared/constants/labels";
import { ROUTES } from "@/shared/constants/routes";
import { toCurrency } from "@/shared/lib/format";
import { ConfirmDialog } from "@/shared/components/common/ConfirmDialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type ProductAdminDetailPageProps = {
  role: "OWNER" | "STAFF";
  productId?: string;
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-3 gap-3 border-b border-border/60 py-3 text-sm last:border-0">
    <p className="font-semibold">{label}</p>
    <p className="col-span-2 text-muted-foreground">{value}</p>
  </div>
);

export const ProductAdminDetailPage = ({ role, productId }: ProductAdminDetailPageProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const routeConfig = useMemo(() => {
    if (role === "OWNER") {
      return {
        list: ROUTES.owner.products,
        edit: ROUTES.owner.productEdit,
        queryKey: "owner-products",
      };
    }
    return {
      list: ROUTES.staff.products,
      edit: ROUTES.staff.productEdit,
      queryKey: "staff-products",
    };
  }, [role]);

  const query = useQuery({
    queryKey: [routeConfig.queryKey, "detail", productId],
    queryFn: () => (productId ? productAdminService.getById(productId) : Promise.resolve(null)),
    enabled: Boolean(productId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productAdminService.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa sản phẩm thành công.");
      queryClient.invalidateQueries({ queryKey: [routeConfig.queryKey] });
      navigate(routeConfig.list);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const product = query.data;
  const categoryText = (product?.categories ?? (product?.category ? [product.category] : []))
    .map((category) => category.name)
    .join(", ");

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="w-fit" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          {product ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(routeConfig.edit.replace(":id", product.id))}>
                <Pencil className="mr-2 h-4 w-4" />
                Cập nhật
              </Button>
              <Button variant="danger" onClick={() => setOpenDeleteConfirm(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            </div>
          ) : null}
        </div>
        <CardTitle>Chi tiết sản phẩm ({role === "OWNER" ? "Owner" : "Staff"})</CardTitle>
      </CardHeader>

      <CardContent>
        {!query.isLoading && !product ? (
          <p className="text-sm text-muted-foreground">
            Không tìm thấy sản phẩm. <button className="underline" onClick={() => navigate(routeConfig.list)}>Về danh sách</button>
          </p>
        ) : null}

        {product ? (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <Badge variant="outline">{PRODUCT_STATUS_LABEL[product.status]}</Badge>
            </div>

            <div>
              <DetailRow label="Mã sản phẩm" value={product.id} />
              <DetailRow label="Tên đồng hồ" value={product.name} />
              <DetailRow label="Thương hiệu" value={product.brand ?? "--"} />
              <DetailRow label="Danh mục" value={categoryText || "--"} />
              <DetailRow label="Giá bán" value={toCurrency(product.price)} />
              <DetailRow label="Số lượng tồn kho" value={String(product.stockQuantity)} />
              <DetailRow label="Trạng thái" value={PRODUCT_STATUS_LABEL[product.status]} />
              <DetailRow label="Bộ máy" value={product.movementType ?? "--"} />
              <DetailRow label="Mặt kính" value={product.glassMaterial ?? "--"} />
              <DetailRow label="Chống nước" value={product.waterResistance ?? "--"} />
              <DetailRow label="Kích thước mặt" value={product.faceSize ?? "--"} />
              <DetailRow label="Chất liệu dây" value={product.wireMaterial ?? product.strapMaterial ?? "--"} />
              <DetailRow label="Màu dây" value={product.wireColor ?? product.strapColor ?? "--"} />
              <DetailRow label="Màu vỏ" value={product.caseColor ?? "--"} />
              <DetailRow label="Màu mặt" value={product.faceColor ?? "--"} />
              <DetailRow label="Mô tả" value={product.description ?? "--"} />
              <DetailRow label="Cập nhật lần cuối" value={product.updatedAt ?? "--"} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(product.images ?? []).map((image) => (
                <img key={image.id} src={image.url} alt={image.alt || product.name} className="h-32 w-full rounded-lg object-cover" />
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>

      <ConfirmDialog
        open={openDeleteConfirm}
        onOpenChange={setOpenDeleteConfirm}
        title="Xác nhận xóa sản phẩm"
        description={`Bạn có chắc chắn muốn xóa sản phẩm "${product?.name ?? ""}" không?`}
        confirmText="Xóa sản phẩm"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (product?.id) {
            deleteMutation.mutate(product.id);
          }
        }}
      />
    </Card>
  );
};



