import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";

import { cartService } from "@/services/cartService";
import { orderService } from "@/services/orderService";
import { ROUTES } from "@/shared/constants/routes";
import { useSession } from "@/shared/hooks/useSession";
import { toCurrency } from "@/shared/lib/format";
import type { PaymentMethod } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  province: z.string().min(1, "Vui lòng nhập tỉnh/thành"),
  district: z.string().min(1, "Vui lòng nhập quận/huyện"),
  ward: z.string().min(1, "Vui lòng nhập phường/xã"),
  detailAddress: z.string().min(4, "Vui lòng nhập địa chỉ cụ thể"),
  note: z.string().optional(),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER"]),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

const paymentMethods: Array<{ value: PaymentMethod; label: string; description: string }> = [
  {
    value: "COD",
    label: "Thanh toán khi nhận hàng",
    description: "Thanh toán tiền mặt khi nhận sản phẩm.",
  },
  {
    value: "BANK_TRANSFER",
    label: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản trước để ưu tiên xử lý nhanh đơn hàng.",
  },
];

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useSession();

  const cartQuery = useQuery({
    queryKey: ["checkout-cart", user?.id],
    queryFn: () => (user ? cartService.getCart(user.id) : Promise.resolve(null)),
    enabled: Boolean(user),
  });

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      province: "TP. HCM",
      district: "Quận 1",
      ward: "Bến Nghé",
      detailAddress: "",
      note: "",
      paymentMethod: "COD",
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (values: CheckoutValues) => {
      if (!user) {
        return Promise.reject(new Error("Vui lòng đăng nhập trước khi thanh toán."));
      }
      return orderService.placeOrder({
        userId: user.id,
        paymentMethod: values.paymentMethod,
        address: {
          fullName: values.fullName,
          phone: values.phone,
          province: values.province,
          district: values.district,
          ward: values.ward,
          detailAddress: values.detailAddress,
        },
        note: values.note,
      });
    },
    onSuccess: () => {
      toast.success("Đặt hàng thành công. Bạn có thể theo dõi tiến trình ở trang Đơn hàng của tôi.");
      navigate(ROUTES.customer.orders);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const cart = cartQuery.data;
  const subtotal = cart?.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) ?? 0;
  const discount =
    cart?.voucherCode === "WELCOME5" ? subtotal * 0.05 : cart?.voucherCode === "LUXURY10" ? subtotal * 0.1 : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin nhận hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => checkoutMutation.mutate(values))}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Họ và tên" {...form.register("fullName")} />
              <Input placeholder="Số điện thoại" {...form.register("phone")} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input placeholder="Tỉnh/Thành" {...form.register("province")} />
              <Input placeholder="Quận/Huyện" {...form.register("district")} />
              <Input placeholder="Phường/Xã" {...form.register("ward")} />
            </div>
            <Input placeholder="Địa chỉ cụ thể" {...form.register("detailAddress")} />
            <Textarea placeholder="Ghi chú cho đơn hàng" {...form.register("note")} />

            <div className="space-y-2 rounded-xl border border-border/60 p-4">
              <p className="font-medium">Phương thức thanh toán</p>
              <Select {...form.register("paymentMethod")}>
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground">
                {paymentMethods.find((method) => method.value === form.watch("paymentMethod"))?.description}
              </p>
            </div>

            <Button type="submit" className="w-full" variant="luxury" disabled={checkoutMutation.isPending}>
              Đặt hàng ngay
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Tóm tắt đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span>{toCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Giảm giá</span>
            <span className="text-emerald-500">-{toCurrency(discount)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Tổng</span>
            <span className="text-luxury-gold">{toCurrency(subtotal - discount)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
