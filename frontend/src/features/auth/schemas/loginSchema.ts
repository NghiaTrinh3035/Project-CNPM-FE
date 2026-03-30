import { z } from 'zod'

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Vui long nhap username hoac email'),
  password: z.string().min(6, 'Mat khau toi thieu 6 ky tu'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

