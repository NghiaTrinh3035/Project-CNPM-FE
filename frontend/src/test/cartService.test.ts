import { beforeEach, describe, expect, it } from "vitest";

import { resetDb } from "@/mocks/data/database";
import { cartService } from "@/services/cartService";

describe("cartService", () => {
  beforeEach(() => {
    resetDb();
  });

  it("thêm sản phẩm vào giỏ hàng thành công", async () => {
    const cart = await cartService.addItem("u-cus-001", "p-004", 1);
    const item = cart.items.find((value) => value.productId === "p-004");
    expect(item).toBeTruthy();
    expect(item?.quantity).toBeGreaterThan(0);
  });

  it("không cho vượt quá tồn kho", async () => {
    await expect(cartService.addItem("u-cus-001", "p-001", 999)).rejects.toThrow("Số lượng vượt quá tồn kho.");
  });
});
