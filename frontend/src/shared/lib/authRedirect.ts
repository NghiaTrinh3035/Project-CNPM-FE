import { ROUTES } from "@/shared/constants/routes";
import type { UserRole } from "@/shared/types/domain";

const AUTH_ROUTE_PREFIX = "/auth";

export const getDefaultRedirectByRole = (role: UserRole) => {
  if (role === "OWNER") return ROUTES.owner.dashboard;
  if (role === "STAFF") return ROUTES.staff.dashboard;
  return ROUTES.home;
};

export const resolvePostLoginRedirect = (role: UserRole, from?: string) => {
  if (!from) return getDefaultRedirectByRole(role);
  // Only allow in-app absolute paths and avoid bouncing back to auth screens.
  if (from.startsWith("/") && !from.startsWith(AUTH_ROUTE_PREFIX)) {
    return from;
  }
  return getDefaultRedirectByRole(role);
};

