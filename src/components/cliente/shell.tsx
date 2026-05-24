'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Megaphone, Receipt, MessageSquare, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ClienteSidebar } from './sidebar'
import { ClienteTopbar } from './topbar'

const BOTTOM_NAV = [
  { href: '/cliente',             label: 'Inicio',    icon: LayoutDashboard, exact: true  },
  { href: '/cliente/campanas',    label: 'Campañas',  icon: Megaphone,       exact: false },
  { href: '/cliente/facturas',    label: 'Facturas',  icon: Receipt,         exact: false },
  { href: '/cliente/solicitudes', label: 'Solicitudes', icon: MessageSquare, exact: false },
  { href: '/cliente/solicitudes/nueva', label: 'Solicitar', icon: Sparkles,  exact: true  },
]

function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-[#27272A] bg-[#0A0A0A] px-2 lg:hidden">
      {BOTTOM_NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        const Icon = item.icon
        const isCTA = item.href === '/cliente/solicitudes/nueva'
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-[10px] font-medium transition-colors',
              isCTA
                ? 'text-[#14A8B6]'
                : active
                  ? 'text-[#14A8B6]'
                  : 'text-[#71717A] hover:text-white',
            )}
          >
            <Icon size={20} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

interface ClienteShellProps {
  children: React.ReactNode
  nombre: string
  email: string
  notificationCount: number
}

export function ClienteShell({ children, nombre, email, notificationCount }: ClienteShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0A]">
      <ClienteSidebar
        nombre={nombre}
        email={email}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ClienteTopbar
          nombre={nombre}
          notificationCount={notificationCount}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
