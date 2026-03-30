import { Bell, Menu } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { Button } from '@/components/ui/Button'

interface AppHeaderProps {
  onToggleSidebar: () => void
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-app-border bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button className="md:hidden" onClick={onToggleSidebar} variant="ghost">
          <Menu className="h-5 w-5" />
        </Button>
        <SearchInput placeholder="Tim kiem..." />
      </div>
      <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100" type="button">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
      </button>
    </header>
  )
}

