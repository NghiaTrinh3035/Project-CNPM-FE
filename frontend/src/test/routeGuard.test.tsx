import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RouteGuard } from "@/app/router/RouteGuard";
import { ROUTES } from "@/shared/constants/routes";
import { useSession } from "@/shared/hooks/useSession";
vi.mock("@/shared/hooks/useSession", () => ({
  useSession: vi.fn(),
}));
const mockedUseSession = vi.mocked(useSession);
const renderWithRouter = (initialPath: string, guard: ReactNode) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path={ROUTES.auth.login} element={<div>login-screen</div>} />
        <Route path={ROUTES.errors.forbidden} element={<div>forbidden-screen</div>} />
        <Route path="*" element={guard} />
      </Routes>
    </MemoryRouter>,
  );
describe("RouteGuard", () => {
  it("redirect đến login khi chưa đăng nhập", () => {
    mockedUseSession.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    });
    renderWithRouter(
      "/staff/orders/123?tab=pending#anchor",
      <RouteGuard>
        <div>protected-screen</div>
      </RouteGuard>,
    );
    expect(screen.getByText("login-screen")).toBeInTheDocument();
  });
  it("redirect đến forbidden khi role không hợp lệ", () => {
    mockedUseSession.mockReturnValue({
      isAuthenticated: true,
      logout: vi.fn(),
      user: {
        id: "u-1",
        fullName: "Customer",
        username: "customer",
        email: "customer@example.com",
        phone: "",
        role: "CUSTOMER",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    });
    renderWithRouter(
      ROUTES.owner.dashboard,
      <RouteGuard allowRoles={["OWNER"]}>
        <div>protected-screen</div>
      </RouteGuard>,
    );
    expect(screen.getByText("forbidden-screen")).toBeInTheDocument();
  });
  it("render children khi user có quyền", () => {
    mockedUseSession.mockReturnValue({
      isAuthenticated: true,
      logout: vi.fn(),
      user: {
        id: "u-2",
        fullName: "Owner",
        username: "owner",
        email: "owner@example.com",
        phone: "",
        role: "OWNER",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    });
    renderWithRouter(
      ROUTES.owner.dashboard,
      <RouteGuard allowRoles={["OWNER"]}>
        <div>protected-screen</div>
      </RouteGuard>,
    );
    expect(screen.getByText("protected-screen")).toBeInTheDocument();
  });
});
