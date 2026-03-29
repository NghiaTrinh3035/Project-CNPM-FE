import { getDb } from "@/mocks/data/database";
import { delay } from "@/services/mock/delay";
import type { Cart, CartItem } from "@/shared/types/domain";

const findOrCreateCart = (userId: string): Cart => {
  const db = getDb();
  let cart = db.carts.find((item) => item.userId === userId);
  if (!cart) {
    cart = {
      id: `c-${Date.now()}`,
      userId,
      items: [],
      updatedAt: new Date().toISOString(),
    };
    db.carts.push(cart);
  }
  return cart;
};

export const cartService = {
  async getCart(userId: string): Promise<Cart> {
    await delay(180);
    return structuredClone(findOrCreateCart(userId));
  },

  async addItem(userId: string, productId: string, quantity = 1): Promise<Cart> {
    await delay(220);
    const db = getDb();
    const product = db.products.find((item) => item.id === productId);
    if (!product) {
      throw new Error("Không tìm thấy sản phẩm.");
    }
    if (product.stockQuantity <= 0) {
      throw new Error("Sản phẩm đang hết hàng.");
    }
    const cart = findOrCreateCart(userId);
    const existing = cart.items.find((item) => item.productId === productId);
    const nextQty = (existing?.quantity ?? 0) + quantity;
    if (nextQty > product.stockQuantity) {
      throw new Error("Số lượng vượt quá tồn kho.");
    }
    if (existing) {
      existing.quantity = nextQty;
    } else {
      const item: CartItem = {
        id: `ci-${Date.now()}`,
        productId,
        quantity,
        unitPrice: product.salePrice ?? product.price,
      };
      cart.items.push(item);
    }
    cart.updatedAt = new Date().toISOString();
    return structuredClone(cart);
  },

  async updateQuantity(userId: string, itemId: string, quantity: number): Promise<Cart> {
    await delay(220);
    const db = getDb();
    const cart = findOrCreateCart(userId);
    const item = cart.items.find((value) => value.id === itemId);
    if (!item) {
      throw new Error("Không tìm thấy sản phẩm trong giỏ.");
    }
    const product = db.products.find((value) => value.id === item.productId);
    if (!product) {
      throw new Error("Sản phẩm không còn tồn tại.");
    }
    if (quantity <= 0) {
      cart.items = cart.items.filter((value) => value.id !== itemId);
    } else if (quantity > product.stockQuantity) {
      throw new Error("Số lượng vượt quá tồn kho.");
    } else {
      item.quantity = quantity;
    }
    cart.updatedAt = new Date().toISOString();
    return structuredClone(cart);
  },

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    await delay(180);
    const cart = findOrCreateCart(userId);
    cart.items = cart.items.filter((item) => item.id !== itemId);
    cart.updatedAt = new Date().toISOString();
    return structuredClone(cart);
  },

  async applyVoucher(userId: string, voucherCode: string): Promise<Cart> {
    await delay(250);
    const db = getDb();
    const voucher = db.vouchers.find((item) => item.code.toLowerCase() === voucherCode.toLowerCase());
    if (!voucher || !voucher.isActive) {
      throw new Error("Mã giảm giá không hợp lệ.");
    }
    const cart = findOrCreateCart(userId);
    const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    if (subtotal < voucher.minOrderValue) {
      throw new Error("Đơn hàng chưa đạt mức áp dụng voucher.");
    }
    cart.voucherCode = voucher.code;
    return structuredClone(cart);
  },

  async clearCart(userId: string) {
    await delay(100);
    const cart = findOrCreateCart(userId);
    cart.items = [];
    cart.voucherCode = undefined;
    cart.updatedAt = new Date().toISOString();
  },
};
