import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { WarrantyCreateFormValues } from "@/features/warranty/schemas/warrantyAdminSchema";
import { warrantyCreateSchema } from "@/features/warranty/schemas/warrantyAdminSchema";
import { adminService } from "@/services/adminService";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

type FormErrors = Partial<Record<keyof WarrantyCreateFormValues, string>>;

type WarrantyCreateFormState = {
  customerName: string;
  customerPhone: string;
  productId: string;
  quantity: string;
  issueDescription: string;
  receivedDate: string;
  expectedReturnDate: string;
  technicianNote: string;
};

interface WarrantyCreateDialogProps {
  open: boolean;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: WarrantyCreateFormValues) => Promise<void>;
}

const toDateTimeLocal = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const buildDefaultState = (): WarrantyCreateFormState => {
  const now = new Date();
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  return {
    customerName: "",
    customerPhone: "",
    productId: "",
    quantity: "1",
    issueDescription: "",
    receivedDate: toDateTimeLocal(now.toISOString()),
    expectedReturnDate: toDateTimeLocal(twoDaysLater.toISOString()),
    technicianNote: "",
  };
};

export const WarrantyCreateDialog = ({ open, submitting, onOpenChange, onSubmit }: WarrantyCreateDialogProps) => {
  const [formValues, setFormValues] = useState<WarrantyCreateFormState>(buildDefaultState());
  const [errors, setErrors] = useState<FormErrors>({});

  const productsQuery = useQuery({
    queryKey: ["warranty-create-products"],
    queryFn: () => adminService.listProducts(),
    enabled: open,
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    setFormValues(buildDefaultState());
    setErrors({});
  }, [open]);

  const handleSubmit = async () => {
    const parsed = warrantyCreateSchema.safeParse(formValues);
    if (!parsed.success) {
      const nextErrors: FormErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof WarrantyCreateFormValues;
        if (!nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit(parsed.data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo phiếu bảo hành mới</DialogTitle>
          <DialogDescription>Điền đầy đủ thông tin trước khi lưu phiếu bảo hành.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Tên khách hàng</p>
              <Input
                value={formValues.customerName}
                onChange={(event) => setFormValues((prev) => ({ ...prev, customerName: event.target.value }))}
                placeholder="Nguyễn Văn A"
              />
              {errors.customerName ? <p className="text-xs text-red-500">{errors.customerName}</p> : null}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Số điện thoại</p>
              <Input
                value={formValues.customerPhone}
                onChange={(event) => setFormValues((prev) => ({ ...prev, customerPhone: event.target.value }))}
                placeholder="09xxxxxxxx"
              />
              {errors.customerPhone ? <p className="text-xs text-red-500">{errors.customerPhone}</p> : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Sản phẩm</p>
              <Select
                value={formValues.productId}
                onChange={(event) => setFormValues((prev) => ({ ...prev, productId: event.target.value }))}
              >
                <option value="">Chọn sản phẩm</option>
                {(productsQuery.data ?? []).map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.id})
                  </option>
                ))}
              </Select>
              {errors.productId ? <p className="text-xs text-red-500">{errors.productId}</p> : null}
              {productsQuery.isLoading ? <p className="text-xs text-muted-foreground">Đang tải danh sách sản phẩm...</p> : null}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Số lượng</p>
              <Input
                type="number"
                min={1}
                value={formValues.quantity}
                onChange={(event) => setFormValues((prev) => ({ ...prev, quantity: event.target.value }))}
              />
              {errors.quantity ? <p className="text-xs text-red-500">{errors.quantity}</p> : null}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Mô tả vấn đề</p>
            <Textarea
              value={formValues.issueDescription}
              onChange={(event) => setFormValues((prev) => ({ ...prev, issueDescription: event.target.value }))}
              placeholder="Mô tả lỗi khách hàng gặp phải"
            />
            {errors.issueDescription ? <p className="text-xs text-red-500">{errors.issueDescription}</p> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Ngày nhận</p>
              <Input
                type="datetime-local"
                value={formValues.receivedDate}
                onChange={(event) => setFormValues((prev) => ({ ...prev, receivedDate: event.target.value }))}
              />
              {errors.receivedDate ? <p className="text-xs text-red-500">{errors.receivedDate}</p> : null}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Ngày dự kiến trả</p>
              <Input
                type="datetime-local"
                value={formValues.expectedReturnDate}
                onChange={(event) => setFormValues((prev) => ({ ...prev, expectedReturnDate: event.target.value }))}
              />
              {errors.expectedReturnDate ? <p className="text-xs text-red-500">{errors.expectedReturnDate}</p> : null}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Ghi chú kỹ thuật (tuỳ chọn)</p>
            <Textarea
              value={formValues.technicianNote}
              onChange={(event) => setFormValues((prev) => ({ ...prev, technicianNote: event.target.value }))}
              placeholder="Thông tin thêm cho kỹ thuật viên"
            />
            {errors.technicianNote ? <p className="text-xs text-red-500">{errors.technicianNote}</p> : null}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="luxury" disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? "Đang lưu..." : "Thêm mới"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

