import { Role } from '@/types/role'

export interface SessionUser {
  id: string
  fullName: string
  email: string
  role: Role
}

