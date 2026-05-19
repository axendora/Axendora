'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './sidebar'

interface DashboardShellProps {
  children: React.ReactNode
  nombre: string
  email: string
}

export function DashboardShell({ children, nombre, email }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        nombre={nombre}
        email={email}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-16 shrink-0 items-center border-b border-border bg-card px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="mr-4 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <span className="text-sm font-semibold">Panel de cliente</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
