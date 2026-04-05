import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, CircleHelp, Scale, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { HeroSection } from "@/features/home/components/HeroSection";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { ProductGridSkeleton } from "@/features/catalog/components/ProductGridSkeleton";
import { testimonials } from "@/mocks/data/social";
import { cartService } from "@/services/cartService";
import { productService } from "@/services/productService";
import { LoginPromptDialog } from "@/shared/components/common/LoginPromptDialog";
import { SectionHeading } from "@/shared/components/common/SectionHeading";
import { ROUTES } from "@/shared/constants/routes";
import { useAverageRatings } from "@/shared/hooks/useAverageRatings";
import { useCompareStore } from "@/shared/hooks/useCompareStore";
import { useSession } from "@/shared/hooks/useSession";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

const brands = ["Rolex", "Omega", "Longines", "Tissot", "Cartier", "TAG Heuer", "Seiko", "Rado"];

const faqs = [
  {
    q: "Sản phẩm có chính hãng không?",
    a: "Tất cả sản phẩm tại ChronoLux đều có chứng từ nguồn gốc rõ ràng, hóa đơn và chính sách bảo hành chính hãng.",
  },
  {
    q: "Shop có hỗ trợ trả góp không?",
    a: "Có. Bạn có thể thanh toán chuyển khoản hoặc ví điện tử, đội ngũ tư vấn sẽ hỗ trợ phương án phù hợp.",
  },
  {
    q: "Bao lâu nhận được hàng?",
    a: "Nội thành 1-2 ngày, liên tỉnh 2-4 ngày. Mỗi đơn đều có mã theo dõi trạng thái trực tuyến.",
  },
];

