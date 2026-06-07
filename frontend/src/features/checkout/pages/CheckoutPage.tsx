import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";

import { cartService } from "@/services/cartService";
import { orderService } from "@/services/orderService";
import { ROUTES } from "@/shared/constants/routes";
import { useSession } from "@/shared/hooks/useSession";
import { toCurrency } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Skeleton } from "@/shared/ui/skeleton";
import { Label } from "@radix-ui/react-dropdown-menu";


const checkoutSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  province: z.string().min(1, "Vui lòng nhập tỉnh/thành"),
  district: z.string().min(1, "Vui lòng nhập quận/huyện"),
  ward: z.string().min(1, "Vui lòng nhập phường/xã"),
  detailAddress: z.string().min(4, "Vui lòng nhập địa chỉ cụ thể"),
  note: z.string().optional(),
  paymentMethod: z.enum(["VNPAY", "MOMO", "PAYPAL"]),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

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
      province: "",
      district: "",
      ward: "",
      detailAddress: "",
      note: user ? cartService.getCheckoutNote(user.id) : "",
      paymentMethod: "VNPAY",
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    const subscription = form.watch((values, info) => {
      if (info.name === "note") {
        cartService.setCheckoutNote(user.id, values.note ?? "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form, user]);

  const createPaymentMutation = useMutation({
    mutationFn: (values: CheckoutValues) => {
      if (!user) {
        return Promise.reject(new Error("Vui lòng đăng nhập trước khi thanh toán."));
      }
      return orderService.createPaymentSession({
        userId: user.id,
        address: {
          fullName: values.fullName,
          phone: values.phone,
          province: values.province,
          district: values.district,
          ward: values.ward,
          detailAddress: values.detailAddress,
        },
        note: values.note,
        method: values.paymentMethod,
      });
    },
    onSuccess: (session) => {
      if (session.qrUrl) {
        window.location.href = session.qrUrl;
      } else {
        toast.error("Không tìm thấy URL thanh toán.");
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const cart = cartQuery.data;
  const selectedItemIds = user ? cartService.getSelectedItemIds(user.id) : [];
  const selectedItemSet = new Set(selectedItemIds);
  const checkoutItems = cart
    ? cart.items.filter((item) => (selectedItemSet.size > 0 ? selectedItemSet.has(item.id) : true))
    : [];
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountPercent = Math.max(0, cart?.voucherDiscountPercent ?? 0);
  const discount = subtotal * (discountPercent / 100);
  const total = subtotal - discount;

  const currentPaymentMethod = form.watch("paymentMethod");

  if (!user || cartQuery.isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin nhận hàng</CardTitle>
        </CardHeader>
        <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit((values) => createPaymentMutation.mutate(values))}>
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

              <div className="space-y-3 pt-4">
                <p className="font-medium text-sm">Phương thức thanh toán</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { id: "VNPAY", label: "VNPAY" },
                    { id: "MOMO", label: "MoMo" },
                    { id: "PAYPAL", label: "PayPal" },
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => form.setValue("paymentMethod", method.id as any)}
                      className={`cursor-pointer rounded-xl border p-3 text-center transition-colors ${currentPaymentMethod === method.id
                        ? "border-luxury-gold bg-luxury-gold/10 font-medium text-luxury-gold"
                        : "border-border/60 hover:bg-muted"
                        }`}
                    >
                      {method.label}
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" variant="luxury" disabled={createPaymentMutation.isPending}>
                {createPaymentMutation.isPending ? "Đang xử lý..." : `Thanh toán với ${currentPaymentMethod}`}
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
            <span className="text-luxury-gold">{toCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
