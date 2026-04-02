import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { ProductImageManager } from "@/features/product/components/ProductImageManager";
import { adminService } from "@/services/adminService";
import { PRODUCT_STATUS_LABEL } from "@/shared/constants/labels";
import { ROUTES } from "@/shared/constants/routes";
import { toCurrency } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-3 gap-3 border-b border-border/60 py-3 text-sm last:border-0">
	<p className="font-semibold">{label}</p>
	<p className="col-span-2 text-muted-foreground">{value}</p>
  </div>
);

export const StaffProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const query = useQuery({
	queryKey: ["staff-product-detail", id],
	queryFn: () => (id ? adminService.getProductById(id) : Promise.resolve(null)),
	enabled: Boolean(id),
  });

  const product = query.data;

  return (
	<Card>
	  <CardHeader className="space-y-3">
		<Button variant="ghost" className="w-fit" onClick={() => navigate(-1)}>
		  <ArrowLeft className="mr-2 h-4 w-4" />
		  Quay lại
		</Button>
		<CardTitle>Chi tiết sản phẩm (Staff)</CardTitle>
	  </CardHeader>
	  <CardContent>
		{!query.isLoading && !product ? (
		  <p className="text-sm text-muted-foreground">Không tìm thấy sản phẩm. <button className="underline" onClick={() => navigate(ROUTES.staff.products)}>Về danh sách</button></p>
		) : null}

		{product ? (
		  <div className="space-y-5">
			<div className="flex items-center gap-2">
			  <h3 className="text-lg font-semibold">{product.name}</h3>
			  <Badge variant="outline">{PRODUCT_STATUS_LABEL[product.status]}</Badge>
			</div>

			<div>
			  <DetailRow label="Mã sản phẩm" value={product.id} />
			  <DetailRow label="SKU" value={product.sku ?? "--"} />
			  <DetailRow label="Thương hiệu" value={product.brand ?? "--"} />
			  <DetailRow label="Danh mục" value={product.category?.name ?? "--"} />
			  <DetailRow label="Giá bán" value={toCurrency(product.price)} />
			  <DetailRow label="Giá khuyến mãi" value={product.salePrice ? toCurrency(product.salePrice) : "--"} />
			  <DetailRow label="Tồn kho" value={String(product.stockQuantity)} />
			  <DetailRow label="Bộ máy" value={product.movementType ?? "--"} />
			  <DetailRow label="Mặt kính" value={product.glassMaterial ?? "--"} />
			  <DetailRow label="Chống nước" value={product.waterResistance ?? "--"} />
			  <DetailRow label="Mô tả" value={product.description ?? "--"} />
			</div>

			<ProductImageManager productId={product.id} />
		  </div>
		) : null}
	  </CardContent>
	</Card>
  );
};

export default StaffProductDetailPage;


