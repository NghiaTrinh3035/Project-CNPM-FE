import { describe, expect, it } from "vitest";
import { ROUTES } from "@/shared/constants/routes";
import { getDefaultRedirectByRole, resolvePostLoginRedirect } from "@/shared/lib/authRedirect";
describe("authRedirect", () => {
  it("trả về dashboard mặc định theo role", () => {
    expect(getDefaultRedirectByRole("OWNER")).toBe(ROUTES.owner.dashboard);
    expect(getDefaultRedirectByRole("STAFF")).toBe(ROUTES.staff.dashboard);
    expect(getDefaultRedirectByRole("CUSTOMER")).toBe(ROUTES.home);
  });
  it("ưu tiên đường dẫn trước đăng nhập nếu hợp lệ", () => {
    expect(resolvePostLoginRedirect("STAFF", "/staff/orders?tab=pending#list")).toBe("/staff/orders?tab=pending#list");
  });
  it("không redirect về auth routes", () => {
    expect(resolvePostLoginRedirect("OWNER", ROUTES.auth.login)).toBe(ROUTES.owner.dashboard);
    expect(resolvePostLoginRedirect("CUSTOMER", "/auth/register")).toBe(ROUTES.home);
  });
});
