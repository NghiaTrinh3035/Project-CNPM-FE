import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";

export const HeroSection = () => (
  <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-luxury-graphite via-luxury-onyx to-background">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(201,165,92,0.22),transparent_52%)]" />
    <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:px-6 lg:grid-cols-2 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="space-y-6"
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-luxury-gold/30 bg-luxury-gold/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-luxury-gold">
          <Sparkles className="h-3.5 w-3.5" />
          Luxury Timepieces 2026
        </p>
        <h1 className="font-display text-4xl leading-tight text-white md:text-6xl">
          Tuyệt tác thời gian
          <span className="block text-luxury-gold">dành cho phong cách đỉnh cao.</span>
        </h1>
        <p className="max-w-xl text-sm text-white/75 md:text-base">
          Trải nghiệm mua sắm đồng hồ cao cấp với tư vấn AI thông minh, so sánh chuyên sâu và chính sách
          hậu mãi minh bạch.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="luxury" size="lg">
            <Link to={ROUTES.shop}>
              Khám phá bộ sưu tập
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to={ROUTES.compare}>So sánh ngay</Link>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="relative"
      >
        <div className="absolute -left-8 -top-10 h-24 w-24 rounded-full bg-luxury-gold/25 blur-2xl" />
        <div className="absolute -bottom-6 right-0 h-32 w-32 rounded-full bg-luxury-gold/15 blur-3xl" />
        <img
          src="https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=1400&q=80"
          alt="Luxury watch hero"
          className="h-[460px] w-full rounded-3xl object-cover shadow-premium"
        />
      </motion.div>
    </div>
  </section>
);
