'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const THEMES = [
  { value: 'light',  icon: Sun,     label: 'Claro',   description: 'Interfaz en modo claro.' },
  { value: 'dark',   icon: Moon,    label: 'Oscuro',  description: 'Interfaz en modo oscuro.'  },
  { value: 'system', icon: Monitor, label: 'Sistema', description: 'Sigue las preferencias del sistema operativo.' },
] as const

export function AparienciaForm() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="rounded-xl border border-[#27272A] bg-[#121212] p-6 animate-pulse">
        <div className="h-4 w-32 bg-[#27272A] rounded" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-[#27272A]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#27272A] bg-[#121212] p-6 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Tema de la interfaz</h3>
          <p className="mt-0.5 text-xs text-[#71717A]">
            Selecciona cómo se mostrará el panel. El cambio se aplica de inmediato.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {THEMES.map(({ value, icon: Icon, label, description }) => {
            const isActive = theme === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  'relative flex flex-col items-center gap-3 rounded-xl border p-5 text-left transition-all duration-150',
                  isActive
                    ? 'border-[#14A8B6] bg-[#14A8B6]/10'
                    : 'border-[#27272A] hover:border-[#52525B] hover:bg-[#1A1A1A]',
                )}
              >
                {isActive && (
                  <CheckCircle2
                    size={14}
                    className="absolute right-3 top-3 text-[#14A8B6]"
                  />
                )}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    isActive ? 'bg-[#14A8B6]/20 text-[#14A8B6]' : 'bg-[#27272A] text-[#71717A]',
                  )}
                >
                  <Icon size={20} />
                </div>
                <div className="text-center">
                  <p className={cn('text-sm font-semibold', isActive ? 'text-[#14A8B6]' : 'text-white')}>
                    {label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#71717A]">{description}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Active indicator */}
        <p className="text-xs text-[#52525B]">
          Modo activo:{' '}
          <span className="font-medium text-[#71717A] capitalize">{resolvedTheme}</span>
        </p>
      </div>
    </div>
  )
}
