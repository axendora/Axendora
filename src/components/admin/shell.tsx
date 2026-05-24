'use client'

import { useState } from 'react'
import { AdminSidebar } from './sidebar'
import { AdminTopbar } from './topbar'

interface AdminShellProps {
  children: React.ReactNode
  nombre: string
  email: string
  notificationCount: number
}

export function AdminShell({ children, nombre, email, notificationCount }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar
        nombre={nombre}
        email={email}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopbar
          nombre={nombre}
          notificationCount={notificationCount}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
