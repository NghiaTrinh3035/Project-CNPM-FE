import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-app-bg">
      <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="md:pl-[250px]">
        <AppHeader onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="p-5 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

