import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/loginSchema'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/routes/paths'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setSubmitError(null)
      await login(values.usernameOrEmail, values.password)
      navigate(ROUTES.dashboard)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Dang nhap that bai. Vui long thu lai.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4">
      <div className="w-full max-w-md rounded-xl border border-app-border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Dang nhap he thong</h1>
        <p className="mt-1 text-sm text-slate-500">Nhap tai khoan backend de dang nhap</p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <FormField error={errors.usernameOrEmail?.message} label="Username hoac Email" required>
            <input className="h-11 w-full rounded-lg border border-app-border px-3 text-sm" {...register('usernameOrEmail')} />
          </FormField>

          <FormField error={errors.password?.message} label="Mat khau" required>
            <input
              className="h-11 w-full rounded-lg border border-app-border px-3 text-sm"
              type="password"
              {...register('password')}
            />
          </FormField>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Dang xu ly...' : 'Dang nhap'}
          </Button>
        </form>
      </div>
    </div>
  )
}

