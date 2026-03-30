import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/routes/paths'
import type { Role } from '@/types/role'

interface RouteGuardProps {
  allowedRoles?: Role[]
}

export function RouteGuard({ allowedRoles }: RouteGuardProps) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.login} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.forbidden} replace />
  }

  return <Outlet />
}

