import { motion } from "framer-motion";
import { Scale, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";

import type { Product } from "@/shared/types/domain";
import { toCurrency } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onCompare?: (productId: string) => void;
}

export const ProductCard = ({ product, onAddToCart, onCompare }: ProductCardProps) => {
  const displayPrice = product.salePrice ?? product.price;
  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  const displayRating = product.averageRating ?? product.rating ?? 0;
  const hasRating = displayRating > 0;
  const reviewLabel = product.reviewCount && product.reviewCount > 0 ? ` (${product.reviewCount} đánh giá)` : "";

  return (
    <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="group overflow-hidden border-border/60 bg-card/60">
        <Link to={`/products/${product.id}`} className="block overflow-hidden">
          <img
            src={product.images[0]?.url}
            alt={product.images[0]?.alt ?? product.name}
            className="h-60 w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        <CardContent className="space-y-4 p-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{product.brand}</p>
            <Link to={`/products/${product.id}`} className="line-clamp-2 text-base font-semibold">
              {product.name}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-luxury-gold text-luxury-gold" />
            <span className="text-sm">
              {hasRating ? `${displayRating.toFixed(1)}${reviewLabel}` : "Chưa có đánh giá"}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-luxury-gold">{toCurrency(displayPrice)}</p>
              {product.salePrice ? (
                <span className="text-sm text-muted-foreground line-through">{toCurrency(product.price)}</span>
              ) : null}
            </div>
            {discountPercent > 0 ? <Badge variant="warning">-{discountPercent}%</Badge> : null}
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="luxury"
              disabled={product.stockQuantity <= 0}
              onClick={() => onAddToCart?.(product.id)}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {product.stockQuantity > 0 ? "Thêm vào giỏ" : "Hết hàng"}
            </Button>
            <Button variant="outline" size="icon" onClick={() => onCompare?.(product.id)} aria-label="So sánh">
              <Scale className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
};
