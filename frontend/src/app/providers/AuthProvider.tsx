import { createContext, useMemo, useState, type PropsWithChildren } from 'react'
import { loginWithApi } from '@/features/auth/api/authService'
import { clearSession, getSession, saveSession } from '@/lib/storage'
import type { SessionUser } from '@/types/auth'
import { Role } from '@/types/role'

interface AuthContextValue {
  user: SessionUser | null
  isAuthenticated: boolean
  login: (usernameOrEmail: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function mapRole(role: 'OWNER' | 'STAFF' | 'CUSTOMER'): Role {
  if (role === 'OWNER') {
    return Role.OWNER
  }
  if (role === 'STAFF') {
    return Role.STAFF
  }
  throw new Error('Tai khoan khong co quyen truy cap trang quan tri')
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(() => getSession())

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: async (usernameOrEmail, password) => {
        const response = await loginWithApi({ usernameOrEmail, password })
        const nextUser: SessionUser = {
          id: response.userId,
          fullName: response.username,
          email: response.email,
          role: mapRole(response.role),
        }
        saveSession(nextUser)
        localStorage.setItem('watchstore.token', response.accessToken)
        setUser(nextUser)
      },
      logout: () => {
        clearSession()
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

