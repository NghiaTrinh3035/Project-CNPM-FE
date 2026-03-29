import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, MailCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { authApi } from "@/services/api/authApi";
import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { useState } from "react";

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string>(location.state?.email ?? "");
  const [verified, setVerified] = useState(false);
  const [otp, setOtp] = useState("");

  const verifyMutation = useMutation({
    mutationFn: (emailArg: { email: string; otp: string }) => authApi.verifyEmail(emailArg),
    onSuccess: () => {
      setVerified(true);
      toast.success("Xác thực email thành công.");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message ?? error?.message ?? "Xác thực thất bại";
      toast.error(message);
    },
  });

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
      <Card className="w-full">
        <CardContent className="space-y-5 p-6 text-center">
          {verified ? <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" /> : <MailCheck className="mx-auto h-10 w-10 text-luxury-gold" />}
          <h1 className="font-display text-3xl">
            {verified ? "Email đã được xác thực" : "Xác thực email"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {verified
              ? "Bạn có thể đăng nhập và bắt đầu trải nghiệm ChronoLux."
              : "Nhập email vừa đăng ký để hoàn tất bước xác thực tài khoản."}
          </p>

          {!verified ? (
            <div className="space-y-3">
              <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Nhập mã OTP 6 chữ số" />
              <Button className="w-full" variant="luxury" onClick={() => verifyMutation.mutate({ email, otp })}>
                Xác thực ngay
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={() => navigate(ROUTES.auth.login)}>
              Đi tới đăng nhập
            </Button>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
