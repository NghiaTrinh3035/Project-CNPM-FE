import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { adminService } from "@/services/adminService";
import axiosClient from "@/api/axiosClient";
import { mapBackendCategory, unwrapPage } from "@/services/api/backendMappers";
import type { ProductCreateRequest } from "@/services/api/productApi";
import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

type ProductCreateForm = {
  brand: string;
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  categoryId: string;
  movementType: string;
  glassMaterial: string;
  faceSize: string;
  wireMaterial: string;
  waterResistance: string;
  faceColor: string;
  wireColor: string;
  caseColor: string;
  color: string;
  size: string;
  specs: string;
};

const blankCreateForm: ProductCreateForm = {
  brand: "",
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  categoryId: "",
  movementType: "",
  glassMaterial: "",
  faceSize: "",
  wireMaterial: "",
  waterResistance: "",
  faceColor: "",
  wireColor: "",
  caseColor: "",
  color: "",
  size: "",
  specs: "",
};

const toCreateRequest = (form: ProductCreateForm): ProductCreateRequest => ({
  brand: form.brand.trim(),
  name: form.name.trim(),
  description: form.description.trim(),
  price: Number(form.price || 0),
  stockQuantity: Number(form.stockQuantity || 0),
  categoryId: form.categoryId,
  movementType: form.movementType.trim(),
  glassMaterial: form.glassMaterial.trim(),
  faceSize: form.faceSize.trim(),
  wireMaterial: form.wireMaterial.trim(),
  waterResistance: form.waterResistance.trim(),
  faceColor: form.faceColor.trim(),
  wireColor: form.wireColor.trim(),
  caseColor: form.caseColor.trim(),
  color: form.color.trim(),
  size: form.size.trim(),
  specs: form.specs.trim(),
});

export const OwnerProductCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductCreateForm>(blankCreateForm);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axiosClient.get("/categories");
      const mapped = unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendCategory(item as Record<string, unknown>));
      return mapped;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: ProductCreateForm) => adminService.createProduct(toCreateRequest(payload)),
    onSuccess: () => {
      toast.success("Tạo sản phẩm thành công.");
      navigate(ROUTES.owner.products);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader className="space-y-3">
        <Button variant="ghost" className="w-fit" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <CardTitle>Tạo sản phẩm mới</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Tên sản phẩm" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          <Input placeholder="Thương hiệu" value={form.brand} onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))} />
          <Input
            type="number"
            placeholder="Giá bán"
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
          />
          <Input
            type="number"
            placeholder="Tồn kho"
            value={form.stockQuantity}
            onChange={(event) => setForm((prev) => ({ ...prev, stockQuantity: event.target.value }))}
          />
          <Select value={form.categoryId} onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}>
            <option value="" disabled>
              Chọn danh mục
            </option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Loại máy"
            value={form.movementType}
            onChange={(event) => setForm((prev) => ({ ...prev, movementType: event.target.value }))}
          />
          <Input
            placeholder="Chất liệu kính"
            value={form.glassMaterial}
            onChange={(event) => setForm((prev) => ({ ...prev, glassMaterial: event.target.value }))}
          />
          <Input
            placeholder="Kích thước mặt"
            value={form.faceSize}
            onChange={(event) => setForm((prev) => ({ ...prev, faceSize: event.target.value }))}
          />
          <Input
            placeholder="Chất liệu dây"
            value={form.wireMaterial}
            onChange={(event) => setForm((prev) => ({ ...prev, wireMaterial: event.target.value }))}
          />
          <Input
            placeholder="Khả năng chống nước"
            value={form.waterResistance}
            onChange={(event) => setForm((prev) => ({ ...prev, waterResistance: event.target.value }))}
          />
          <Input
            placeholder="Màu mặt"
            value={form.faceColor}
            onChange={(event) => setForm((prev) => ({ ...prev, faceColor: event.target.value }))}
          />
          <Input
            placeholder="Màu dây"
            value={form.wireColor}
            onChange={(event) => setForm((prev) => ({ ...prev, wireColor: event.target.value }))}
          />
          <Input
            placeholder="Màu vỏ"
            value={form.caseColor}
            onChange={(event) => setForm((prev) => ({ ...prev, caseColor: event.target.value }))}
          />
          <Input
            placeholder="Màu tổng thể"
            value={form.color}
            onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
          />
          <Input
            placeholder="Kích cỡ"
            value={form.size}
            onChange={(event) => setForm((prev) => ({ ...prev, size: event.target.value }))}
          />
        </div>

        <Textarea
          placeholder="Mô tả sản phẩm"
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
        />

        <Textarea
          placeholder="Thông số kỹ thuật, mỗi dòng một mục"
          value={form.specs}
          onChange={(event) => setForm((prev) => ({ ...prev, specs: event.target.value }))}
        />

        <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Danh mục hiện tại</p>
          <p>{(categoriesQuery.data ?? []).find((category) => category.id === form.categoryId)?.name ?? "Chưa chọn"}</p>
        </div>

        <Button className="w-full" variant="luxury" onClick={() => createMutation.mutate(form)}>
          Tạo sản phẩm
        </Button>
      </CardContent>
    </Card>
  );
};