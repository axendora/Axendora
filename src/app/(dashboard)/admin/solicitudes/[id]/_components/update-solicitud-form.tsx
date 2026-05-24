'use client'

import { useState, useTransition } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { updateSolicitudAction } from '../actions'
import type { SolicitudEstado, SolicitudPrioridad } from '@/types/database.types'

const estadoOptions: { value: SolicitudEstado; label: string }[] = [
  { value: 'abierta',    label: 'Abierta' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'resuelta',   label: 'Resuelta' },
  { value: 'cerrada',    label: 'Cerrada' },
]

const prioridadOptions: { value: SolicitudPrioridad; label: string }[] = [
  { value: 'baja',  label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta',  label: 'Alta' },
]

interface UpdateSolicitudFormProps {
  id: string
  currentEstado: SolicitudEstado
  currentPrioridad: SolicitudPrioridad
}

export function UpdateSolicitudForm({ id, currentEstado, currentPrioridad }: UpdateSolicitudFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await updateSolicitudAction(formData)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Actualizar solicitud</h3>
      <input type="hidden" name="id" value={id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Estado</label>
          <select
            name="estado"
            defaultValue={currentEstado}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {estadoOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Prioridad</label>
          <select
            name="prioridad"
            defaultValue={currentPrioridad}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {prioridadOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={cn(buttonVariants({ size: 'sm' }))}
      >
        {isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
