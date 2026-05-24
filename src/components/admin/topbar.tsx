'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Bell, Search, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AdminTopbarProps {
  nombre: string
  notificationCount: number
  onMenuClick: () => void
}

export function AdminTopbar({ nombre, notificationCount, onMenuClick }: AdminTopbarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

      {/* Search */}
      <div className="flex max-w-xs flex-1">
        <div className="relative w-full">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
          />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full rounded-lg border border-border bg-secondary py-2 pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground/60 outline-none transition-colors focus:border-primary/50"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
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
            <span className="hidden text-foreground sm:block">{nombre.split(' ')[0]}</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-border bg-secondary py-1 shadow-xl shadow-black/40">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  router.push('/admin/configuracion')
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <User size={14} />
                Mi perfil
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  router.push('/admin/configuracion')
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Settings size={14} />
                Configuración
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
