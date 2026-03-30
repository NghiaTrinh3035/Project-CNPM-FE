import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { adminService } from "@/services/adminService";
import { categories } from "@/mocks/data/categories";
import type { Product, ProductStatus } from "@/shared/types/domain";
import { toSlug } from "@/shared/utils/slug";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Textarea } from "@/shared/ui/textarea";

const blankProduct: Product = {
  id: "",
  slug: "",
  sku: "",
  name: "",
  brand: "",
  category: categories[0],
  description: "",
  price: 0,
  salePrice: undefined,
  stockQuantity: 0,
  movementType: "Automatic",
  glassMaterial: "Sapphire Crystal",
  waterResistance: "100m",
  faceSize: "40mm",
  thickness: "10mm",
  strapMaterial: "Steel",
  strapColor: "Bạc",
  caseColor: "Bạc",
  faceColor: "Đen",
  gender: "UNISEX",
  status: "ACTIVE",
  rating: 0,
  reviewCount: 0,
  images: [],
  specs: [],
  tags: [],
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: true,
  relatedProducts: [],
  createdAt: new Date().toISOString(),
};

export const OwnerProductsPage = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product>(blankProduct);

  const productsQuery = useQuery({
    queryKey: ["owner-products"],
    queryFn: adminService.listProducts,
  });

  const saveMutation = useMutation({
    mutationFn: adminService.saveProduct,
    onSuccess: () => {
      toast.success("Lưu sản phẩm thành công.");
      queryClient.invalidateQueries({ queryKey: ["owner-products"] });
      setEditing(blankProduct);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const createNew = () => {
    setEditing({
      ...blankProduct,
      id: `p-${Date.now()}`,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      images: [
        {
          id: `img-${Date.now()}`,
          url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=80",
          alt: "New product image",
          isPrimary: true,
        },
      ],
    });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_420px]">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Danh sách sản phẩm</CardTitle>
          <Button onClick={createNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo mới
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsQuery.data?.map((product) => (
                <TableRow key={product.id} onClick={() => setEditing(product)} className="cursor-pointer">
                  <TableCell>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.stockQuantity}</TableCell>
                  <TableCell>{product.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editing.id ? "Chỉnh sửa sản phẩm" : "Chọn sản phẩm để chỉnh sửa"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Tên sản phẩm"
            value={editing.name}
            onChange={(event) => setEditing((prev) => ({ ...prev, name: event.target.value, slug: toSlug(event.target.value) }))}
          />
          <Input
            placeholder="Thương hiệu"
            value={editing.brand}
            onChange={(event) => setEditing((prev) => ({ ...prev, brand: event.target.value }))}
          />
          <Input
            type="number"
            placeholder="Giá bán"
            value={editing.price}
            onChange={(event) => setEditing((prev) => ({ ...prev, price: Number(event.target.value) }))}
          />
          <Input
            type="number"
            placeholder="Giá khuyến mãi"
            value={editing.salePrice ?? ""}
            onChange={(event) =>
              setEditing((prev) => ({ ...prev, salePrice: event.target.value ? Number(event.target.value) : undefined }))
            }
          />
          <Input
            type="number"
            placeholder="Tồn kho"
            value={editing.stockQuantity}
            onChange={(event) => setEditing((prev) => ({ ...prev, stockQuantity: Number(event.target.value) }))}
          />
          <Select
            value={editing.status}
            onChange={(event) => setEditing((prev) => ({ ...prev, status: event.target.value as ProductStatus }))}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
            <option value="DISCONTINUED">DISCONTINUED</option>
          </Select>
          <Textarea
            placeholder="Mô tả sản phẩm"
            value={editing.description}
            onChange={(event) => setEditing((prev) => ({ ...prev, description: event.target.value }))}
          />
          <Button
            variant="luxury"
            className="w-full"
            onClick={() =>
              saveMutation.mutate({
                ...editing,
                specs: [
                  { label: "Loại máy", value: editing.movementType ?? "" },
                  { label: "Mặt kính", value: editing.glassMaterial ?? "" },
                  { label: "Chống nước", value: editing.waterResistance ?? "" },
                ],
                tags: (editing.tags && editing.tags.length ? editing.tags : [editing.brand ?? ""]).filter(Boolean) as string[],
              })
            }
          >
            Lưu sản phẩm
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
