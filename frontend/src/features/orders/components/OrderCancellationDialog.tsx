import { useEffect, useState } from "react";

import { ORDER_CANCELLATION_REASONS } from "@/features/orders/constants/cancellation";
import type { CancelOrderInput } from "@/services/orderService";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

interface OrderCancellationDialogProps {
  open: boolean;
  mode: "cancel" | "request";
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (input: CancelOrderInput) => void;
}

export const OrderCancellationDialog = ({
  open,
  mode,
  loading = false,
  onOpenChange,
  onConfirm,
}: OrderCancellationDialogProps) => {
  const [reason, setReason] = useState<CancelOrderInput["reason"]>("WRONG_PRODUCT");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("WRONG_PRODUCT");
      setNote("");
      setError(null);
    }
  }, [open]);

  const confirmText = mode === "cancel" ? "Xác nhận hủy đơn" : "Gửi yêu cầu hủy";
  const title = mode === "cancel" ? "Xác nhận hủy đơn hàng" : "Gửi yêu cầu hủy đơn";
  const description =
    mode === "cancel"
      ? "Bạn chắc chắn muốn hủy đơn hàng này? Hệ thống sẽ cập nhật lại kho và thông báo cho cửa hàng."
      : "Đơn hàng đang được giao nên bạn chỉ có thể gửi yêu cầu hủy để nhân viên xử lý.";

  const handleConfirm = () => {
    const normalizedNote = note.trim();
    if (reason === "OTHER" && !normalizedNote) {
      setError("Vui lòng nhập lý do chi tiết khi chọn 'Khác'.");
      return;
    }
    setError(null);
    onConfirm({
      reason,
      note: normalizedNote || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">Lý do</p>
            <Select value={reason} onChange={(event) => setReason(event.target.value as CancelOrderInput["reason"])}>
              {ORDER_CANCELLATION_REASONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">
              Ghi chú {reason === "OTHER" ? "(bắt buộc)" : "(tùy chọn)"}
            </p>
            <Textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Nhập thêm thông tin để cửa hàng xử lý nhanh hơn"
            />
          </div>

          {error ? <p className="text-xs text-red-500">{error}</p> : null}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              type="button"
            >
              Đóng
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleConfirm}
              disabled={loading}
              type="button"
            >
              {loading ? "Đang xử lý..." : confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
