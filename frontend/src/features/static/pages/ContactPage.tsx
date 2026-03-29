import { Facebook, Mail, MapPin, MessageCircleMore, Phone } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

export const ContactPage = () => (
  <section className="mx-auto max-w-7xl space-y-8 px-4 py-12 md:px-6">
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.25em] text-luxury-gold">Contact Concierge</p>
      <h1 className="font-display text-4xl">Liên hệ ChronoLux</h1>
      <p className="text-sm text-muted-foreground">
        Gửi yêu cầu tư vấn, kiểm tra sản phẩm hoặc hỗ trợ bảo hành. Chúng tôi phản hồi trong vòng 15 phút giờ làm việc.
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="space-y-2 p-5">
          <MapPin className="h-5 w-5 text-luxury-gold" />
          <p className="font-medium">Showroom</p>
          <p className="text-sm text-muted-foreground">21 Dong Khoi, Quận 1, TP. HCM</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-2 p-5">
          <Phone className="h-5 w-5 text-luxury-gold" />
          <p className="font-medium">Hotline</p>
          <p className="text-sm text-muted-foreground">1900 6868 - 0909 000 888</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-2 p-5">
          <Mail className="h-5 w-5 text-luxury-gold" />
          <p className="font-medium">Email</p>
          <p className="text-sm text-muted-foreground">concierge@chronolux.vn</p>
        </CardContent>
      </Card>
    </div>

    <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
      <Card>
        <CardContent className="space-y-3 p-6">
          <h2 className="text-xl font-semibold">Gửi yêu cầu nhanh</h2>
          <Input placeholder="Họ và tên" />
          <Input placeholder="Số điện thoại" />
          <Input placeholder="Email" />
          <Textarea placeholder="Nội dung cần tư vấn..." />
          <Button variant="luxury">Gửi yêu cầu</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 p-6">
          <h2 className="text-xl font-semibold">Kênh hỗ trợ trực tiếp</h2>
          <p className="text-sm text-muted-foreground">
            Kết nối nhanh với nhân viên tư vấn qua các kênh social để nhận hỗ trợ theo thời gian thực.
          </p>
          <Button variant="outline" asChild>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <Facebook className="mr-2 h-4 w-4" />
              Facebook Messenger
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://zalo.me" target="_blank" rel="noreferrer">
              <MessageCircleMore className="mr-2 h-4 w-4" />
              Zalo OA
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  </section>
);
