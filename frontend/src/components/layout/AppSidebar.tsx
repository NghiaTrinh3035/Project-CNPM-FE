import { Watch } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { MENU_ITEMS } from '@/routes/menuConfig'
import { cn } from '@/utils/cn'
import { useAuth } from '@/hooks/useAuth'

interface AppSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const { user } = useAuth()
  const role = user?.role

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-[250px] border-r border-app-border bg-white transition-transform md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="border-b border-app-border px-4 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Watch className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-slate-900">Watch Store</p>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {MENU_ITEMS.filter((item) => role && item.allowedRoles.includes(role)).map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition',
                    isActive && 'bg-blue-50 text-blue-600',
                  )
                }
                key={item.to}
                onClick={onClose}
                to={item.to}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="absolute bottom-3 left-3 right-3 rounded-lg border border-app-border bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-800">{user?.fullName ?? 'Guest'}</p>
          <p className="text-xs text-slate-500">{user?.email ?? ''}</p>
        </div>
      </aside>
      {isOpen && <button className="fixed inset-0 z-20 bg-slate-900/40 md:hidden" onClick={onClose} type="button" />}
    </>
  )
}

