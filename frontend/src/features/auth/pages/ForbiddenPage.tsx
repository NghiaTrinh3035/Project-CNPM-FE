import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4">
      <div className="w-full max-w-md rounded-xl border border-app-border bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">403 - Khong du quyen</h1>
        <p className="mt-3 text-sm text-slate-500">Ban khong co quyen truy cap trang nay.</p>
        <Link
          className="mt-6 inline-flex rounded-lg bg-app-primary px-4 py-2 text-sm font-semibold text-white"
          to={ROUTES.dashboard}
        >
          Ve trang chu
        </Link>
      </div>
    </div>
  )
}

