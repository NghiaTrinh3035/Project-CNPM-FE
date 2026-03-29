import { useQuery } from "@tanstack/react-query";

import { adminService } from "@/services/adminService";
import { toCurrency } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

export const OwnerInventoryPage = () => {
  const productsQuery = useQuery({
    queryKey: ["owner-inventory-products"],
    queryFn: adminService.listProducts,
  });
  const receiptsQuery = useQuery({
    queryKey: ["owner-inventory-receipts"],
    queryFn: adminService.listImportReceipts,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tồn kho hiện tại</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Cảnh báo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsQuery.data?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.stockQuantity}</TableCell>
                  <TableCell>
                    {product.stockQuantity <= 5 ? <Badge variant="warning">Low stock</Badge> : <Badge variant="success">Ổn định</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử nhập kho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {receiptsQuery.data?.map((receipt) => (
            <div key={receipt.id} className="rounded-xl border border-border/60 p-4">
              <p className="font-medium">Phiếu nhập #{receipt.id}</p>
              <p className="text-xs text-muted-foreground">Supplier ID: {receipt.supplierId}</p>
              <div className="mt-2 space-y-1 text-sm">
                {receipt.details.map((detail) => (
                  <p key={detail.id}>
                    Product {detail.productId} - SL {detail.quantity} - Giá nhập {toCurrency(detail.unitCost)}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
