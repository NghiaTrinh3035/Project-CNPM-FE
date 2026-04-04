import { useEffect, useState } from "react";

import type { WarrantyProcessFormValues } from "@/features/warranty/schemas/warrantyAdminSchema";
import { warrantyProcessSchema } from "@/features/warranty/schemas/warrantyAdminSchema";
import type { WarrantyAdminItem } from "@/features/warranty/types/warrantyAdmin";
import { WARRANTY_STATUS_LABEL } from "@/shared/constants/labels";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

type FormErrors = Partial<Record<keyof WarrantyProcessFormValues, string>>;

const stripAuditPrefix = (value: string) => {
  let current = value.trim();
  while (current.startsWith("Processed by ") || current.startsWith("Rejected by ")) {
    const separatorIndex = current.indexOf(":");
    if (separatorIndex < 0) {
      break;
    }
    current = current.slice(separatorIndex + 1).trim();
  }
  return current;
};

interface WarrantyStatusDialogProps {
  open: boolean;
  warranty: WarrantyAdminItem | null;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: WarrantyProcessFormValues) => Promise<void>;
}

export const WarrantyStatusDialog = ({
  open,
  warranty,
  submitting,
  onOpenChange,
  onSubmit,
}: WarrantyStatusDialogProps) => {
  const [formValues, setFormValues] = useState<WarrantyProcessFormValues>({
    status: "RECEIVED",
    rejectReason: "",
    technicianNote: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open || !warranty) {
      return;
    }
    setFormValues({
      status: warranty.status,
      rejectReason: stripAuditPrefix(warranty.rejectReason ?? ""),
      technicianNote: stripAuditPrefix(warranty.technicianNote ?? ""),
    });
    setErrors({});
  }, [open, warranty]);

  const handleSubmit = async () => {
    const parsed = warrantyProcessSchema.safeParse(formValues);
    if (!parsed.success) {
      const nextErrors: FormErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof WarrantyProcessFormValues;
        if (!nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit({
      ...parsed.data,
      technicianNote: stripAuditPrefix(parsed.data.technicianNote),
      rejectReason: stripAuditPrefix(parsed.data.rejectReason),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái bảo hành</DialogTitle>
          <DialogDescription>
            {warranty ? `Phiếu #${warranty.id} - ${warranty.customerName}` : "Cập nhật trạng thái phiếu bảo hành"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">Trạng thái</p>
            <Select
              value={formValues.status}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, status: event.target.value as WarrantyProcessFormValues["status"] }))
              }
            >
              <option value="RECEIVED">{WARRANTY_STATUS_LABEL.RECEIVED}</option>
              <option value="PROCESSING">{WARRANTY_STATUS_LABEL.PROCESSING}</option>
              <option value="COMPLETED">{WARRANTY_STATUS_LABEL.COMPLETED}</option>
              <option value="REJECTED">{WARRANTY_STATUS_LABEL.REJECTED}</option>
            </Select>
            {errors.status ? <p className="text-xs text-red-500">{errors.status}</p> : null}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Ghi chú kỹ thuật</p>
            <Textarea
              value={formValues.technicianNote}
              onChange={(event) => setFormValues((prev) => ({ ...prev, technicianNote: event.target.value }))}
              placeholder="Nội dung xử lý kỹ thuật"
            />
            {errors.technicianNote ? <p className="text-xs text-red-500">{errors.technicianNote}</p> : null}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Lý do từ chối</p>
            <Textarea
              value={formValues.rejectReason}
              onChange={(event) => setFormValues((prev) => ({ ...prev, rejectReason: event.target.value }))}
              placeholder="Bắt buộc khi trạng thái là Từ chối"
            />
            {errors.rejectReason ? <p className="text-xs text-red-500">{errors.rejectReason}</p> : null}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="luxury" disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? "Đang lưu..." : "Cập nhật"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

