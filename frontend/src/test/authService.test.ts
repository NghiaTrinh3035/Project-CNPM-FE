import { describe, expect, it } from "vitest";

import { authService } from "@/services/authService";

describe("authService", () => {
  it("đăng nhập thành công với demo account", async () => {
    const session = await authService.login({
      usernameOrEmail: "customer@example.com",
      password: "Demo@123",
    });
    expect(session.user.email).toBe("customer@example.com");
    expect(session.token).toContain("mock-token");
  });

  it("trả lỗi khi sai mật khẩu", async () => {
    await expect(
      authService.login({
        usernameOrEmail: "customer@example.com",
        password: "wrong-password",
      }),
    ).rejects.toThrow("Email hoặc mật khẩu không chính xác.");
  });
});
