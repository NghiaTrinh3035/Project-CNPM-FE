import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { EmptyState } from "@/shared/components/states/EmptyState";
import { cartService } from "@/services/cartService";
import { productService } from "@/services/productService";
import { ROUTES } from "@/shared/constants/routes";
import { useSession } from "@/shared/hooks/useSession";
import { toCurrency } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

export const CartPage = () => {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [voucher, setVoucher] = useState("");
  const [cartNote, setCartNote] = useState("");

  useEffect(() => {
    if (!user) {
      setCartNote("");
      return;
    }
    setCartNote(cartService.getCheckoutNote(user.id));
  }, [user]);

  const cartQuery = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => (user ? cartService.getCart(user.id) : Promise.resolve(null)),
    enabled: Boolean(user),
  });

  const productQuery = useQuery({
    queryKey: ["cart-products", user?.id, cartQuery.data?.items.map((item) => item.productId).join(",")],
    queryFn: () => productService.getByIds(cartQuery.data?.items.map((item) => item.productId) ?? []),
    enabled: Boolean(cartQuery.data?.items.length),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["header-cart", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["checkout-cart", user?.id] });
  };

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      user ? cartService.updateQuantity(user.id, itemId, quantity) : Promise.reject(new Error("Chưa đăng nhập.")),
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) =>
      user ? cartService.removeItem(user.id, itemId) : Promise.reject(new Error("Chưa đăng nhập.")),
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message),
  });

  const voucherMutation = useMutation({
    mutationFn: (code: string) =>
      user ? cartService.applyVoucher(user.id, code) : Promise.reject(new Error("Chưa đăng nhập.")),
    onSuccess: (_cart, code) => {
      setVoucher(code.trim().toUpperCase());
      invalidate();
      toast.success("Áp dụng voucher thành công.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const cart = cartQuery.data;
  const products = productQuery.data ?? [];
  const productMap = new Map(products.map((item) => [item.id, item]));

  const handleQuantityChange = (itemId: string, currentQuantity: number, nextQuantity: number, productId: string) => {
    const product = productMap.get(productId);

    if (nextQuantity <= 0) {
      toast.info("Số lượng bằng 0, sản phẩm đã được xóa khỏi giỏ hàng.");
      removeMutation.mutate(itemId);
      return;
    }

    if (product) {
      const maxAllowed = currentQuantity + Math.max(product.stockQuantity, 0);
      if (nextQuantity > maxAllowed) {
        toast.error("Số lượng vượt quá tồn kho.");
        return;
      }
    }

    updateMutation.mutate({ itemId, quantity: nextQuantity });
  };

  const handleCheckout = () => {
    if (user) {
      cartService.setCheckoutNote(user.id, cartNote);
    }
    navigate(ROUTES.customer.checkout);
  };

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="Giỏ hàng trống"
        description="Hãy thêm sản phẩm để bắt đầu hành trình mua sắm của bạn."
        actionLabel="Đi mua sắm"
        onAction={() => navigate(ROUTES.shop)}
      />
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const appliedVoucher = cart.voucherCode;
  const discountPercent = Math.max(0, cart.voucherDiscountPercent ?? 0);
  const discount = subtotal * (discountPercent / 100);
  const total = subtotal - discount;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Giỏ hàng của bạn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cart.items.map((item) => {
            const product = productMap.get(item.productId);
            if (!product) {
              return null;
            }
            return (
              <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-center">
                <img src={product.images[0]?.url} alt={product.name} className="h-24 w-full rounded-lg object-cover sm:w-24" />
                <div className="flex-1 space-y-1">
                  <Link to={`/products/${product.id}`} className="font-medium hover:text-luxury-gold">
                    {product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                  <p className="text-sm font-semibold text-luxury-gold">{toCurrency(item.unitPrice)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleQuantityChange(item.id, item.quantity, item.quantity - 1, item.productId)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleQuantityChange(item.id, item.quantity, item.quantity + 1, item.productId)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => removeMutation.mutate(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Tóm tắt thanh toán</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Tạm tính</span>
            <span>{toCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Giảm giá</span>
            <span className="text-emerald-500">-{toCurrency(discount)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Tổng thanh toán</span>
            <span className="text-luxury-gold">{toCurrency(total)}</span>
          </div>

          <div className="space-y-2 pt-2">
            <Input
              placeholder="Nhập mã voucher"
              value={voucher}
              onChange={(event) => setVoucher(event.target.value)}
            />
            {appliedVoucher ? (
              <p className="text-xs text-emerald-500">Đã áp dụng: {appliedVoucher} ({discountPercent}%)</p>
            ) : null}
            <Button
              variant="outline"
              className="w-full"
              disabled={!voucher.trim() || voucherMutation.isPending}
              onClick={() => voucherMutation.mutate(voucher.trim())}
            >
              Áp dụng mã giảm giá
            </Button>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium">Ghi chú đơn hàng</p>
            <Textarea
              value={cartNote}
              onChange={(event) => {
                const value = event.target.value;
                setCartNote(value);
                if (user) {
                  cartService.setCheckoutNote(user.id, value);
                }
              }}
              placeholder="Ví dụ: giao giờ hành chính, gọi trước khi giao..."
            />
          </div>

          <Button className="w-full" variant="luxury" onClick={handleCheckout}>
            Tiến hành thanh toán
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
