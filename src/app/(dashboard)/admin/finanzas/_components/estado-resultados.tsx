'use client'

import { useState } from 'react'
import {
  Download, TrendingUp, TrendingDown, Loader2,
  ChevronRight, BarChart2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import type { Ingreso, Gasto } from '@/types/database.types'

interface Props {
  ingresos:  Ingreso[]
  gastos:    Gasto[]
  timezone:  string
  // filtros actuales (para pasarlos al API de descarga)
  periodo:   string
  modoRango: boolean
  rangoDesde: string
  rangoHasta: string
}

function usd(n: number) {
  return `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
}

function groupByCategory(items: { monto: number; categoria?: { nombre: string } | null }[]) {
  const map: Record<string, number> = {}
  for (const item of items) {
    const cat = item.categoria?.nombre ?? 'Sin categoría'
    map[cat] = (map[cat] ?? 0) + item.monto
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1])
}

export function EstadoResultados({
  ingresos,
  gastos,
  timezone,
  periodo,
  modoRango,
  rangoDesde,
  rangoHasta,
}: Props) {
  const [loading, setLoading] = useState(false)

  const ingBycat   = groupByCategory(ingresos)
  const gasBycat   = groupByCategory(gastos)
  const totalIng   = ingresos.reduce((s, i) => s + i.monto, 0)
  const totalGas   = gastos.reduce((s, g) => s + g.monto, 0)
  const resultado  = totalIng - totalGas
  const esUtilidad = resultado >= 0

  async function handleDownload() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ tz: timezone })
      if (modoRango) {
        if (rangoDesde) params.set('desde', rangoDesde)
        if (rangoHasta) params.set('hasta', rangoHasta)
      } else {
        params.set('periodo', periodo)
      }
      const res = await fetch(`/api/admin/finanzas/estado-resultados?${params}`)
      if (!res.ok) throw new Error('Error al generar el archivo')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1]
                   ?? 'estado-resultados.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('No se pudo generar el archivo. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Botón de descarga */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Estado de Resultados</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Basado en los registros filtrados del período actual.
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={loading}
          className={cn(
            buttonVariants({ size: 'sm' }),
            'h-9 gap-2 shrink-0',
          )}
        >
          {loading
            ? <Loader2 size={14} className="animate-spin" />
            : <Download size={14} />}
          {loading ? 'Generando...' : 'Descargar Excel'}
        </button>
      </div>

      {/* Preview contable */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">

        {/* Cabecera */}
        <div className="border-b border-border bg-background px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Axendora</p>
          <h3 className="mt-0.5 text-lg font-bold text-foreground">Estado de Resultados</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {modoRango
              ? rangoDesde && rangoHasta
                ? `Del ${rangoDesde} al ${rangoHasta}`
                : rangoDesde ? `Desde ${rangoDesde}` : rangoHasta ? `Hasta ${rangoHasta}` : 'Período personalizado'
              : {
                  hoy:    'Hoy',
                  ayer:   'Ayer',
                  semana: 'Esta semana',
                  mes:    'Este mes',
                  todo:   'Todos los períodos',
                }[periodo] ?? 'Período actual'}
          </p>
        </div>

        {/* INGRESOS */}
        <Section
          title="INGRESOS"
          tone="teal"
          icon={<TrendingUp size={14} />}
          rows={ingBycat}
          total={totalIng}
          totalLabel="TOTAL INGRESOS"
          emptyMsg="Sin ingresos en este período"
        />

        <div className="mx-6 border-t border-dashed border-border" />

        {/* GASTOS */}
        <Section
          title="GASTOS"
          tone="red"
          icon={<TrendingDown size={14} />}
          rows={gasBycat}
          total={totalGas}
          totalLabel="TOTAL GASTOS"
          emptyMsg="Sin gastos en este período"
        />

        {/* Resultado neto */}
        <div
          className={cn(
            'mx-4 mb-4 mt-2 rounded-xl px-5 py-4',
            esUtilidad
              ? 'border border-[#10B981]/30 bg-[#10B981]/10'
              : 'border border-[#EF4444]/30 bg-[#EF4444]/10',
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  esUtilidad ? 'bg-[#10B981]/20' : 'bg-[#EF4444]/20',
                )}
              >
                <BarChart2
                  size={16}
                  className={esUtilidad ? 'text-[#10B981]' : 'text-[#EF4444]'}
                />
              </div>
              <div>
                <p
                  className={cn(
                    'text-sm font-bold',
                    esUtilidad ? 'text-[#10B981]' : 'text-[#EF4444]',
                  )}
                >
                  {esUtilidad ? 'UTILIDAD DEL PERÍODO' : 'PÉRDIDA DEL PERÍODO'}
                </p>
                <p className="text-xs text-muted-foreground">Ingresos menos Gastos</p>
              </div>
            </div>
            <p
              className={cn(
                'text-xl font-bold tabular-nums',
                esUtilidad ? 'text-[#10B981]' : 'text-[#EF4444]',
              )}
            >
              {esUtilidad ? '+' : '−'} {usd(Math.abs(resultado))}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Sub-componente de sección ─────────────────────────────────────────────────
function Section({
  title,
  tone,
  icon,
  rows,
  total,
  totalLabel,
  emptyMsg,
}: {
  title: string
  tone: 'teal' | 'red'
  icon: React.ReactNode
  rows: [string, number][]
  total: number
  totalLabel: string
  emptyMsg: string
}) {
  const [expanded, setExpanded] = useState(true)

  const isTeal = tone === 'teal'
  const accent = isTeal ? '#14A8B6' : '#EF4444'
  const bgHead = isTeal ? 'bg-[#14A8B6]/10' : 'bg-[#EF4444]/10'
  const bgRow  = isTeal ? 'hover:bg-[#14A8B6]/5' : 'hover:bg-[#EF4444]/5'
  const bgTot  = isTeal
    ? 'bg-[#14A8B6]/10 border-t border-[#14A8B6]/20'
    : 'bg-[#EF4444]/10 border-t border-[#EF4444]/20'

  return (
    <div>
      {/* Header de sección */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between px-6 py-3 transition-colors',
          bgHead,
        )}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: accent }}>{icon}</span>
          <span className="text-sm font-bold" style={{ color: accent }}>{title}</span>
        </div>
        <ChevronRight
          size={14}
          className={cn('transition-transform', expanded && 'rotate-90')}
          style={{ color: accent }}
        />
      </button>

      {/* Filas de categorías */}
      {expanded && (
        <div>
          {rows.length === 0 ? (
            <div className="px-8 py-3">
              <p className="text-xs italic text-muted-foreground">{emptyMsg}</p>
            </div>
          ) : (
            rows.map(([cat, monto]) => (
              <div
                key={cat}
                className={cn(
                  'flex items-center justify-between gap-4 border-b border-border/50 px-8 py-2.5 transition-colors',
                  bgRow,
                )}
              >
                <p className="text-sm text-muted-foreground">{cat}</p>
                <p className="shrink-0 text-sm tabular-nums text-foreground">{usd(monto)}</p>
              </div>
            ))
          )}

          {/* Total de sección */}
          <div className={cn('flex items-center justify-between px-6 py-3', bgTot)}>
            <p className="text-sm font-semibold" style={{ color: accent }}>{totalLabel}</p>
            <p className="text-base font-bold tabular-nums" style={{ color: accent }}>
              {usd(total)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
