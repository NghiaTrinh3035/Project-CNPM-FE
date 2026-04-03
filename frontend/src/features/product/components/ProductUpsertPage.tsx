import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ProductImageManager } from "@/features/product/components/ProductImageManager";
import { productManageSchema, type ProductManageValues } from "@/features/product/schemas/productManageSchema";
import { productAdminService } from "@/services/productAdminService";
import { PRODUCT_STATUS_LABEL } from "@/shared/constants/labels";
import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

type ProductFormErrors = Partial<Record<keyof ProductManageValues, string>>;

type ProductUpsertPageProps = {
  mode: "create" | "update";
  role: "OWNER" | "STAFF";
  productId?: string;
};

const defaultValues: ProductManageValues = {
  brand: "",
  name: "",
  description: "",
  price: 1,
  stockQuantity: 0,
  categoryIds: [],
  movementType: "",
  glassMaterial: "",
  waterResistance: "",
  faceSize: "",
  wireMaterial: "",
  wireColor: "",
  caseColor: "",
  faceColor: "",
  color: "",
  size: "",
  status: "OUT_OF_STOCK",
};

const toNormalizedStatus = (stockQuantity: number, status: ProductManageValues["status"]) =>
  stockQuantity === 0 ? "OUT_OF_STOCK" : status;

const toCreateRoute = (role: "OWNER" | "STAFF") => (role === "OWNER" ? ROUTES.owner.products : ROUTES.staff.products);

