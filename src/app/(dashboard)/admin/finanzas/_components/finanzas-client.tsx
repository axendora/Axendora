'use client'

import { useState, useTransition, useMemo } from 'react'
import {
  TrendingUp, TrendingDown, Scale, Plus, Trash2,
  ChevronDown, Filter, ArrowUpCircle, ArrowDownCircle, CalendarRange, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { eliminarIngresoAction, eliminarGastoAction } from '../actions'
import { EntradaModal } from './entrada-modal'
import { CatIcon } from './icon-map'
import { toLocalDateKey, formatDate, formatDateTime } from '@/lib/timezone'
import type { Ingreso, Gasto, IngresoCategoria, GastoCategoria } from '@/types/database.types'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Tab     = 'ingresos' | 'gastos'
type Periodo = 'hoy' | 'ayer' | 'semana' | 'mes' | 'todo'

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: 'hoy',    label: 'Hoy'         },
  { value: 'ayer',   label: 'Ayer'        },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes',    label: 'Este mes'    },
  { value: 'todo',   label: 'Todo'        },
]

// ── Date helpers (timezone-aware) ─────────────────────────────────────────────
function todayInTz(tz: string)     { return toLocalDateKey(new Date(), tz) }
function yesterdayInTz(tz: string) {
  const d = new Date(); d.setDate(d.getDate() - 1); return toLocalDateKey(d, tz)
}
function startOfWeekInTz(tz: string) {
  const d = new Date()
  const day = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(d) === 'Sun' ? '0'
    : new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(d) === 'Mon' ? '1'
    : new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(d) === 'Tue' ? '2'
    : new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(d) === 'Wed' ? '3'
    : new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(d) === 'Thu' ? '4'
    : new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(d) === 'Fri' ? '5' : '6'
  )
  d.setDate(d.getDate() - day)
  return toLocalDateKey(d, tz)
}
function startOfMonthInTz(tz: string) {
  return todayInTz(tz).slice(0, 8) + '01'
}

function isInPeriodo(fecha: string, periodo: Periodo, tz: string): boolean {
  const d     = fecha.slice(0, 10)
  const today = todayInTz(tz)
  switch (periodo) {
    case 'hoy':    return d === today
    case 'ayer':   return d === yesterdayInTz(tz)
    case 'semana': return d >= startOfWeekInTz(tz) && d <= today
    case 'mes':    return d >= startOfMonthInTz(tz) && d <= today
    default:       return true
  }
}

function isInRango(fecha: string, desde: string, hasta: string): boolean {
  const d = fecha.slice(0, 10)
  if (desde && hasta) return d >= desde && d <= hasta
  if (desde) return d >= desde
  if (hasta) return d <= hasta
  return true
}

// ── Formatters ────────────────────────────────────────────────────────────────
function formatFecha(iso: string, tz: string) {
  const hasTime = iso.length > 10
  if (hasTime) {
    return {
      fecha: formatDate(iso, tz, { day: 'numeric', month: 'short', year: 'numeric' }),
      hora:  formatDateTime(iso, tz).split(',')[1]?.trim() ?? '',
    }
  }
  // date-only: parse as local date to avoid UTC shift
  const [y, m, day] = iso.slice(0, 10).split('-').map(Number)
  const d = new Date(y, m - 1, day)
  return {
    fecha: formatDate(d, tz, { day: 'numeric', month: 'short', year: 'numeric' }),
    hora:  '',
  }
}

