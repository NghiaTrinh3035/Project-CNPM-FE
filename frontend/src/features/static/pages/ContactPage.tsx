import { Facebook, Mail, MapPin, MessageCircleMore, Phone } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";


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
  </section>
);
