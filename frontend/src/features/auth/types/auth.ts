export interface LoginRequest {
  usernameOrEmail: string
  password: string
}

export type AuthApiRole = 'OWNER' | 'STAFF' | 'CUSTOMER'

export interface LoginResponse {
  message: string
  userId: string
  username: string
  email: string
  role: AuthApiRole
  tokenType: string
  accessToken: string
  expiresInSeconds: number
}