function formatUSD(n: number) {
  return `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  ingresos:          Ingreso[]
  gastos:            Gasto[]
  ingresoCategorias: IngresoCategoria[]
  gastoCategorias:   GastoCategoria[]
  timezone:          string
}

// ─── Delete btn ───────────────────────────────────────────────────────────────
function DeleteBtn({ id, tipo }: { id: string; tipo: Tab }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('¿Eliminar este registro?')) return
    const fd = new FormData()
    fd.set('id', id)
    startTransition(async () => {
      if (tipo === 'ingresos') await eliminarIngresoAction(fd)
      else await eliminarGastoAction(fd)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg p-1.5 text-muted-foreground/50 transition-colors hover:text-destructive disabled:opacity-40"
      title="Eliminar"
    >
      <Trash2 size={13} />
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function FinanzasClient({ ingresos, gastos, ingresoCategorias, gastoCategorias, timezone }: Props) {
  const [tab, setTab]                   = useState<Tab>('ingresos')
  const [periodo, setPeriodo]           = useState<Periodo>('mes')
  const [modoRango, setModoRango]       = useState(false)
  const [rangoDesde, setRangoDesde]     = useState('')
  const [rangoHasta, setRangoHasta]     = useState('')
  const [categoriaFiltro, setCatFiltro] = useState<string>('todas')
  const [showCatDropdown, setShowCat]   = useState(false)
  const [showModal, setShowModal]       = useState(false)

  // ── Filtering ──────────────────────────────────────────────────────────────
  function matchesFecha(fecha: string): boolean {
    if (modoRango) return isInRango(fecha, rangoDesde, rangoHasta)
    return isInPeriodo(fecha, periodo, timezone)
  }

  const ingresosFiltrados = useMemo(() => ingresos.filter((i) =>
    matchesFecha(i.fecha) && (categoriaFiltro === 'todas' || i.categoria_id === categoriaFiltro)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [ingresos, periodo, modoRango, rangoDesde, rangoHasta, categoriaFiltro, timezone])

  const gastosFiltrados = useMemo(() => gastos.filter((g) =>
    matchesFecha(g.fecha) && (categoriaFiltro === 'todas' || g.categoria_id === categoriaFiltro)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [gastos, periodo, modoRango, rangoDesde, rangoHasta, categoriaFiltro, timezone])

  // ── Summary cards (always Este mes, independent of filters) ───────────────
  const startMes = startOfMonthInTz(timezone)
  const today    = todayInTz(timezone)
  const totalIngresosMes = ingresos.filter(i => i.fecha.slice(0, 10) >= startMes && i.fecha.slice(0, 10) <= today).reduce((s, i) => s + i.monto, 0)
  const totalGastosMes   = gastos.filter(g => g.fecha.slice(0, 10) >= startMes && g.fecha.slice(0, 10) <= today).reduce((s, g) => s + g.monto, 0)
  const balanceMes       = totalIngresosMes - totalGastosMes

  const lista        = tab === 'ingresos' ? ingresosFiltrados : gastosFiltrados
  const totalFiltrado = lista.reduce((s, e) => s + e.monto, 0)
  const categorias   = tab === 'ingresos' ? ingresoCategorias : gastoCategorias
  const catFiltroNombre = categorias.find(c => c.id === categoriaFiltro)?.nombre

  // ── Periodo label for total bar ────────────────────────────────────────────
  const periodoLabel = modoRango
    ? rangoDesde && rangoHasta
      ? `${rangoDesde} → ${rangoHasta}`
      : rangoDesde ? `desde ${rangoDesde}` : rangoHasta ? `hasta ${rangoHasta}` : 'Rango'
    : PERIODOS.find(p => p.value === periodo)?.label ?? ''

  // ── Handlers ───────────────────────────────────────────────────────────────
  function onTabChange(t: Tab) {
    setTab(t); setCatFiltro('todas'); setShowCat(false)
  }

  function selectPeriodo(p: Periodo) {
    setPeriodo(p); setModoRango(false)
  }

  function activarRango() {
    setModoRango(true)
  }

  function limpiarFiltros() {
    setPeriodo('mes'); setModoRango(false); setRangoDesde(''); setRangoHasta(''); setCatFiltro('todas')
  }

  const hayFiltros = modoRango ? (!!rangoDesde || !!rangoHasta || categoriaFiltro !== 'todas')
                               : (periodo !== 'mes' || categoriaFiltro !== 'todas')

  return (
    <div className="space-y-6">

      {/* ── Summary cards ───────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Ingresos este mes"
          value={formatUSD(totalIngresosMes)}
          icon={<TrendingUp size={16} className="text-success" />}
          tone="success"
        />
        <SummaryCard
          label="Gastos este mes"
          value={formatUSD(totalGastosMes)}
          icon={<TrendingDown size={16} className="text-destructive" />}
          tone="danger"
        />
        <SummaryCard
          label="Balance del mes"
          value={formatUSD(Math.abs(balanceMes))}
          prefix={balanceMes < 0 ? '−' : '+'}
          icon={<Scale size={16} className={balanceMes >= 0 ? 'text-success' : 'text-destructive'} />}
          tone={balanceMes >= 0 ? 'success' : 'danger'}
        />
      </div>

      {/* ── Tabs + botón nuevo ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl border border-border bg-card p-1">
          {(['ingresos', 'gastos'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium capitalize transition-colors',
                tab === t
                  ? t === 'ingresos'
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t === 'ingresos' ? <ArrowUpCircle size={15} /> : <ArrowDownCircle size={15} />}
              {t === 'ingresos' ? 'Ingresos' : 'Gastos'}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                {t === 'ingresos' ? ingresosFiltrados.length : gastosFiltrados.length}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className={cn(
            buttonVariants({ size: 'sm' }),
            'h-9 gap-2 shrink-0',
            tab === 'ingresos'
              ? 'bg-success border-success hover:bg-success/90'
              : 'bg-destructive border-destructive hover:bg-destructive/90',
          )}
        >
          <Plus size={14} />
          {tab === 'ingresos' ? 'Nuevo ingreso' : 'Nuevo gasto'}
        </button>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">

          {/* Período pills (desactivados cuando hay rango activo) */}
          <div className="flex flex-wrap gap-1.5">
            {PERIODOS.map((p) => (
              <button
                key={p.value}
                onClick={() => selectPeriodo(p.value)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  !modoRango && periodo === p.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                )}
              >
                {p.label}
              </button>
            ))}

            {/* Rango pill */}
            <button
              onClick={activarRango}
              className={cn(
                'flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                modoRango
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
              )}
            >
              <CalendarRange size={11} />
              Rango
            </button>
          </div>

          <div className="h-5 w-px bg-border" />

          {/* Categoría dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCat(!showCatDropdown)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                categoriaFiltro !== 'todas'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              <Filter size={11} />
              {catFiltroNombre ?? 'Categoría'}
              <ChevronDown size={10} className={cn('transition-transform', showCatDropdown && 'rotate-180')} />
            </button>

            {showCatDropdown && (
              <div className="absolute left-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                <button
                  onClick={() => { setCatFiltro('todas'); setShowCat(false) }}
                  className={cn('flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50', categoriaFiltro === 'todas' && 'text-primary')}
                >
                  Todas las categorías
                </button>
                {categorias.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCatFiltro(c.id); setShowCat(false) }}
                    className={cn('flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50', categoriaFiltro === c.id && 'text-primary')}
                  >
                    <CatIcon nombre={c.icono} color={c.color} size={12} />
                    {c.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Limpiar */}
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              <X size={11} />
              Limpiar
            </button>
          )}
        </div>

        {/* Rango de fechas — se muestra solo cuando está activo */}
        {modoRango && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
            <CalendarRange size={14} className="shrink-0 text-primary" />
            <span className="text-xs font-medium text-primary">Rango personalizado</span>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] text-muted-foreground">Desde</label>
                <input
                  type="date"
                  value={rangoDesde}
                  max={rangoHasta || undefined}
                  onChange={(e) => setRangoDesde(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] text-muted-foreground">Hasta</label>
                <input
                  type="date"
                  value={rangoHasta}
                  min={rangoDesde || undefined}
                  onChange={(e) => setRangoHasta(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            {(rangoDesde || rangoHasta) && (
              <button
                onClick={() => { setRangoDesde(''); setRangoHasta('') }}
                className="ml-auto text-[11px] text-muted-foreground hover:text-destructive"
              >
                Borrar fechas
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Lista ───────────────────────────────────────────────────────── */}
      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          {tab === 'ingresos'
            ? <ArrowUpCircle size={36} className="mb-3 text-muted-foreground/20" />
            : <ArrowDownCircle size={36} className="mb-3 text-muted-foreground/20" />
          }
          <p className="text-sm font-medium">Sin {tab} en este período</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Cambia el período o registra un nuevo {tab === 'ingresos' ? 'ingreso' : 'gasto'}.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="hidden grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
            <span>Descripción</span>
            <span>Fecha</span>
            <span className="text-right">Monto</span>
            <span />
          </div>

          <div className="divide-y divide-border">
            {lista.map((entry) => {
              const cat = entry.categoria
              const { fecha, hora } = formatFecha(entry.fecha, timezone)
              return (
                <div key={entry.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/20">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: cat ? `${cat.color}18` : '#1FA8B818' }}
                  >
                    <CatIcon nombre={cat?.icono ?? 'Tag'} color={cat?.color ?? '#1FA8B8'} size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{entry.titulo}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      {cat && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                        >
                          {cat.nombre}
                        </span>
                      )}
                      {entry.descripcion && (
                        <span className="truncate text-[11px] text-muted-foreground">{entry.descripcion}</span>
                      )}
                    </div>
                  </div>

                  <div className="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
                    <p>{fecha}</p>
                    {hora && <p className="text-[11px] opacity-70">{hora}</p>}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className={cn('text-sm font-bold', tab === 'ingresos' ? 'text-success' : 'text-destructive')}>
                      {tab === 'ingresos' ? '+' : '−'} {formatUSD(entry.monto)}
                    </p>
                    <p className="text-[11px] text-muted-foreground sm:hidden">{fecha}</p>
                  </div>

                  <DeleteBtn id={entry.id} tipo={tab} />
                </div>
              )
            })}
          </div>

          {/* Total bar */}
          <div className={cn(
            'flex items-center justify-between border-t border-border px-5 py-3',
            tab === 'ingresos' ? 'bg-success/5' : 'bg-destructive/5',
          )}>
            <span className="text-xs font-medium text-muted-foreground">
              Total · {lista.length} registro{lista.length !== 1 ? 's' : ''}
              {categoriaFiltro !== 'todas' && ` · ${catFiltroNombre}`}
              {` · ${periodoLabel}`}
            </span>
            <span className={cn('text-base font-bold', tab === 'ingresos' ? 'text-success' : 'text-destructive')}>
              {tab === 'ingresos' ? '+' : '−'} {formatUSD(totalFiltrado)}
            </span>
          </div>
        </div>
      )}

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {showModal && (
        <EntradaModal
          tipo={tab === 'ingresos' ? 'ingreso' : 'gasto'}
          categorias={categorias}
          onClose={() => setShowModal(false)}
          onSuccess={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

// ─── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard({
  label, value, icon, tone, prefix,
}: {
  label: string
  value: string
  icon: React.ReactNode
  tone: 'success' | 'danger' | 'neutral'
  prefix?: string
}) {
  const cls =
    tone === 'success' ? 'border-success/30 bg-success/5' :
    tone === 'danger'  ? 'border-destructive/30 bg-destructive/5' :
                         'border-border bg-card'

  return (
    <div className={cn('rounded-xl border p-4', cls)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-lg font-bold sm:text-xl">
        {prefix && <span className="mr-0.5 text-sm">{prefix}</span>}
        {value}
      </p>
    </div>
  )
}
