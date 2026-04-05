import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";

import { cartService } from "@/services/cartService";
import { orderService } from "@/services/orderService";
import type { QrPaymentSession } from "@/services/orderService";
import { ROUTES } from "@/shared/constants/routes";
import { useSession } from "@/shared/hooks/useSession";
import { toCurrency } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  province: z.string().min(1, "Vui lòng nhập tỉnh/thành"),
  district: z.string().min(1, "Vui lòng nhập quận/huyện"),
  ward: z.string().min(1, "Vui lòng nhập phường/xã"),
  detailAddress: z.string().min(4, "Vui lòng nhập địa chỉ cụ thể"),
  note: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useSession();
  const pollingLockRef = useRef(false);
  const [qrSession, setQrSession] = useState<QrPaymentSession | null>(null);
  const [paymentMessage, setPaymentMessage] = useState("Đang chờ giao dịch chuyển khoản...");
  const [pollingEnabled, setPollingEnabled] = useState(false);

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
      note: user ? cartService.getCheckoutNote(user.id) : "",
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

  const createQrMutation = useMutation({
    mutationFn: (values: CheckoutValues) => {
      if (!user) {
        return Promise.reject(new Error("Vui lòng đăng nhập trước khi thanh toán."));
      }
      return orderService.createQrPaymentSession({
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
      });
    },
    onSuccess: (session) => {
      setQrSession(session);
      setPaymentMessage("Đang kiểm tra thanh toán mỗi 3 giây...");
      setPollingEnabled(true);
      toast.info("Đã tạo mã QR. Vui lòng chuyển khoản đúng nội dung.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const cancelQrMutation = useMutation({
    mutationFn: async () => {
      if (!qrSession) {
        return;
      }
      await orderService.cancelQrPayment(qrSession.orderId);
    },
    onSuccess: () => {
      setPollingEnabled(false);
      setQrSession(null);
      setPaymentMessage("Bạn đã hủy thanh toán.");
      toast.message("Đã hủy thanh toán.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    if (!qrSession || !pollingEnabled) {
      return;
    }
    let stopped = false;

    const pollStatus = async () => {
      if (stopped || pollingLockRef.current) {
        return;
      }
      pollingLockRef.current = true;
      try {
        const result = await orderService.checkQrPayment(qrSession.orderId);
        if (stopped) {
          return;
        }

        if (result.message) {
          setPaymentMessage(result.message);
        }

        if (result.status === "SUCCESS" && result.order) {
          setPollingEnabled(false);
          setQrSession(null);
          toast.success("Thanh toán thành công. Đơn hàng đã được tạo.");
          navigate(ROUTES.customer.orders);
          return;
        }

        if (result.status === "WRONG_AMOUNT") {
          setPollingEnabled(false);
          setPaymentMessage(result.message || "Bạn đã chuyển sai số tiền.");
          toast.error(result.message || "Bạn đã chuyển sai số tiền.");
          return;
        }

        if (result.status === "CANCELLED") {
          setPollingEnabled(false);
          setQrSession(null);
          setPaymentMessage(result.message || "Phiên thanh toán đã bị hủy.");
          toast.error(result.message || "Phiên thanh toán đã bị hủy.");
        }
      } catch (error) {
        if (!stopped) {
          const message = error instanceof Error ? error.message : "Không thể kiểm tra trạng thái thanh toán.";
          setPaymentMessage(message);
        }
      } finally {
        pollingLockRef.current = false;
      }
    };

    void pollStatus();
    const timer = window.setInterval(() => {
      void pollStatus();
    }, 3000);

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [navigate, pollingEnabled, qrSession]);

  const cart = cartQuery.data;
  const subtotal = cart?.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) ?? 0;
  const discount =
    cart?.voucherCode === "WELCOME5" ? subtotal * 0.05 : cart?.voucherCode === "LUXURY10" ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>{qrSession ? "Thanh toán chuyển khoản" : "Thông tin nhận hàng"}</CardTitle>
        </CardHeader>
        <CardContent>
          {qrSession ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img src={qrSession.qrUrl} alt="Mã QR thanh toán" className="w-full max-w-xs rounded-xl border border-border/60 p-2" />
              </div>
              <div className="space-y-2 rounded-xl border border-border/60 p-4 text-sm">
                <p>
                  <span className="font-medium">Số tài khoản:</span> {qrSession.accountNumber}
                </p>
                <p>
                  <span className="font-medium">Ngân hàng:</span> {qrSession.bankCode}
                </p>
                <p>
                  <span className="font-medium">Số tiền:</span> {toCurrency(qrSession.amount)}
                </p>
                <p>
                  <span className="font-medium">Nội dung chuyển khoản:</span> {qrSession.description}
                </p>
              </div>
              <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                Lưu ý: Không được sửa nội dung chuyển khoản, nếu sai hệ thống sẽ không xác nhận thanh toán.
              </p>
              <p className="text-sm text-muted-foreground">{paymentMessage}</p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => cancelQrMutation.mutate()}
                disabled={cancelQrMutation.isPending}
              >
                Hủy thanh toán
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={form.handleSubmit((values) => createQrMutation.mutate(values))}>
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

              <div className="rounded-xl border border-border/60 p-4 text-sm text-muted-foreground">
                Phương thức thanh toán: <span className="font-medium text-foreground">Chuyển khoản ngân hàng (QR)</span>
              </div>

              <Button type="submit" className="w-full" variant="luxury" disabled={createQrMutation.isPending}>
                Tạo mã QR thanh toán
              </Button>
            </form>
          )}
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
