'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Building2, UserCircle, Bell, Palette } from 'lucide-react'
import type { AgencySettings } from '@/types/database.types'
import { AgenciaForm } from './agencia-form'
import { CuentaForm } from './cuenta-form'
import { NotificacionesForm } from './notificaciones-form'
import { AparienciaForm } from './apariencia-form'

const TABS = [
  { id: 'agencia',        label: 'Agencia',       icon: Building2  },
  { id: 'cuenta',         label: 'Cuenta',        icon: UserCircle },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell       },
  { id: 'apariencia',     label: 'Apariencia',    icon: Palette    },
] as const

type TabId = (typeof TABS)[number]['id']

interface Props {
  settings: AgencySettings | null
  settingsId: string | null
  userId: string
  nombre: string
  email: string
}

export function ConfigTabs({ settings, settingsId, userId, nombre, email }: Props) {
  const [active, setActive] = useState<TabId>('agencia')

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#14A8B6]/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {active === 'agencia'        && <AgenciaForm       settings={settings} settingsId={settingsId} />}
      {active === 'cuenta'         && <CuentaForm        userId={userId} nombre={nombre} email={email} />}
      {active === 'notificaciones' && <NotificacionesForm settings={settings} settingsId={settingsId} />}
      {active === 'apariencia'     && <AparienciaForm />}
    </div>
  )
}
