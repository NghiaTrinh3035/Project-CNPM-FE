import { useQuery } from "@tanstack/react-query";
import { ArrowRightLeft, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { productService } from "@/services/productService";
import { EmptyState } from "@/shared/components/states/EmptyState";
import { ROUTES } from "@/shared/constants/routes";
import { useCompareStore } from "@/shared/hooks/useCompareStore";
import { toCurrency } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

const rows = [
  { key: "brand", label: "Thương hiệu" },
  { key: "movementType", label: "Loại máy" },
  { key: "faceSize", label: "Kích thước mặt" },
  { key: "thickness", label: "Độ dày" },
  { key: "glassMaterial", label: "Mặt kính" },
  { key: "waterResistance", label: "Chống nước" },
  { key: "strapMaterial", label: "Dây đeo" },
  { key: "rating", label: "Đánh giá" },
] as const;

export const ComparePage = () => {
  const { productIds, add, remove, clear } = useCompareStore();
  const allProductsQuery = useQuery({
    queryKey: ["compare-all-products"],
    queryFn: () => productService.getAll({ page: 1, pageSize: 200 }),
  });

  const selectedQuery = useQuery({
    queryKey: ["compare-selected", productIds.join(",")],
    queryFn: () => productService.getByIds(productIds),
    enabled: productIds.length > 0,
  });

  const selectedProducts = selectedQuery.data ?? [];

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-luxury-gold">Compare Watches</p>
          <h1 className="mt-1 font-display text-3xl">So sánh đồng hồ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Đặt 2 mẫu cạnh nhau để xem khác biệt về thông số, giá và mục đích sử dụng.
          </p>
        </div>
        <Button variant="outline" onClick={clear}>
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa so sánh
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          {[0, 1].map((position) => (
            <Select
              key={position}
              value={productIds[position] ?? ""}
              onChange={(event) => {
                const id = event.target.value;
                if (!id) {
                  if (productIds[position]) {
                    remove(productIds[position]);
                  }
                  return;
                }
                add(id);
              }}
            >
              <option value="">Chọn đồng hồ thứ {position + 1}</option>
              {allProductsQuery.data?.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.brand} - {item.name}
                </option>
              ))}
            </Select>
          ))}
        </CardContent>
      </Card>

      {selectedProducts.length < 2 ? (
        <EmptyState
          title="Cần chọn đủ 2 sản phẩm để so sánh"
          description="Bạn có thể vào trang Shop, bấm nút so sánh ở từng sản phẩm rồi quay lại đây."
          actionLabel="Đi đến Shop"
          onAction={() => (window.location.href = ROUTES.shop)}
        />
      ) : (
        <>
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="grid gap-3 md:grid-cols-2">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="rounded-2xl border border-border/60 p-4">
                    <img
                      src={product.images[0]?.url}
                      alt={product.name}
                      className="h-40 w-full rounded-xl object-cover"
                    />
                    <h3 className="mt-3 font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                    <p className="mt-2 text-lg font-semibold text-luxury-gold">
                      {toCurrency(product.salePrice ?? product.price)}
                    </p>
                    {product.stockQuantity > 0 ? <Badge variant="success">Còn hàng</Badge> : <Badge variant="danger">Hết hàng</Badge>}
                  </div>
                ))}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thông số</TableHead>
                    <TableHead>{selectedProducts[0].name}</TableHead>
                    <TableHead>{selectedProducts[1].name}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const left = String(selectedProducts[0][row.key]);
                    const right = String(selectedProducts[1][row.key]);
                    const isDifferent = left !== right;
                    return (
                      <TableRow key={row.key}>
                        <TableCell className="font-medium">{row.label}</TableCell>
                        <TableCell className={isDifferent ? "text-luxury-gold" : ""}>{left}</TableCell>
                        <TableCell className={isDifferent ? "text-luxury-gold" : ""}>{right}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="luxury">
              <Link to={`/product/${selectedProducts[0].slug}`}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Mua {selectedProducts[0].brand}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={ROUTES.shop}>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Quay lại mua sắm
              </Link>
            </Button>
          </div>
        </>
      )}
    </section>
  );
};
