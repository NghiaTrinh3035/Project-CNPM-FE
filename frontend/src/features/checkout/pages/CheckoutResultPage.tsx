import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import axiosClient from "@/api/axiosClient";

export const CheckoutResultPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"success" | "failed" | "loading">("loading");

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        const momoResultCode = searchParams.get("resultCode");
        const vnpResponseCode = searchParams.get("vnp_ResponseCode");
        const paypalCancel = searchParams.get("cancel");
        const paypalToken = searchParams.get("token");

        if (momoResultCode !== null) {
          await axiosClient.get(`/payment/momo-return?${searchParams.toString()}`);
          setStatus("success");
        } else if (vnpResponseCode !== null) {
          await axiosClient.get(`/payment/vnpay-return?${searchParams.toString()}`);
          setStatus("success");
        } else if (paypalToken !== null) {
          if (paypalCancel === "true") {
            await axiosClient.get(`/payment/paypal/cancel?token=${paypalToken}`);
            setStatus("failed");
          } else {
            await axiosClient.get(`/payment/paypal/capture?token=${paypalToken}`);
            setStatus("success");
          }
        } else {
          // Fallback if no known payment params
          setStatus("success");
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        setStatus("failed");
      }
    };

    processPaymentReturn();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p>Đang xử lý kết quả thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="flex flex-col items-center gap-4">
          {status === "success" ? (
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
          <CardTitle className="text-2xl">
            {status === "success" ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            {status === "success"
              ? "Cảm ơn bạn đã mua sắm tại WatchStore. Đơn hàng của bạn đã được ghi nhận và đang được xử lý."
              : "Đã có lỗi xảy ra trong quá trình giao dịch hoặc bạn đã hủy thanh toán. Vui lòng thử lại sau."}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {status === "success" ? (
              <Button asChild variant="luxury">
                <Link to={ROUTES.customer.orders}>Xem đơn hàng</Link>
              </Button>
            ) : (
              <Button asChild variant="luxury">
                <Link to={ROUTES.customer.checkout}>Thử lại ngay</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to={ROUTES.shop}>Tiếp tục mua sắm</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
