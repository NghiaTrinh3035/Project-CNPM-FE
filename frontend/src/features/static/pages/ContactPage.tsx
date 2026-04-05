import { Building2, GraduationCap, Users } from "lucide-react";

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
          <Users className="h-5 w-5 text-luxury-gold" />
          <p className="font-medium">Thành viên</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Lê Nguyễn Đăng Khoa: 23110115</li>
            <li>Trịnh Đại Nghĩa: 23110131</li>
            <li>Nguyễn Sư Thành Đạt: 23110089</li>
            <li>Hà Trường Giang: 23110095</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-2 p-5">
          <Building2 className="h-5 w-5 text-luxury-gold" />
          <p className="font-medium">Khoa</p>
          <p className="text-sm text-muted-foreground">Khoa Công nghệ thông tin</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-2 p-5">
          <GraduationCap className="h-5 w-5 text-luxury-gold" />
          <p className="font-medium">Trường</p>
          <p className="text-sm text-muted-foreground">Trường Đại học Công nghệ Kỹ thuật TP.HCM</p>
        </CardContent>
      </Card>
    </div>
  </section>
);
