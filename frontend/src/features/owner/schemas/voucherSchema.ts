import { z } from "zod";

import type { VoucherStatus } from "@/shared/types/domain";

export const voucherStatusSchema = z.enum(["ACTIVE", "EXPIRED", "USED_UP"]);

const toTimestamp = (value: string) => new Date(value).getTime();

export const voucherFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(4, "Mã voucher tối thiểu 4 ký tự.")
      .max(50, "Mã voucher tối đa 50 ký tự."),
    discountPercent: z.coerce
      .number()
      .int("Phần trăm giảm phải là số nguyên.")
      .min(1, "Phần trăm giảm phải lớn hơn 0.")
      .max(100, "Phần trăm giảm tối đa là 100."),
    quantity: z.coerce
      .number()
      .int("Số lượng phải là số nguyên.")
      .min(1, "Số lượng tối thiểu là 1."),
    status: voucherStatusSchema,
    validFrom: z.string().trim().min(1, "Vui lòng chọn thời gian bắt đầu."),
    validTo: z.string().trim().min(1, "Vui lòng chọn thời gian kết thúc."),
  })
  .superRefine((values, context) => {
    const fromTime = toTimestamp(values.validFrom);
    const toTime = toTimestamp(values.validTo);

    if (Number.isNaN(fromTime)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["validFrom"],
        message: "Thời gian bắt đầu không hợp lệ.",
      });
    }

    if (Number.isNaN(toTime)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["validTo"],
        message: "Thời gian kết thúc không hợp lệ.",
      });
    }

    if (!Number.isNaN(fromTime) && !Number.isNaN(toTime) && toTime <= fromTime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["validTo"],
        message: "Thời gian kết thúc phải sau thời gian bắt đầu.",
      });
    }
  });

export type VoucherFormValues = z.infer<typeof voucherFormSchema>;

export const VOUCHER_STATUS_LABELS: Record<VoucherStatus, string> = {
  ACTIVE: "Đang hoạt động",
  EXPIRED: "Hết hạn",
  USED_UP: "Đã dùng hết",
};

