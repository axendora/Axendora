'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Bell, ChevronDown, UserCircle, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ClienteTopbarProps {
  nombre: string
  notificationCount: number
  onMenuClick: () => void
}

export function ClienteTopbar({ nombre, notificationCount, onMenuClick }: ClienteTopbarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const firstName = nombre.split(' ')[0]
  const initials = nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="text-muted-foreground transition-colors hover:text-foreground lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      {/* Greeting */}
      <div className="flex-1">
        <span className="text-sm font-medium text-foreground">
          Hola, {firstName} 👋
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:text-foreground">
          <Bell size={17} />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-foreground">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm transition-colors hover:border-[#14A8B6]/30"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#14A8B6]/20 text-xs font-bold text-primary">
              {initials}
            </div>
            <span className="hidden text-foreground sm:block">{firstName}</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-border bg-secondary py-1 shadow-xl shadow-black/40">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  router.push('/cliente/perfil')
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <UserCircle size={14} />
                Mi perfil
              </button>
              <div className="my-1 border-t border-border" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[#EF4444] transition-colors hover:bg-muted"
              >
                <LogOut size={14} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
