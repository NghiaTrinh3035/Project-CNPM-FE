import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PRODUCT_STATUS_LABEL } from "@/shared/constants/labels";
import { ROUTES } from "@/shared/constants/routes";
import { adminService } from "@/services/adminService";
import { toCurrency } from "@/shared/lib/format";
import type { ProductStatus } from "@/shared/types/domain";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

export const StaffProductsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const productsQuery = useQuery({
    queryKey: ["staff-products"],
    queryFn: adminService.listProducts,
  });

  const saveMutation = useMutation({
    mutationFn: adminService.saveProduct,
    onSuccess: () => {
      toast.success("Cập nhật sản phẩm thành công.");
      queryClient.invalidateQueries({ queryKey: ["staff-products"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý sản phẩm (Staff)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Tồn kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsQuery.data?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                </TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{toCurrency(product.salePrice ?? product.price)}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    defaultValue={product.stockQuantity}
                    onBlur={(event) =>
                      saveMutation.mutate({
                        ...product,
                        stockQuantity: Number(event.target.value),
                      })
                    }
                    className="w-28"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{PRODUCT_STATUS_LABEL[product.status]}</Badge>
                    <Select
                      defaultValue={product.status}
                      onChange={(event) =>
                        saveMutation.mutate({
                          ...product,
                          status: event.target.value as ProductStatus,
                        })
                      }
                    >
                      <option value="ACTIVE">Đang bán</option>
                      <option value="OUT_OF_STOCK">Hết hàng</option>
                      <option value="DISCONTINUED">Ngừng bán</option>
                    </Select>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(ROUTES.staff.productDetail.replace(":id", product.id))}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
