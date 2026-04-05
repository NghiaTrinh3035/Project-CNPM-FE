import axios from "axios";

import axiosClient from "@/api/axiosClient";
import { getDb } from "@/mocks/data/database";
import { mapBackendCart } from "@/services/api/backendMappers";
import { delay } from "@/services/mock/delay";
import type { Cart, CartItem } from "@/shared/types/domain";

const CART_VOUCHER_STORAGE_KEY = "chrono-cart-voucher-map";
const CART_VOUCHER_DISCOUNT_STORAGE_KEY = "chrono-cart-voucher-discount-map";
const CART_NOTE_STORAGE_KEY = "chrono-cart-note-map";
const CART_SELECTED_ITEMS_STORAGE_KEY = "chrono-cart-selected-items-map";

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

const readNoteMap = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(CART_NOTE_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const readSelectedItemsMap = (): Record<string, string[]> => {
  try {
    const raw = localStorage.getItem(CART_SELECTED_ITEMS_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const result: Record<string, string[]> = {};
    Object.entries(parsed).forEach(([userId, value]) => {
      if (!Array.isArray(value)) {
        return;
      }
      result[userId] = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    });
    return result;
  } catch {
    return {};
  }
};

const voucherByUser: Record<string, string> = readVoucherMap();

const readVoucherDiscountMap = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(CART_VOUCHER_DISCOUNT_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const result: Record<string, number> = {};
    Object.entries(parsed).forEach(([userId, value]) => {
      const numeric = Number(value);
      if (Number.isFinite(numeric) && numeric > 0) {
        result[userId] = numeric;
      }
    });
    return result;
  } catch {
    return {};
  }
};

const voucherDiscountByUser: Record<string, number> = readVoucherDiscountMap();
const noteByUser: Record<string, string> = readNoteMap();
const selectedItemsByUser: Record<string, string[]> = readSelectedItemsMap();

const persistVoucherMap = () => {
  try {
    localStorage.setItem(CART_VOUCHER_STORAGE_KEY, JSON.stringify(voucherByUser));
  } catch {
    // Ignore storage issues and keep runtime map.
  }
};

const persistVoucherDiscountMap = () => {
  try {
    localStorage.setItem(CART_VOUCHER_DISCOUNT_STORAGE_KEY, JSON.stringify(voucherDiscountByUser));
  } catch {
    // Ignore storage issues and keep runtime map.
  }
};

const persistNoteMap = () => {
  try {
    localStorage.setItem(CART_NOTE_STORAGE_KEY, JSON.stringify(noteByUser));
  } catch {
    // Ignore storage issues and keep runtime map.
  }
};

const persistSelectedItemsMap = () => {
  try {
    localStorage.setItem(CART_SELECTED_ITEMS_STORAGE_KEY, JSON.stringify(selectedItemsByUser));
  } catch {
    // Ignore storage issues and keep runtime map.
  }
};

const setVoucherForUser = (userId: string, voucherCode?: string, discountPercent?: number) => {
  if (!voucherCode) {
    delete voucherByUser[userId];
    delete voucherDiscountByUser[userId];
  } else {
    voucherByUser[userId] = voucherCode;
    if (discountPercent && Number.isFinite(discountPercent) && discountPercent > 0) {
      voucherDiscountByUser[userId] = discountPercent;
    } else {
      delete voucherDiscountByUser[userId];
    }
  }
  persistVoucherMap();
  persistVoucherDiscountMap();
};

const getVoucherForUser = (userId: string) => voucherByUser[userId];
const getVoucherDiscountForUser = (userId: string) => voucherDiscountByUser[userId];

const setNoteForUser = (userId: string, note: string) => {
  const normalized = note.trim();
  if (!normalized) {
    delete noteByUser[userId];
  } else {
    noteByUser[userId] = normalized;
  }
  persistNoteMap();
};

const getNoteForUser = (userId: string) => noteByUser[userId] ?? "";

const setSelectedItemsForUser = (userId: string, itemIds: string[]) => {
  const normalized = Array.from(
    new Set(
      itemIds
        .map((itemId) => itemId.trim())
        .filter((itemId) => itemId.length > 0),
    ),
  );

  if (normalized.length === 0) {
    delete selectedItemsByUser[userId];
  } else {
    selectedItemsByUser[userId] = normalized;
  }
  persistSelectedItemsMap();
};

const getSelectedItemsForUser = (userId: string) => selectedItemsByUser[userId] ?? [];

const findOrCreateMockCart = (userId: string): Cart => {
  const db = getDb();
  let cart = db.carts.find((item) => item.userId === userId);
  if (!cart) {
    cart = {
      id: `c-${Date.now()}`,
      userId,
      items: [],
      voucherCode: getVoucherForUser(userId),
      voucherDiscountPercent: getVoucherDiscountForUser(userId),
      updatedAt: new Date().toISOString(),
    };
    db.carts.push(cart);
  }

  cart.voucherCode = getVoucherForUser(userId);
  cart.voucherDiscountPercent = getVoucherDiscountForUser(userId);
  return cart;
};

const getCartFromApi = async (userId: string): Promise<Cart> => {
  const { data } = await axiosClient.get(`/cart/${userId}`);
  return mapBackendCart(data, {
    userId,
    voucherCode: getVoucherForUser(userId),
    voucherDiscountPercent: getVoucherDiscountForUser(userId),
  });
};

const getCartSafe = async (userId: string): Promise<Cart> => {
  try {
    return await getCartFromApi(userId);
  } catch (error) {
    if (!shouldFallbackToMock(error)) {
      throw new Error(toErrorMessage(error, "Không thể tải giỏ hàng."));
    }
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
  cart.voucherDiscountPercent = getVoucherDiscountForUser(userId);
  return structuredClone(cart);
};

const resolveProductId = async (userId: string, itemId: string) => {
  const cart = await getCartSafe(userId);
  return cart.items.find((item) => item.id === itemId)?.productId ?? itemId;
};

const toErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
      return data.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

const shouldFallbackToMock = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return true;
  }
  const status = error.response?.status;
  if (status === undefined) {
    return true;
  }
  if (status === 400 || status === 401 || status === 403 || status === 404 || status === 409) {
    return false;
  }
  return status === 405 || status >= 500;
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
      return mapBackendCart(data, {
        userId,
        voucherCode: getVoucherForUser(userId),
        voucherDiscountPercent: getVoucherDiscountForUser(userId),
      });
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw new Error(toErrorMessage(error, "Không thể thêm sản phẩm vào giỏ hàng."));
      }

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
      cart.voucherDiscountPercent = getVoucherDiscountForUser(userId);
      return structuredClone(cart);
    }
  },

  async updateQuantity(userId: string, itemId: string, quantity: number): Promise<Cart> {
    const productId = await resolveProductId(userId, itemId);
    try {
      const { data } = await axiosClient.put(`/cart/${userId}/items/${productId}`, null, {
        params: { quantity },
      });
      return mapBackendCart(data, {
        userId,
        voucherCode: getVoucherForUser(userId),
        voucherDiscountPercent: getVoucherDiscountForUser(userId),
      });
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw new Error(toErrorMessage(error, "Không thể cập nhật số lượng sản phẩm."));
      }

      await delay(120);
      return updateMockItemByProduct(userId, productId, quantity);
    }
  },

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const productId = await resolveProductId(userId, itemId);
    try {
      const { data } = await axiosClient.delete(`/cart/${userId}/items/${productId}`);
      return mapBackendCart(data, {
        userId,
        voucherCode: getVoucherForUser(userId),
        voucherDiscountPercent: getVoucherDiscountForUser(userId),
      });
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw new Error(toErrorMessage(error, "Không thể xóa sản phẩm khỏi giỏ hàng."));
      }

      await delay(100);
      return updateMockItemByProduct(userId, productId, 0);
    }
  },

  async applyVoucher(userId: string, voucherCode: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    let minOrderAmount = 0;
    let code = voucherCode.toUpperCase();
    let discountPercent = 0;
    try {
      const { data } = await axiosClient.post(`/vouchers/apply/${encodeURIComponent(voucherCode)}`);
      minOrderAmount = Number((data as { minOrderAmount?: number }).minOrderAmount ?? 0);
      code = ((data as { voucherCode?: string; code?: string }).voucherCode ?? (data as { code?: string }).code ?? voucherCode).toUpperCase();
      discountPercent = Number((data as { discountPercent?: number }).discountPercent ?? 0);
    } catch (error) {
      throw error instanceof Error ? error : new Error("Không thể áp dụng voucher. Vui lòng thử lại.");
    }

    if (subtotal < minOrderAmount) {
      throw new Error("Đơn hàng chưa đạt mức áp dụng voucher.");
    }

    if (!Number.isFinite(discountPercent) || discountPercent <= 0) {
      throw new Error("Voucher không hợp lệ.");
    }

    setVoucherForUser(userId, code, discountPercent);
    return { ...cart, voucherCode: code, voucherDiscountPercent: discountPercent, updatedAt: new Date().toISOString() };
  },

  async clearCart(userId: string, options?: { restock?: boolean }) {
    setVoucherForUser(userId, undefined);
    setNoteForUser(userId, "");
    try {
      await axiosClient.delete(`/cart/${userId}/clear`, {
        params: { restock: options?.restock ?? true },
      });
      return;
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw new Error(toErrorMessage(error, "Không thể làm trống giỏ hàng."));
      }

      await delay(80);
      const cart = findOrCreateMockCart(userId);
      cart.items = [];
      cart.voucherCode = undefined;
      cart.voucherDiscountPercent = undefined;
      cart.updatedAt = new Date().toISOString();
    }
  },

  getCheckoutNote(userId: string) {
    return getNoteForUser(userId);
  },

  setCheckoutNote(userId: string, note: string) {
    setNoteForUser(userId, note);
  },

  getSelectedItemIds(userId: string) {
    return getSelectedItemsForUser(userId);
  },

  setSelectedItemIds(userId: string, itemIds: string[]) {
    setSelectedItemsForUser(userId, itemIds);
  },

  clearSelectedItemIds(userId: string) {
    setSelectedItemsForUser(userId, []);
  },
};
