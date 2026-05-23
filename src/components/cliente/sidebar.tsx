'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Megaphone,
  BarChart2,
  FileText,
  DollarSign,
  Headphones,
  UserCircle,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { href: '/cliente',          label: 'Inicio',        icon: LayoutDashboard, exact: true  },
      { href: '/cliente/servicios', label: 'Mis servicios', icon: Package,         exact: false },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/cliente/campanas',     label: 'Campañas',     icon: Megaphone, exact: false },
      { href: '/cliente/estadisticas', label: 'Estadísticas', icon: BarChart2, exact: false },
      { href: '/cliente/reportes',     label: 'Reportes',     icon: FileText,  exact: false },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { href: '/cliente/facturas',     label: 'Facturas',   icon: DollarSign,  exact: false },
      { href: '/cliente/solicitudes',  label: 'Soporte',    icon: Headphones,  exact: false },
      { href: '/cliente/perfil',       label: 'Mi perfil',  icon: UserCircle,  exact: false },
    ],
  },
]

interface ClienteSidebarProps {
  nombre: string
  email: string
  isOpen: boolean
  onClose: () => void
}

export function ClienteSidebar({ nombre, email, isOpen, onClose }: ClienteSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  const initials = nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-[#27272A] bg-[#121212] transition-transform duration-200 ease-in-out',
          'lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#27272A] px-5">
          <Link href="/cliente" onClick={onClose}>
            <Image
              src="/logo_letras_blancas.png"
              alt="Axendora"
              width={120}
              height={36}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <button
            onClick={onClose}
            className="text-[#71717A] transition-colors hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="scrollbar-hidden flex-1 overflow-y-auto py-4 px-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#71717A]">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact)
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                          active
                            ? 'bg-[#14A8B6]/10 text-[#14A8B6]'
                            : 'text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-white',
                        )}
                      >
                        {active && (
                          <span className="absolute inset-y-1 left-0 w-[3px] rounded-r-full bg-[#14A8B6]" />
                        )}
                        <Icon size={17} />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* CTA button */}
        <div className="px-3 pb-3">
          <Link
            href="/cliente/solicitudes/nueva"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#14A8B6] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#0F8A95] hover:scale-[1.02] active:scale-[0.99]"
          >
            <Sparkles size={16} />
            Solicitar servicio
          </Link>
        </div>

        {/* User footer */}
        <div className="border-t border-[#27272A] p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#14A8B6]/20 text-sm font-bold text-[#14A8B6]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{nombre}</p>
              <span className="inline-block rounded-full bg-[#14A8B6]/15 px-2 py-0.5 text-[10px] font-semibold text-[#14A8B6]">
                Cliente
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#71717A] transition-colors hover:bg-[#1A1A1A] hover:text-white"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
