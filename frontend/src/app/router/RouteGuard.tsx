import { Navigate, useLocation } from "react-router-dom";

import { ROUTES } from "@/shared/constants/routes";
import { useSession } from "@/shared/hooks/useSession";
import type { UserRole } from "@/shared/types/domain";

interface RouteGuardProps {
  children: React.ReactNode;
  allowRoles?: UserRole[];
  requireAuth?: boolean;
}

export const RouteGuard = ({ children, allowRoles, requireAuth = true }: RouteGuardProps) => {
  const location = useLocation();
  const { isAuthenticated, user } = useSession();

  if (!requireAuth) {
    return <>{children}</>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.auth.login} replace state={{ from: location.pathname }} />;
  }

  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to={ROUTES.errors.forbidden} replace />;
  }

  return <>{children}</>;
};
