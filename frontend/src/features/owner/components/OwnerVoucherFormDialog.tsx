import { useEffect, useMemo, useState } from "react";

import type { Voucher } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { VOUCHER_STATUS_LABELS, type VoucherFormValues, voucherFormSchema } from "@/features/owner/schemas/voucherSchema";

type FormErrors = Partial<Record<keyof VoucherFormValues, string>>;

type VoucherFormState = {
  code: string;
  discountPercent: string;
  quantity: string;
  status: VoucherFormValues["status"];
  validFrom: string;
  validTo: string;
};

interface OwnerVoucherFormDialogProps {
  open: boolean;
  mode: "create" | "update";
  initialVoucher?: Voucher | null;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: VoucherFormValues) => Promise<void>;
}

const toDateTimeLocal = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const getDefaultState = (voucher?: Voucher | null): VoucherFormState => {
  const startDate = voucher?.validFrom ?? new Date().toISOString();
  const endDate =
    voucher?.validTo ??
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  return {
    code: voucher?.code ?? "",
    discountPercent: String(voucher?.discountPercent ?? 10),
    quantity: String(voucher?.quantity ?? 1),
    status: voucher?.status ?? "ACTIVE",
    validFrom: toDateTimeLocal(startDate),
    validTo: toDateTimeLocal(endDate),
  };
};

export const OwnerVoucherFormDialog = ({
  open,
  mode,
  initialVoucher,
  submitting,
  onOpenChange,
  onSubmit,
}: OwnerVoucherFormDialogProps) => {
  const [formValues, setFormValues] = useState<VoucherFormState>(getDefaultState());
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) {
      return;
    }
    setFormValues(getDefaultState(initialVoucher));
    setErrors({});
  }, [initialVoucher, open]);

  const title = useMemo(
    () => (mode === "create" ? "Thêm voucher mới" : `Cập nhật voucher ${initialVoucher?.code ?? ""}`),
    [initialVoucher?.code, mode],
  );

  const handleSubmit = async () => {
    const parsed = voucherFormSchema.safeParse(formValues);
    if (!parsed.success) {
      const nextErrors: FormErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof VoucherFormValues;
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
          <DialogDescription>
            Điền đầy đủ thông tin voucher trước khi lưu.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">Mã voucher</p>
            <Input
              value={formValues.code}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))
              }
              placeholder="VD: SALE20"
            />
            {errors.code ? <p className="text-xs text-red-500">{errors.code}</p> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Phần trăm giảm (%)</p>
              <Input
                type="number"
                min={1}
                max={100}
                value={formValues.discountPercent}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, discountPercent: event.target.value }))
                }
                placeholder="10"
              />
              {errors.discountPercent ? (
                <p className="text-xs text-red-500">{errors.discountPercent}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Số lượng</p>
              <Input
                type="number"
                min={1}
                value={formValues.quantity}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, quantity: event.target.value }))
                }
                placeholder="100"
              />
              {errors.quantity ? <p className="text-xs text-red-500">{errors.quantity}</p> : null}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Trạng thái</p>
            <Select
              value={formValues.status}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  status: event.target.value as VoucherFormValues["status"],
                }))
              }
            >
              <option value="ACTIVE">{VOUCHER_STATUS_LABELS.ACTIVE}</option>
              <option value="EXPIRED">{VOUCHER_STATUS_LABELS.EXPIRED}</option>
              <option value="USED_UP">{VOUCHER_STATUS_LABELS.USED_UP}</option>
            </Select>
            {errors.status ? <p className="text-xs text-red-500">{errors.status}</p> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Hiệu lực từ</p>
              <Input
                type="datetime-local"
                value={formValues.validFrom}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, validFrom: event.target.value }))
                }
              />
              {errors.validFrom ? <p className="text-xs text-red-500">{errors.validFrom}</p> : null}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Hiệu lực đến</p>
              <Input
                type="datetime-local"
                value={formValues.validTo}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, validTo: event.target.value }))
                }
              />
              {errors.validTo ? <p className="text-xs text-red-500">{errors.validTo}</p> : null}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="luxury" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? "Đang lưu..." : mode === "create" ? "Thêm mới" : "Cập nhật"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

