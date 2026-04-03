import { Eye, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  importReceiptFormSchema,
  type ImportReceiptFormValues,
} from "@/features/owner/schemas/importReceiptSchema";
import { ROUTES } from "@/shared/constants/routes";
import { toCurrency } from "@/shared/lib/format";
import type { Product, Supplier } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

type ReceiptItemState = {
  productId: string;
  quantity: string;
  importPrice: string;
};

type ItemErrors = {
  productId?: string;
  quantity?: string;
  importPrice?: string;
};

type FormErrors = {
  supplierId?: string;
  note?: string;
  items?: string;
  itemErrors: ItemErrors[];
};

interface OwnerImportReceiptFormDialogProps {
  open: boolean;
  suppliers: Supplier[];
  products: Product[];
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ImportReceiptFormValues) => Promise<void>;
}

const createDefaultItem = (): ReceiptItemState => ({
  productId: "",
  quantity: "1",
  importPrice: "0",
});

const createDefaultState = () => ({
  supplierId: "",
  note: "",
  items: [createDefaultItem()],
});

const createEmptyErrors = (itemCount: number): FormErrors => ({
  itemErrors: Array.from({ length: itemCount }, () => ({})),
});

const toSafeNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const OwnerImportReceiptFormDialog = ({
  open,
  suppliers,
  products,
  submitting,
  onOpenChange,
  onSubmit,
}: OwnerImportReceiptFormDialogProps) => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState(createDefaultState());
  const [errors, setErrors] = useState<FormErrors>(createEmptyErrors(1));

  useEffect(() => {
    if (!open) {
      return;
    }
    setFormValues(createDefaultState());
    setErrors(createEmptyErrors(1));
  }, [open]);

  const supplierOptions = useMemo(
    () =>
      suppliers
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((supplier) => ({ value: supplier.id, label: supplier.name })),
    [suppliers],
  );

  const productOptions = useMemo(
    () =>
      products
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((product) => ({ value: product.id, label: product.name })),
    [products],
  );

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const totals = useMemo(() => {
    return formValues.items.reduce(
      (acc, item) => {
        const quantity = Math.max(0, Math.round(toSafeNumber(item.quantity)));
        const importPrice = Math.max(0, Math.round(toSafeNumber(item.importPrice)));
        acc.quantity += quantity;
        acc.total += quantity * importPrice;
        return acc;
      },
      {
        quantity: 0,
        total: 0,
      },
    );
  }, [formValues.items]);

  const setItemField = (index: number, field: keyof ReceiptItemState, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addItem = () => {
    setFormValues((prev) => ({
      ...prev,
      items: [...prev.items, createDefaultItem()],
    }));
    setErrors((prev) => ({
      ...prev,
      itemErrors: [...prev.itemErrors, {}],
    }));
  };

  const removeItem = (index: number) => {
    setFormValues((prev) => {
      if (prev.items.length <= 1) {
        return prev;
      }
      return {
        ...prev,
        items: prev.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
    setErrors((prev) => {
      if (prev.itemErrors.length <= 1) {
        return prev;
      }
      return {
        ...prev,
        itemErrors: prev.itemErrors.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const handleSubmit = async () => {
    const parsed = importReceiptFormSchema.safeParse({
      supplierId: formValues.supplierId,
      note: formValues.note,
      items: formValues.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        importPrice: item.importPrice,
      })),
    });

    if (!parsed.success) {
      const nextErrors = createEmptyErrors(formValues.items.length);
      for (const issue of parsed.error.issues) {
        const [first, second, third] = issue.path;

        if (first === "supplierId") {
          nextErrors.supplierId = nextErrors.supplierId ?? issue.message;
          continue;
        }

        if (first === "note") {
          nextErrors.note = nextErrors.note ?? issue.message;
          continue;
        }

        if (first === "items" && typeof second === "number" && typeof third === "string") {
          const target = nextErrors.itemErrors[second] ?? {};
          if (third === "productId") {
            target.productId = target.productId ?? issue.message;
          } else if (third === "quantity") {
            target.quantity = target.quantity ?? issue.message;
          } else if (third === "importPrice") {
            target.importPrice = target.importPrice ?? issue.message;
          }
          nextErrors.itemErrors[second] = target;
          continue;
        }

        if (first === "items") {
          nextErrors.items = nextErrors.items ?? issue.message;
        }
      }

      setErrors(nextErrors);
      return;
    }

    setErrors(createEmptyErrors(formValues.items.length));
    await onSubmit(parsed.data);
  };

  const disabledSubmit = suppliers.length === 0 || products.length === 0 || submitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Tạo phiếu nhập</DialogTitle>
          <DialogDescription>
            Nhập thông tin nhà cung cấp và các dòng sản phẩm cần nhập kho.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">Nha cung cap</p>
            <Select
              value={formValues.supplierId}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, supplierId: event.target.value }))
              }
            >
              <option value="">Chọn nhà cung cấp</option>
              {supplierOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {errors.supplierId ? <p className="text-xs text-red-500">{errors.supplierId}</p> : null}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Ghi chú</p>
            <Textarea
              value={formValues.note}
              onChange={(event) => setFormValues((prev) => ({ ...prev, note: event.target.value }))}
              placeholder="Nhập ghi chú (nếu có)"
              className="min-h-20"
            />
            {errors.note ? <p className="text-xs text-red-500">{errors.note}</p> : null}
          </div>

          <div className="space-y-2 rounded-lg border border-border/70 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Danh sách sản phẩm nhập</p>
              <Button type="button" size="sm" variant="outline" onClick={addItem}>
                <Plus className="mr-1 h-4 w-4" />
                Thêm dòng
              </Button>
            </div>

            {errors.items ? <p className="text-xs text-red-500">{errors.items}</p> : null}

            <div className="space-y-2">
              {formValues.items.map((item, index) => {
                const selectedProduct = productById.get(item.productId);
                return (
                  <div
                    key={`import-item-${index}`}
                    className="grid gap-2 rounded-md border border-border/60 p-3 md:grid-cols-12"
                  >
                    <div className="space-y-1 md:col-span-5">
                      <p className="text-xs font-medium text-muted-foreground">San pham</p>
                      <Select
                        value={item.productId}
                        onChange={(event) => setItemField(index, "productId", event.target.value)}
                      >
                        <option value="">Chọn sản phẩm</option>
                        {productOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                      {errors.itemErrors[index]?.productId ? (
                        <p className="text-xs text-red-500">
                          {errors.itemErrors[index]?.productId}
                        </p>
                      ) : null}
                      {item.productId ? (
                        <div className="rounded-md border border-dashed border-border/70 bg-muted/30 px-2 py-1.5 text-xs text-muted-foreground">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p>
                              SKU: {selectedProduct?.sku ?? "--"} | Danh mục:{" "}
                              {selectedProduct?.category?.name ?? "--"}
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
                            Tồn kho hiện tại: {selectedProduct?.stockQuantity ?? "--"} | Giá bán:{" "}
                            {selectedProduct ? toCurrency(selectedProduct.price) : "--"}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-1 md:col-span-3">
                      <p className="text-xs font-medium text-muted-foreground">Số lượng</p>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={item.quantity}
                        onChange={(event) => setItemField(index, "quantity", event.target.value)}
                      />
                      {errors.itemErrors[index]?.quantity ? (
                        <p className="text-xs text-red-500">{errors.itemErrors[index]?.quantity}</p>
                      ) : null}
                    </div>

                    <div className="space-y-1 md:col-span-3">
                      <p className="text-xs font-medium text-muted-foreground">Giá nhập</p>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        value={item.importPrice}
                        onChange={(event) => setItemField(index, "importPrice", event.target.value)}
                      />
                      {errors.itemErrors[index]?.importPrice ? (
                        <p className="text-xs text-red-500">
                          {errors.itemErrors[index]?.importPrice}
                        </p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        Thành tiền:{" "}
                        {toCurrency(
                          Math.max(0, Math.round(toSafeNumber(item.quantity))) *
                            Math.max(0, Math.round(toSafeNumber(item.importPrice))),
                        )}
                      </p>
                    </div>

                    <div className="flex items-end md:col-span-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="danger"
                        disabled={formValues.items.length <= 1}
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-2 rounded-md border border-border/60 bg-muted/20 p-3 text-sm md:grid-cols-3">
              <p>
                <span className="font-medium">Số mặt hàng:</span> {formValues.items.length}
              </p>
              <p>
                <span className="font-medium">Tổng số lượng:</span> {totals.quantity}
              </p>
              <p>
                <span className="font-medium">Tổng tiền tạm tính:</span> {toCurrency(totals.total)}
              </p>
            </div>
          </div>

          {suppliers.length === 0 ? (
            <p className="text-sm text-amber-500">
              Không tìm thấy nhà cung cấp. Vui lòng tạo nhà cung cấp trước.
            </p>
          ) : null}

          {products.length === 0 ? (
            <p className="text-sm text-amber-500">
              Không tìm thấy sản phẩm. Vui lòng tạo sản phẩm trước.
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Huy
          </Button>
          <Button
            type="button"
            variant="luxury"
            disabled={disabledSubmit}
            onClick={() => void handleSubmit()}
          >
            {submitting ? "Đang lưu..." : "Tạo phiếu nhập"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
