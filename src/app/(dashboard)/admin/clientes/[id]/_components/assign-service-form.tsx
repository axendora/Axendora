'use client'

import { useState, useTransition, useEffect } from 'react'
import { Plus, CalendarClock } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { assignServiceAction } from '../actions'

const INPUT =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'

interface AvailableService {
  id: string
  nombre: string
  duracion_dias: number | null
}

interface AssignServiceFormProps {
  clientId: string
  availableServices: AvailableService[]
}

function toLocalDatetime(d: Date) {
  // Format Date → "YYYY-MM-DDTHH:MM" for datetime-local input
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return toLocalDatetime(d)
}

export function AssignServiceForm({ clientId, availableServices }: AssignServiceFormProps) {
  const [open, setOpen]             = useState(false)
  const [serviceId, setServiceId]   = useState('')
  const [duracion, setDuracion]     = useState<string>('')
  const [fechaInicio, setFechaInicio] = useState(toLocalDatetime(new Date()))
  const [fechaFin, setFechaFin]     = useState('')
  const [notas, setNotas]           = useState('')
  const [error, setError]           = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // When service changes → fill default duration and recalculate fechaFin
  useEffect(() => {
    const svc = availableServices.find((s) => s.id === serviceId)
    if (svc?.duracion_dias) {
      const d = String(svc.duracion_dias)
      setDuracion(d)
      if (fechaInicio) setFechaFin(addDays(fechaInicio, svc.duracion_dias))
    }
  }, [serviceId]) // eslint-disable-line react-hooks/exhaustive-deps

  // When fechaInicio or duracion changes → recalculate fechaFin
  useEffect(() => {
    const dias = parseInt(duracion, 10)
    if (!isNaN(dias) && dias > 0 && fechaInicio) {
      setFechaFin(addDays(fechaInicio, dias))
    }
  }, [fechaInicio, duracion])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!serviceId) { setError('Selecciona un servicio'); return }
    setError(null)
    startTransition(async () => {
      try {
        await assignServiceAction(clientId, {
          service_id:   serviceId,
          fecha_inicio: fechaInicio ? new Date(fechaInicio).toISOString() : undefined,
          fecha_fin:    fechaFin    ? new Date(fechaFin).toISOString()    : undefined,
          notas:        notas || undefined,
        })
        setServiceId(''); setDuracion(''); setFechaInicio(toLocalDatetime(new Date()))
        setFechaFin(''); setNotas(''); setOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al asignar servicio')
      }
    })
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'gap-1.5')}>
        <Plus size={14} />
        Asignar servicio
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <CalendarClock size={16} className="text-primary" />
        <h3 className="text-sm font-semibold">Asignar nuevo servicio</h3>
      </div>

      {error && <p className="rounded-lg bg-error/10 px-3 py-2 text-xs text-error">{error}</p>}

      {/* Service selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Servicio <span className="text-error">*</span></label>
        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={INPUT}>
          <option value="">Selecciona un servicio...</option>
          {availableServices.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}{s.duracion_dias ? ` (${s.duracion_dias} días)` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Dates row */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Fecha y hora de inicio</label>
          <input
            type="datetime-local"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className={INPUT}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Duración
            <span className="ml-1 text-muted-foreground/60">(días)</span>
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={duracion}
            onChange={(e) => setDuracion(e.target.value)}
            placeholder="30"
            className={INPUT}
          />
        </div>
      </div>

      {/* Fecha fin */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Fecha y hora de vencimiento
          <span className="ml-1 text-muted-foreground/60">(auto-calculada)</span>
        </label>
        <input
          type="datetime-local"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className={INPUT}
        />
      </div>

      {/* Notas */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Notas internas</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          placeholder="Detalles, acuerdos, observaciones..."
          className={cn(INPUT, 'resize-none')}
        />
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className={cn(buttonVariants({ size: 'sm' }))}>
          {isPending ? 'Guardando...' : 'Asignar'}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }))}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
