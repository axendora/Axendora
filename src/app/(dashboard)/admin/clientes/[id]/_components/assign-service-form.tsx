'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { assignServiceAction } from '../actions'

interface AvailableService {
  id: string
  nombre: string
}

interface AssignServiceFormProps {
  clientId: string
  availableServices: AvailableService[]
}

export function AssignServiceForm({ clientId, availableServices }: AssignServiceFormProps) {
  const [open, setOpen] = useState(false)
  const [serviceId, setServiceId] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!serviceId) {
      setError('Selecciona un servicio')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        await assignServiceAction(clientId, {
          service_id: serviceId,
          fecha_inicio: fechaInicio || undefined,
          notas: notas || undefined,
        })
        setServiceId('')
        setFechaInicio('')
        setNotas('')
        setOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al asignar servicio')
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'gap-1.5')}
      >
        <Plus size={14} />
        Asignar servicio
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold">Asignar nuevo servicio</h3>

      {error && <p className="text-xs text-error">{error}</p>}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Servicio *</label>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Selecciona un servicio...</option>
          {availableServices.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Fecha de inicio</label>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Notas internas</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          placeholder="Detalles, acuerdos, observaciones..."
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className={cn(buttonVariants({ size: 'sm' }))}
        >
          {isPending ? 'Guardando...' : 'Asignar'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }))}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
