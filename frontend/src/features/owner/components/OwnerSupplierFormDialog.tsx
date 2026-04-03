import { useEffect, useMemo, useState } from "react";

import { supplierFormSchema, type SupplierFormValues } from "@/features/owner/schemas/supplierSchema";
import type { Supplier } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

type FormErrors = Partial<Record<keyof SupplierFormValues, string>>;

type SupplierFormState = {
  name: string;
  contractInfo: string;
  address: string;
};

interface OwnerSupplierFormDialogProps {
  open: boolean;
  mode: "create" | "update";
  initialSupplier?: Supplier | null;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SupplierFormValues) => Promise<void>;
}

const getDefaultState = (supplier?: Supplier | null): SupplierFormState => ({
  name: supplier?.name ?? "",
  contractInfo: supplier?.contractInfo ?? "",
  address: supplier?.address ?? "",
});

export const OwnerSupplierFormDialog = ({
  open,
  mode,
  initialSupplier,
  submitting,
  onOpenChange,
  onSubmit,
}: OwnerSupplierFormDialogProps) => {
  const [formValues, setFormValues] = useState<SupplierFormState>(getDefaultState());
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) {
      return;
    }
    setFormValues(getDefaultState(initialSupplier));
    setErrors({});
  }, [initialSupplier, open]);

  const title = useMemo(
    () => (mode === "create" ? "Thêm nhà cung cấp" : `Cập nhật nhà cung cấp ${initialSupplier?.name ?? ""}`),
    [initialSupplier?.name, mode],
  );

  const handleSubmit = async () => {
    const parsed = supplierFormSchema.safeParse(formValues);
    if (!parsed.success) {
      const nextErrors: FormErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof SupplierFormValues;
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Vui lòng nhập thông tin hợp lệ trước khi lưu.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">Tên nhà cung cấp</p>
            <Input
              value={formValues.name}
              onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Nhập tên nhà cung cấp"
            />
            {errors.name ? <p className="text-xs text-red-500">{errors.name}</p> : null}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Thông tin hợp đồng</p>
            <Textarea
              value={formValues.contractInfo}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, contractInfo: event.target.value }))
              }
              placeholder="Số điện thoại, email hoặc nội dung hợp đồng"
            />
            {errors.contractInfo ? <p className="text-xs text-red-500">{errors.contractInfo}</p> : null}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Địa chỉ</p>
            <Input
              value={formValues.address}
              onChange={(event) => setFormValues((prev) => ({ ...prev, address: event.target.value }))}
              placeholder="Nhập địa chỉ nhà cung cấp"
            />
            {errors.address ? <p className="text-xs text-red-500">{errors.address}</p> : null}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="luxury" disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? "Đang lưu..." : mode === "create" ? "Thêm mới" : "Cập nhật"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

