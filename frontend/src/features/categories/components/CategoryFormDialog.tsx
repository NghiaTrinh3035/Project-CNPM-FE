import { useEffect, useMemo, useState } from "react";

import type { CategoryFormValues } from "@/features/categories/schemas/categorySchema";
import { categoryFormSchema } from "@/features/categories/schemas/categorySchema";
import type { Category } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

type CategoryFormErrors = Partial<Record<keyof CategoryFormValues, string>>;

type CategoryFormState = {
  name: string;
  description: string;
};

interface CategoryFormDialogProps {
  open: boolean;
  mode: "create" | "update";
  initialCategory?: Category | null;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}

const getDefaultState = (category?: Category | null): CategoryFormState => ({
  name: category?.name ?? "",
  description: category?.description ?? "",
});

export const CategoryFormDialog = ({
  open,
  mode,
  initialCategory,
  submitting,
  onOpenChange,
  onSubmit,
}: CategoryFormDialogProps) => {
  const [formValues, setFormValues] = useState<CategoryFormState>(getDefaultState());
  const [errors, setErrors] = useState<CategoryFormErrors>({});

  useEffect(() => {
    if (!open) {
      return;
    }
    setFormValues(getDefaultState(initialCategory));
    setErrors({});
  }, [initialCategory, open]);

  const title = useMemo(
    () => (mode === "create" ? "Thêm danh mục mới" : `Cập nhật danh mục ${initialCategory?.name ?? ""}`),
    [initialCategory?.name, mode],
  );

  const handleSubmit = async () => {
    const parsed = categoryFormSchema.safeParse(formValues);
    if (!parsed.success) {
      const nextErrors: CategoryFormErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof CategoryFormValues;
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
          <DialogDescription>Điền đầy đủ thông tin danh mục trước khi lưu.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">Tên danh mục</p>
            <Input
              value={formValues.name}
              onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Ví dụ: Đồng hồ cơ"
            />
            {errors.name ? <p className="text-xs text-red-500">{errors.name}</p> : null}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Mô tả</p>
            <Textarea
              value={formValues.description}
              onChange={(event) => setFormValues((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Mô tả ngắn về danh mục"
            />
            {errors.description ? <p className="text-xs text-red-500">{errors.description}</p> : null}
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