export const ProductUpsertPage = ({ mode, role, productId }: ProductUpsertPageProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState<ProductManageValues>(defaultValues);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [avatarFileIndex, setAvatarFileIndex] = useState(0);

  const listRoute = toCreateRoute(role);

  const categoriesQuery = useQuery({
    queryKey: ["product-form-categories"],
    queryFn: productAdminService.listCategories,
  });

  const productQuery = useQuery({
    queryKey: ["product-upsert", productId],
    queryFn: () => (productId ? productAdminService.getById(productId) : Promise.resolve(null)),
    enabled: mode === "update" && Boolean(productId),
  });

  useEffect(() => {
    if (mode !== "update" || !productQuery.data) {
      return;
    }
    const product = productQuery.data;
    setFormValues({
      brand: product.brand ?? "",
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryIds: (product.categories ?? []).map((category) => category.id),
      movementType: product.movementType ?? "",
      glassMaterial: product.glassMaterial ?? "",
      waterResistance: product.waterResistance ?? "",
      faceSize: product.faceSize ?? "",
      wireMaterial: product.wireMaterial ?? product.strapMaterial ?? "",
      wireColor: product.wireColor ?? product.strapColor ?? "",
      caseColor: product.caseColor ?? "",
      faceColor: product.faceColor ?? "",
      color: product.color ?? "",
      size: product.size ?? "",
      status: toNormalizedStatus(product.stockQuantity, product.status),
    });
  }, [mode, productQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (values: ProductManageValues) => {
      const payloadBase = {
        brand: values.brand.trim(),
        name: values.name.trim(),
        description: values.description.trim(),
        price: Math.round(values.price),
        stockQuantity: Math.max(0, Math.round(values.stockQuantity)),
        categoryIds: values.categoryIds,
        movementType: values.movementType.trim(),
        glassMaterial: values.glassMaterial.trim(),
        waterResistance: values.waterResistance.trim(),
        faceSize: values.faceSize.trim(),
        wireMaterial: values.wireMaterial.trim(),
        wireColor: values.wireColor.trim(),
        caseColor: values.caseColor.trim(),
        faceColor: values.faceColor.trim(),
        color: values.color.trim(),
        size: values.size.trim(),
      };

      if (mode === "create") {
        const created = await productAdminService.create(payloadBase);
        for (let index = 0; index < newImageFiles.length; index += 1) {
          await productAdminService.uploadImage(created.id, newImageFiles[index], index === avatarFileIndex);
        }
        return created;
      }

      if (!productId) {
        throw new Error("Không tìm thấy sản phẩm để cập nhật.");
      }

      return productAdminService.update(productId, {
        ...payloadBase,
        status: toNormalizedStatus(values.stockQuantity, values.status),
      });
    },
    onSuccess: (savedProduct) => {
      toast.success(mode === "create" ? "Đã thêm sản phẩm mới." : "Đã cập nhật sản phẩm.");
      queryClient.invalidateQueries({ queryKey: ["owner-products"] });
      queryClient.invalidateQueries({ queryKey: ["staff-products"] });
      queryClient.invalidateQueries({ queryKey: ["owner-product-detail", savedProduct.id] });
      queryClient.invalidateQueries({ queryKey: ["staff-product-detail", savedProduct.id] });
      if (mode === "create") {
        navigate(listRoute);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const title = useMemo(() => {
    if (mode === "create") {
      return role === "OWNER" ? "Thêm sản phẩm mới (Owner)" : "Thêm sản phẩm mới (Staff)";
    }
    return role === "OWNER" ? "Cập nhật sản phẩm (Owner)" : "Cập nhật sản phẩm (Staff)";
  }, [mode, role]);

  const handleSubmit = async () => {
    const parsed = productManageSchema.safeParse({
      ...formValues,
      status: toNormalizedStatus(formValues.stockQuantity, formValues.status),
    });

    if (!parsed.success) {
      const nextErrors: ProductFormErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof ProductManageValues;
        if (!nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await saveMutation.mutateAsync(parsed.data);
  };

  return (
    <Card className="mx-auto max-w-5xl">
      <CardHeader className="space-y-3">
        <Button variant="ghost" className="w-fit" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-sm font-medium">Tên đồng hồ</p>
            <Input value={formValues.name} onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))} />
            {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name}</p> : null}
          </div>
          <div>
            <p className="mb-1 text-sm font-medium">Thương hiệu</p>
            <Input value={formValues.brand} onChange={(event) => setFormValues((prev) => ({ ...prev, brand: event.target.value }))} />
            {errors.brand ? <p className="mt-1 text-xs text-red-500">{errors.brand}</p> : null}
          </div>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Mô tả</p>
          <Textarea value={formValues.description} onChange={(event) => setFormValues((prev) => ({ ...prev, description: event.target.value }))} />
          {errors.description ? <p className="mt-1 text-xs text-red-500">{errors.description}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="mb-1 text-sm font-medium">Giá (VND)</p>
            <Input type="number" min={1} value={String(formValues.price)} onChange={(event) => setFormValues((prev) => ({ ...prev, price: Number(event.target.value || 0) }))} />
            {errors.price ? <p className="mt-1 text-xs text-red-500">{errors.price}</p> : null}
          </div>
          <div>
            <p className="mb-1 text-sm font-medium">Tồn kho</p>
            <Input
              type="number"
              min={0}
              value={String(formValues.stockQuantity)}
              onChange={(event) => {
                const nextStock = Number(event.target.value || 0);
                setFormValues((prev) => ({
                  ...prev,
                  stockQuantity: nextStock,
                  status: toNormalizedStatus(nextStock, prev.status),
                }));
              }}
            />
            {errors.stockQuantity ? <p className="mt-1 text-xs text-red-500">{errors.stockQuantity}</p> : null}
          </div>
          <div>
            <p className="mb-1 text-sm font-medium">Trạng thái</p>
            <Select
              value={toNormalizedStatus(formValues.stockQuantity, formValues.status)}
              disabled={formValues.stockQuantity === 0}
              onChange={(event) => setFormValues((prev) => ({ ...prev, status: event.target.value as ProductManageValues["status"] }))}
            >
              <option value="ACTIVE">{PRODUCT_STATUS_LABEL.ACTIVE}</option>
              <option value="OUT_OF_STOCK">{PRODUCT_STATUS_LABEL.OUT_OF_STOCK}</option>
              <option value="DISCONTINUED">{PRODUCT_STATUS_LABEL.DISCONTINUED}</option>
            </Select>
            {formValues.stockQuantity === 0 ? <p className="mt-1 text-xs text-amber-600">Tồn kho bằng 0 nên trạng thái tự động là Hết hàng.</p> : null}
            {errors.status ? <p className="mt-1 text-xs text-red-500">{errors.status}</p> : null}
          </div>
          <div>
            <p className="mb-1 text-sm font-medium">Danh mục (chọn nhiều)</p>
            <select
              multiple
              value={formValues.categoryIds}
              className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onChange={(event) => {
                const selected = Array.from(event.target.selectedOptions).map((item) => item.value);
                setFormValues((prev) => ({ ...prev, categoryIds: selected }));
              }}
            >
              {(categoriesQuery.data ?? []).map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            {errors.categoryIds ? <p className="mt-1 text-xs text-red-500">{errors.categoryIds}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Input placeholder="Bộ máy" value={formValues.movementType} onChange={(event) => setFormValues((prev) => ({ ...prev, movementType: event.target.value }))} />
          <Input placeholder="Mặt kính" value={formValues.glassMaterial} onChange={(event) => setFormValues((prev) => ({ ...prev, glassMaterial: event.target.value }))} />
          <Input placeholder="Chống nước" value={formValues.waterResistance} onChange={(event) => setFormValues((prev) => ({ ...prev, waterResistance: event.target.value }))} />
          <Input placeholder="Kích thước mặt" value={formValues.faceSize} onChange={(event) => setFormValues((prev) => ({ ...prev, faceSize: event.target.value }))} />
          <Input placeholder="Chất liệu dây" value={formValues.wireMaterial} onChange={(event) => setFormValues((prev) => ({ ...prev, wireMaterial: event.target.value }))} />
          <Input placeholder="Màu dây" value={formValues.wireColor} onChange={(event) => setFormValues((prev) => ({ ...prev, wireColor: event.target.value }))} />
          <Input placeholder="Màu vỏ" value={formValues.caseColor} onChange={(event) => setFormValues((prev) => ({ ...prev, caseColor: event.target.value }))} />
          <Input placeholder="Màu mặt" value={formValues.faceColor} onChange={(event) => setFormValues((prev) => ({ ...prev, faceColor: event.target.value }))} />
          <Input placeholder="Màu tổng thể" value={formValues.color} onChange={(event) => setFormValues((prev) => ({ ...prev, color: event.target.value }))} />
          <Input placeholder="Kích cỡ" value={formValues.size} onChange={(event) => setFormValues((prev) => ({ ...prev, size: event.target.value }))} />
        </div>

        {mode === "create" ? (
          <div className="space-y-2 rounded-lg border border-border/60 p-3">
            <p className="text-sm font-medium">Upload ảnh khi thêm mới</p>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                setNewImageFiles(files);
                setAvatarFileIndex(0);
              }}
            />
            {newImageFiles.length > 0 ? (
              <Select value={String(avatarFileIndex)} onChange={(event) => setAvatarFileIndex(Number(event.target.value))}>
                {newImageFiles.map((file, index) => (
                  <option key={`${file.name}-${index}`} value={String(index)}>{`Avatar: ${file.name}`}</option>
                ))}
              </Select>
            ) : (
              <p className="text-xs text-muted-foreground">Bạn có thể thêm ảnh sau khi tạo sản phẩm nếu cần.</p>
            )}
          </div>
        ) : null}

        {mode === "update" && productId ? <ProductImageManager productId={productId} /> : null}

        <Button variant="luxury" className="w-full" disabled={saveMutation.isPending} onClick={() => void handleSubmit()}>
          <Save className="mr-2 h-4 w-4" />
          {saveMutation.isPending ? "Đang lưu..." : mode === "create" ? "Thêm sản phẩm" : "Cập nhật sản phẩm"}
        </Button>
      </CardContent>
    </Card>
  );
};

