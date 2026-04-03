import axiosClient from "@/api/axiosClient";
import { getDb } from "@/mocks/data/database";
import { mapBackendCart } from "@/services/api/backendMappers";
import { delay } from "@/services/mock/delay";
import type { Cart, CartItem } from "@/shared/types/domain";

const CART_VOUCHER_STORAGE_KEY = "chrono-cart-voucher-map";

const readVoucherMap = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(CART_VOUCHER_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const voucherByUser: Record<string, string> = readVoucherMap();

const persistVoucherMap = () => {
  try {
    localStorage.setItem(CART_VOUCHER_STORAGE_KEY, JSON.stringify(voucherByUser));
  } catch {
    // Ignore storage issues and keep runtime map.
  }
};

const setVoucherForUser = (userId: string, voucherCode?: string) => {
  if (!voucherCode) {
    delete voucherByUser[userId];
  } else {
    voucherByUser[userId] = voucherCode;
  }
  persistVoucherMap();
};

const getVoucherForUser = (userId: string) => voucherByUser[userId];

const findOrCreateMockCart = (userId: string): Cart => {
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

const getCartFromApi = async (userId: string): Promise<Cart> => {
  const { data } = await axiosClient.get(`/cart/${userId}`);
  return mapBackendCart(data, { userId, voucherCode: getVoucherForUser(userId) });
};

const getCartSafe = async (userId: string): Promise<Cart> => {
  try {
    return await getCartFromApi(userId);
  } catch {
    await delay(120);
    return structuredClone(findOrCreateMockCart(userId));
  }
};

const updateMockItemByProduct = (userId: string, productId: string, quantity: number): Cart => {
  const db = getDb();
  const cart = findOrCreateMockCart(userId);
  const item = cart.items.find((entry) => entry.productId === productId);
  if (!item) {
    throw new Error("Không tìm thấy sản phẩm trong giỏ.");
  }
  const product = db.products.find((entry) => entry.id === productId);
  if (!product) {
    throw new Error("Sản phẩm không tồn tại.");
  }
  if (quantity <= 0) {
    cart.items = cart.items.filter((entry) => entry.productId !== productId);
  } else if (quantity > product.stockQuantity) {
    throw new Error("Số lượng vượt quá tồn kho.");
  } else {
    item.quantity = quantity;
  }
  cart.updatedAt = new Date().toISOString();
  cart.voucherCode = getVoucherForUser(userId);
  return structuredClone(cart);
};

const resolveProductId = async (userId: string, itemId: string) => {
  const cart = await getCartSafe(userId);
  return cart.items.find((item) => item.id === itemId)?.productId ?? itemId;
};

export const cartService = {
  async getCart(userId: string): Promise<Cart> {
    return getCartSafe(userId);
  },

  async addItem(userId: string, productId: string, quantity = 1): Promise<Cart> {
    try {
      const { data } = await axiosClient.post(`/cart/${userId}/items`, null, {
        params: { productId, quantity },
      });
      return mapBackendCart(data, { userId, voucherCode: getVoucherForUser(userId) });
    } catch {
      await delay(140);
      const db = getDb();
      const product = db.products.find((item) => item.id === productId);
      if (!product) {
        throw new Error("Không tìm thấy sản phẩm.");
      }
      if (product.stockQuantity <= 0) {
        throw new Error("Sản phẩm đang hết hàng.");
      }
      const cart = findOrCreateMockCart(userId);
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
      cart.voucherCode = getVoucherForUser(userId);
      return structuredClone(cart);
    }
  },

  async updateQuantity(userId: string, itemId: string, quantity: number): Promise<Cart> {
    const productId = await resolveProductId(userId, itemId);
    try {
      const { data } = await axiosClient.put(`/cart/${userId}/items/${productId}`, null, {
        params: { quantity },
      });
      return mapBackendCart(data, { userId, voucherCode: getVoucherForUser(userId) });
    } catch {
      await delay(120);
      return updateMockItemByProduct(userId, productId, quantity);
    }
  },

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const productId = await resolveProductId(userId, itemId);
    try {
      const { data } = await axiosClient.delete(`/cart/${userId}/items/${productId}`);
      return mapBackendCart(data, { userId, voucherCode: getVoucherForUser(userId) });
    } catch {
      await delay(100);
      return updateMockItemByProduct(userId, productId, 0);
    }
  },

  async applyVoucher(userId: string, voucherCode: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    let minOrderAmount = 0;
    let code = voucherCode.toUpperCase();
    try {
      const { data } = await axiosClient.post(`/vouchers/apply/${encodeURIComponent(voucherCode)}`);
      minOrderAmount = Number((data as { minOrderAmount?: number }).minOrderAmount ?? 0);
      code = ((data as { voucherCode?: string }).voucherCode ?? voucherCode).toUpperCase();
    } catch (error) {
      throw error instanceof Error ? error : new Error("Không thể áp dụng voucher. Vui lòng thử lại.");
    }

    if (subtotal < minOrderAmount) {
      throw new Error("Đơn hàng chưa đạt mức áp dụng voucher.");
    }

    setVoucherForUser(userId, code);
    return { ...cart, voucherCode: code, updatedAt: new Date().toISOString() };
  },

  async clearCart(userId: string) {
    setVoucherForUser(userId, undefined);
    try {
      await axiosClient.delete(`/cart/${userId}/clear`);
      return;
    } catch {
      await delay(80);
      const cart = findOrCreateMockCart(userId);
      cart.items = [];
      cart.voucherCode = undefined;
      cart.updatedAt = new Date().toISOString();
    }
  },
};
