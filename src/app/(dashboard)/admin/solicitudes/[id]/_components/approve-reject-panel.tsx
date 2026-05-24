'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { aprobarSolicitudAction, rechazarSolicitudAction } from '../actions'
import type { PlanCategoria, TipoPrecio } from '@/types/database.types'

type PlanOption = {
  id: string
  nombre: string
  categoria: PlanCategoria
  tipo_precio: TipoPrecio
  precio_usd: number | null
  precio_cop: number | null
  duracion_dias: number | null
}

const categoriaLabel: Record<PlanCategoria, string> = {
  marketing: 'Marketing',
  diseno: 'Diseño',
  web: 'Web',
}

const INPUT =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'

interface ApproveRejectPanelProps {
  solicitudId: string
  preselectedPlanId: string | null
  planes: PlanOption[]
}

export function ApproveRejectPanel({
  solicitudId,
  preselectedPlanId,
  planes,
}: ApproveRejectPanelProps) {
  const initialId   = preselectedPlanId ?? (planes[0]?.id ?? '')
  const initialPlan = planes.find((p) => p.id === initialId)

  const [mode, setMode]               = useState<'aprobar' | 'rechazar'>('aprobar')
  const [selectedId, setSelectedId]   = useState(initialId)
  const [duracion, setDuracion]       = useState(
    initialPlan?.duracion_dias ? String(initialPlan.duracion_dias) : '',
  )
  const [error, setError]             = useState<string | null>(null)
  const [isPending, startTransition]  = useTransition()

  function onPlanChange(id: string) {
    setSelectedId(id)
    const plan = planes.find((p) => p.id === id)
    setDuracion(plan?.duracion_dias ? String(plan.duracion_dias) : '')
  }

  function switchMode(next: 'aprobar' | 'rechazar') {
    setMode(next)
    setError(null)
  }

  function handleAprobar(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await aprobarSolicitudAction(formData)
      if (res?.error) setError(res.error)
    })
  }

  function handleRechazar(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await rechazarSolicitudAction(formData)
      if (res?.error) setError(res.error)
    })
  }

  const fechaFin =
    duracion && !isNaN(parseInt(duracion))
      ? new Date(Date.now() + parseInt(duracion) * 86_400_000).toLocaleDateString('es', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : null

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold">Decisión sobre la solicitud</h3>

      {/* Toggle aprobar / rechazar */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => switchMode('aprobar')}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            mode === 'aprobar'
              ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          <CheckCircle size={13} />
          Aprobar
        </button>
        <button
          type="button"
          onClick={() => switchMode('rechazar')}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            mode === 'rechazar'
              ? 'border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          <XCircle size={13} />
          Rechazar
        </button>
      </div>

      {/* ── Aprobar ──────────────────────────────────────────── */}
      {mode === 'aprobar' && (
        <form action={handleAprobar} className="space-y-4">
          <input type="hidden" name="id" value={solicitudId} />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Plan a activar</label>
            {planes.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No hay planes activos. Crea uno antes de aprobar.
              </p>
            ) : (
              <select
                name="plan_id"
                value={selectedId}
                onChange={(e) => onPlanChange(e.target.value)}
                className={INPUT}
              >
                {planes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} · {categoriaLabel[p.categoria]}
                    {p.precio_usd ? ` · $${p.precio_usd} USD` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Duración{' '}
              <span className="font-normal">(días, opcional — sobrescribe el plan)</span>
            </label>
            <input
              name="duracion_dias"
              type="number"
              min="1"
              max="3650"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              placeholder="Sin duración fija"
              className={INPUT}
            />
            {fechaFin && (
              <p className="text-xs text-muted-foreground">
                Fecha de fin estimada: <span className="text-foreground">{fechaFin}</span>
              </p>
            )}
          </div>

          {error && <p className="text-xs text-[#EF4444]">{error}</p>}

          <button
            type="submit"
            disabled={isPending || planes.length === 0}
            className={cn(
              buttonVariants({ size: 'sm' }),
              'gap-1.5 bg-[#10B981] border-[#10B981] hover:bg-[#10B981]/90',
            )}
          >
            <CheckCircle size={13} />
            {isPending ? 'Aprobando...' : 'Aprobar solicitud'}
          </button>
        </form>
      )}

      {/* ── Rechazar ─────────────────────────────────────────── */}
      {mode === 'rechazar' && (
        <form action={handleRechazar} className="space-y-4">
          <input type="hidden" name="id" value={solicitudId} />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Motivo del rechazo <span className="text-[#EF4444]">*</span>
            </label>
            <textarea
              name="motivo_rechazo"
              rows={3}
              required
              placeholder="Explica por qué se rechaza esta solicitud..."
              className={cn(INPUT, 'resize-none')}
            />
          </div>

          {error && <p className="text-xs text-[#EF4444]">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className={cn(
              buttonVariants({ size: 'sm' }),
              'gap-1.5 bg-[#EF4444] border-[#EF4444] hover:bg-[#EF4444]/90',
            )}
          >
            <XCircle size={13} />
            {isPending ? 'Rechazando...' : 'Rechazar solicitud'}
          </button>
        </form>
      )}
    </div>
  )
}
