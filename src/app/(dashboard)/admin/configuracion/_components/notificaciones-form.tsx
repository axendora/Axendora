'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { updateNotificacionesAction } from '../actions'
import type { AgencySettings } from '@/types/database.types'

interface Props {
  settings: AgencySettings | null
  settingsId: string | null
}

interface NotifItem {
  key: keyof Pick<
    AgencySettings,
    | 'notif_bienvenida'
    | 'notif_solicitud_aprobada'
    | 'notif_solicitud_rechazada'
    | 'notif_factura_emitida'
    | 'notif_campana_iniciada'
  >
  label: string
  description: string
}

const NOTIFICACIONES: NotifItem[] = [
  {
    key: 'notif_bienvenida',
    label: 'Email de bienvenida',
    description: 'Se envía al cliente cuando su cuenta es creada por el admin.',
  },
  {
    key: 'notif_solicitud_aprobada',
    label: 'Solicitud aprobada',
    description: 'Notifica al cliente cuando una solicitud es aprobada.',
  },
  {
    key: 'notif_solicitud_rechazada',
    label: 'Solicitud rechazada',
    description: 'Notifica al cliente cuando una solicitud es rechazada.',
  },
  {
    key: 'notif_factura_emitida',
    label: 'Factura emitida',
    description: 'Se envía al cliente cuando se genera una nueva factura.',
  },
  {
    key: 'notif_campana_iniciada',
    label: 'Campaña iniciada',
    description: 'Notifica al cliente cuando se activa una campaña publicitaria.',
  },
]

export function NotificacionesForm({ settings, settingsId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateNotificacionesAction(formData)
      if (res.error) setError(res.error)
      else setSuccess(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="settings_id" value={settingsId ?? ''} />
      {error && (
        <p className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2.5 text-sm text-[#EF4444]">
          {error}
        </p>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-2.5 text-sm text-[#10B981]">
          <CheckCircle size={15} />
          Preferencias de notificaciones guardadas.
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14A8B6]/10">
            <Mail size={15} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Emails automáticos a clientes</p>
            <p className="text-xs text-muted-foreground">Activa o desactiva cada tipo de notificación.</p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {NOTIFICACIONES.map((notif) => {
            const defaultChecked = settings ? settings[notif.key] : true
            return (
              <label
                key={notif.key}
                htmlFor={notif.key}
                className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-secondary"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{notif.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{notif.description}</p>
                </div>
                <Toggle id={notif.key} name={notif.key} defaultChecked={defaultChecked} />
              </label>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="h-9 min-w-[160px]">
          {isPending ? 'Guardando...' : 'Guardar preferencias'}
        </Button>
      </div>
    </form>
  )
}

function Toggle({
  id,
  name,
  defaultChecked,
}: {
  id: string
  name: string
  defaultChecked: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <div className="relative shrink-0">
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        value="on"
        className="sr-only"
      />
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked((v) => !v)}
        className={cn(
          'relative h-5 w-9 cursor-pointer rounded-full transition-colors duration-200',
          checked ? 'bg-primary' : 'bg-muted',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}