export const HomePage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const compareAdd = useCompareStore((state) => state.add);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const featuredQuery = useQuery({
    queryKey: ["home", "featured"],
    queryFn: () => productService.getFeatured(),
  });
  const bestSellerQuery = useQuery({
    queryKey: ["home", "best"],
    queryFn: () => productService.getBestSellers(),
  });
  const newArrivalsQuery = useQuery({
    queryKey: ["home", "new"],
    queryFn: () => productService.getNewArrivals(),
  });

  const homeProductIds = [
    ...(featuredQuery.data ?? []),
    ...(bestSellerQuery.data ?? []),
    ...(newArrivalsQuery.data ?? []),
  ].map((product) => product.id);

  const averageRatingsQuery = useAverageRatings(homeProductIds);

  const applyAverageRating = <T extends { id: string; averageRating?: number; rating?: number }>(product: T) => {
    const averageRating = averageRatingsQuery.data?.[product.id];
    if (averageRating === undefined) {
      return product;
    }

    return {
      ...product,
      averageRating,
      rating: averageRating,
    };
  };

  const featuredProducts = (featuredQuery.data ?? []).map(applyAverageRating);
  const bestSellerProducts = (bestSellerQuery.data ?? []).map(applyAverageRating);
  const newArrivalProducts = (newArrivalsQuery.data ?? []).map(applyAverageRating);
  const matchesSelectedBrand = <T extends { brand?: string }>(product: T) => {
    if (!selectedBrand) {
      return true;
    }
    return (product.brand ?? "").trim().toLowerCase() === selectedBrand.toLowerCase();
  };

  const filteredFeaturedProducts = featuredProducts.filter(matchesSelectedBrand);
  const filteredBestSellerProducts = bestSellerProducts.filter(matchesSelectedBrand);
  const filteredNewArrivalProducts = newArrivalProducts.filter(matchesSelectedBrand);

  const addCartMutation = useMutation({
    mutationFn: (productId: string) => {
      if (!user) {
        return Promise.reject(new Error("UNAUTH"));
      }
      return cartService.addItem(user.id, productId, 1);
    },
    onSuccess: (cart) => {
      if (user) {
        queryClient.setQueryData(["header-cart", user.id], cart);
        queryClient.setQueryData(["cart", user.id], cart);
        queryClient.setQueryData(["checkout-cart", user.id], cart);
      }
      toast.success("Đã thêm sản phẩm vào giỏ hàng.");
    },
    onError: (error) => {
      if (error.message === "UNAUTH") {
        setLoginPromptOpen(true);
        return;
      }
      toast.error(error.message);
    },
  });

  return (
    <>
      <HeroSection />

      <section className="border-b border-border/50 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 md:px-6">
          <Button
            variant={selectedBrand === null ? "luxury" : "ghost"}
            className="font-display text-lg"
            onClick={() => setSelectedBrand(null)}
          >
            Tất cả
          </Button>
          {brands.map((brand) => {
            const isActive = selectedBrand === brand;
            return (
              <Button
                key={brand}
                variant={isActive ? "luxury" : "ghost"}
                className="font-display text-lg"
                onClick={() => setSelectedBrand(brand)}
              >
                {brand}
              </Button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-12 px-4 py-14 md:px-6">
        <SectionHeading
          eyebrow="Featured Selection"
          title="Bộ sưu tập nổi bật"
          description="Những mẫu đồng hồ được khách hàng cao cấp lựa chọn nhiều nhất trong tháng."
        />
        {featuredQuery.isLoading ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredFeaturedProducts.length === 0 ? (
              <p className="sm:col-span-2 lg:col-span-4 text-sm text-muted-foreground">
                Không có sản phẩm phù hợp với thương hiệu đang chọn.
              </p>
            ) : (
              filteredFeaturedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(id) => addCartMutation.mutate(id)}
                  onCompare={(id) => {
                    compareAdd(id);
                    toast.success("Đã thêm vào danh sách so sánh.");
                  }}
                />
              ))
            )}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl space-y-12 px-4 pb-14 md:px-6">
        <SectionHeading
          eyebrow="Best Seller"
          title="Mẫu bán chạy"
          description="Tập hợp những thiết kế được yêu thích nhất cho đi làm, sự kiện và quà tặng."
        />
        {bestSellerQuery.isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredBestSellerProducts.length === 0 ? (
              <p className="sm:col-span-2 lg:col-span-4 text-sm text-muted-foreground">
                Không có sản phẩm phù hợp với thương hiệu đang chọn.
              </p>
            ) : (
              filteredBestSellerProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(id) => addCartMutation.mutate(id)}
                  onCompare={compareAdd}
                />
              ))
            )}
          </div>
        )}
      </section>

      <section className="border-y border-border/60 bg-card/30 py-14">
        <div className="mx-auto max-w-7xl space-y-8 px-4 md:px-6">
          <SectionHeading
            eyebrow="New Arrival"
            title="Bộ sưu tập mới cập nhật"
            description="Những thiết kế mới nhất phù hợp xu hướng 2026, từ classic đến modern luxury."
          />
          {newArrivalsQuery.isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filteredNewArrivalProducts.length === 0 ? (
                <p className="sm:col-span-2 lg:col-span-4 text-sm text-muted-foreground">
                  Không có sản phẩm phù hợp với thương hiệu đang chọn.
                </p>
              ) : (
                filteredNewArrivalProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(id) => addCartMutation.mutate(id)}
                    onCompare={compareAdd}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-14 md:grid-cols-3 md:px-6">
        {[
          {
            title: "Tư vấn AI chọn đồng hồ",
            desc: "Gợi ý nhanh theo ngân sách, chất liệu dây, chống nước và phong cách đeo.",
            icon: Sparkles,
            cta: "Bắt đầu tư vấn",
            to: ROUTES.home,
          },
          {
            title: "So sánh thông số chi tiết",
            desc: "Đối chiếu 2 mẫu đồng hồ theo bộ máy, kích thước, giá và mức chống nước.",
            icon: Scale,
            cta: "Đi đến trang so sánh",
            to: ROUTES.compare,
          },
          {
            title: "Liên hệ tư vấn nhanh",
            desc: "Kết nối trực tiếp chuyên viên qua Facebook/Zalo để được hỗ trợ tức thì.",
            icon: CircleHelp,
            cta: "Liên hệ ngay",
            to: ROUTES.contact,
          },
        ].map((item) => (
          <Card key={item.title} className="border-border/60">
            <CardContent className="space-y-4 p-6">
              <item.icon className="h-8 w-8 text-luxury-gold" />
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
              <Button variant="outline" asChild>
                <Link to={item.to}>{item.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 pb-14 md:px-6">
        <SectionHeading eyebrow="Trust Badges" title="Cam kết dịch vụ ChronoLux" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "100% chính hãng",
              desc: "Bảo chứng nguồn gốc và giấy tờ đầy đủ.",
              icon: CheckCircle2,
            },
            {
              title: "Bảo hành minh bạch",
              desc: "Hỗ trợ bảo hành rõ quy trình, theo dõi trạng thái trực tuyến.",
              icon: ShieldCheck,
            },
            {
              title: "Giao hàng bảo hiểm",
              desc: "Đóng gói chuẩn premium và vận chuyển an toàn.",
              icon: Truck,
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border/60 bg-card/50 p-6"
            >
              <item.icon className="h-7 w-7 text-luxury-gold" />
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/20 py-14">
        <div className="mx-auto max-w-7xl space-y-8 px-4 md:px-6">
          <SectionHeading eyebrow="Testimonials" title="Khách hàng nói gì về ChronoLux" />
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.id} className="border-border/60">
                <CardContent className="space-y-3 p-6">
                  <p className="text-sm text-muted-foreground">“{item.quote}”</p>
                  <p className="text-sm font-semibold">{item.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-14 md:px-6">
        <SectionHeading eyebrow="FAQ" title="Câu hỏi thường gặp" />
        <div className="grid gap-4 md:grid-cols-3">
          {faqs.map((item) => (
            <Card key={item.q}>
              <CardContent className="space-y-3 p-5">
                <h3 className="font-semibold">{item.q}</h3>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="rounded-3xl border border-luxury-gold/25 bg-gradient-to-r from-luxury-onyx to-luxury-graphite p-8 text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-luxury-gold">Luxury Concierge</p>
          <h3 className="mt-3 font-display text-3xl">Sẵn sàng nâng cấp phong cách của bạn?</h3>
          <p className="mt-2 max-w-2xl text-sm text-white/75">
            Nhận tư vấn 1:1 với đội ngũ ChronoLux hoặc AI Assistant để tìm chiếc đồng hồ phù hợp nhất với cá
            tính của bạn.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="luxury" asChild>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                Tư vấn qua Facebook
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://zalo.me" target="_blank" rel="noreferrer">
                Tư vấn qua Zalo
              </a>
            </Button>
          </div>
        </div>
      </section>

      <LoginPromptDialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen} />
    </>
  );
};
