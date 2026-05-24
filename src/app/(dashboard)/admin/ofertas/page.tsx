import { createClient } from '@/lib/supabase/server'
import { getAgencyTimezone } from '@/lib/timezone.server'
import { toLocalDateKey } from '@/lib/timezone'
import Link from 'next/link'
import {
  Tag, Plus, AlertTriangle, CheckCircle2, Clock, XCircle, Pencil,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { EliminarOfertaBtn } from './_components/eliminar-oferta-btn'
import { toggleActivoOfertaAction } from './actions'
import type { TipoDescuento, MonedaTipo, PlanCategoria } from '@/types/database.types'

type EstadoOferta = 'activa' | 'inactiva' | 'vencida'

type OfertaWithPlan = {
  id: string
  titulo: string
  descripcion: string | null
  tipo_descuento: TipoDescuento
  valor_descuento: number
  moneda: MonedaTipo
  codigo_promo: string | null
  plan_id: string | null
  fecha_inicio: string
  fecha_fin: string | null
  activo: boolean
  created_at: string
  plans: { id: string; nombre: string; categoria: PlanCategoria } | null
}

function getEstado(o: OfertaWithPlan, today: string): EstadoOferta {
  if (!o.activo) return 'inactiva'
  if (o.fecha_fin && o.fecha_fin < today) return 'vencida'
  return 'activa'
}

function formatDescuento(tipo: TipoDescuento, valor: number, moneda: MonedaTipo): string {
  if (tipo === 'porcentaje') return `${valor}%`
  if (moneda === 'COP') return `$${valor.toLocaleString('es-CO', { maximumFractionDigits: 0 })} COP`
  return `$${valor.toLocaleString('en-US', { minimumFractionDigits: 0 })} USD`
}

function formatFechaOferta(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const FILTROS = [
  { value: 'todas',     label: 'Todas'    },
  { value: 'activas',   label: 'Activas'  },
  { value: 'vencidas',  label: 'Vencidas' },
  { value: 'inactivas', label: 'Inactivas'},
]

const estadoConfig: Record<EstadoOferta, { label: string; className: string }> = {
  activa:   { label: 'Activa',   className: 'bg-success/10 text-success'             },
  inactiva: { label: 'Inactiva', className: 'bg-muted text-muted-foreground'         },
  vencida:  { label: 'Vencida',  className: 'bg-warning/10 text-warning'             },
}

export default async function AdminOfertasPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>
}) {
  const { filtro } = await searchParams
  const supabase   = await createClient()
  const timezone   = await getAgencyTimezone()
  const today      = toLocalDateKey(new Date(), timezone)

  const { data: raw, error } = await supabase
    .from('ofertas')
    .select('id, titulo, descripcion, tipo_descuento, valor_descuento, moneda, codigo_promo, plan_id, fecha_inicio, fecha_fin, activo, created_at, plans(id, nombre, categoria)')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Ofertas</h1>
        </div>
        <div className="rounded-xl border border-warning/40 bg-warning/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-warning" />
            <div className="space-y-2">
              <p className="font-medium text-warning">Migración pendiente</p>
              <p className="text-sm text-muted-foreground">
                La tabla{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">public.ofertas</code>{' '}
                no existe todavía. Ejecuta la migración{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">015_ofertas.sql</code>{' '}
                en el SQL Editor de Supabase.
              </p>
              <p className="font-mono text-xs text-muted-foreground/80">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const todas    = (raw ?? []) as unknown as OfertaWithPlan[]
  const activas  = todas.filter((o) => getEstado(o, today) === 'activa')
  const vencidas = todas.filter((o) => getEstado(o, today) === 'vencida')
  const inactivas = todas.filter((o) => getEstado(o, today) === 'inactiva')

  const lista =
    filtro === 'activas'   ? activas  :
    filtro === 'vencidas'  ? vencidas :
    filtro === 'inactivas' ? inactivas :
    todas

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Ofertas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea y gestiona las promociones y descuentos para tus clientes.
          </p>
        </div>
        <Link
          href="/admin/ofertas/nueva"
          className={cn(buttonVariants({ size: 'sm' }), 'h-9 gap-2 shrink-0')}
        >
          <Plus size={15} />
          Nueva oferta
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Total"     value={String(todas.length)}    tone="neutral"  icon={Tag}          />
        <StatCard label="Activas"   value={String(activas.length)}  tone="success"  icon={CheckCircle2} />
        <StatCard label="Vencidas"  value={String(vencidas.length)} tone="warning"  icon={Clock}        />
        <StatCard label="Inactivas" value={String(inactivas.length)} tone="neutral" icon={XCircle}      />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => {
          const active = (filtro ?? 'todas') === f.value
          const count =
            f.value === 'activas'   ? activas.length :
            f.value === 'vencidas'  ? vencidas.length :
            f.value === 'inactivas' ? inactivas.length :
            undefined
          return (
            <Link
              key={f.value}
              href={f.value === 'todas' ? '/admin/ofertas' : `/admin/ofertas?filtro=${f.value}`}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {f.label}
              {count !== undefined && (
                <span className="ml-1.5 opacity-60">{count}</span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Lista */}
      {lista.length === 0 ? (
        <EmptyState filtered={!!filtro && filtro !== 'todas'} />
      ) : (
        <div className="space-y-2">
          {lista.map((oferta) => {
            const estado   = getEstado(oferta, today)
            const cfg      = estadoConfig[estado]
            const descuento = formatDescuento(oferta.tipo_descuento, oferta.valor_descuento, oferta.moneda)
            const esPct    = oferta.tipo_descuento === 'porcentaje'

            return (
              <div
                key={oferta.id}
                className={cn(
                  'overflow-hidden rounded-xl border bg-card transition-colors',
                  estado === 'activa'  ? 'border-success/20' :
                  estado === 'vencida' ? 'border-warning/20' :
                                         'border-border',
                )}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  {/* Discount badge */}
                  <div
                    className={cn(
                      'flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-center text-sm font-bold',
                      esPct
                        ? 'bg-primary/15 text-primary'
                        : 'bg-success/15 text-success',
                    )}
                  >
                    {descuento}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{oferta.titulo}</p>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', cfg.className)}>
                        {cfg.label}
                      </span>
                    </div>
                    {oferta.descripcion && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{oferta.descripcion}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      {oferta.plans && (
                        <span className="flex items-center gap-1">
                          <Tag size={10} />
                          {oferta.plans.nombre}
                        </span>
                      )}
                      {oferta.codigo_promo && (
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-primary">
                          {oferta.codigo_promo}
                        </span>
                      )}
                      <span>
                        {formatFechaOferta(oferta.fecha_inicio)}
                        {oferta.fecha_fin
                          ? ` → ${formatFechaOferta(oferta.fecha_fin)}`
                          : ' · Sin vencimiento'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <form action={toggleActivoOfertaAction}>
                      <input type="hidden" name="id" value={oferta.id} />
                      <input type="hidden" name="activo" value={String(oferta.activo)} />
                      <button
                        type="submit"
                        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-8 px-3 text-xs')}
                      >
                        {oferta.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </form>
                    <Link
                      href={`/admin/ofertas/${oferta.id}/editar`}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-8 gap-1.5 px-3 text-xs')}
                    >
                      <Pencil size={11} />
                      Editar
                    </Link>
                    <EliminarOfertaBtn id={oferta.id} titulo={oferta.titulo} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label, value, tone, icon: Icon,
}: {
  label: string
  value: string
  tone: 'success' | 'warning' | 'neutral'
  icon: React.ElementType
}) {
  const cls =
    tone === 'success' ? 'border-success/30 bg-success/5 text-success' :
    tone === 'warning' ? 'border-warning/30 bg-warning/5 text-warning' :
                         'border-border bg-card text-foreground'
  return (
    <div className={cn('rounded-xl border p-4', cls)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon size={14} className="opacity-60" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
      <Tag size={40} className="mb-4 text-muted-foreground/30" />
      <p className="text-base font-medium">
        {filtered ? 'Sin ofertas con ese estado' : 'Aún no hay ofertas'}
      </p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {filtered
          ? 'Prueba con otro filtro o crea una nueva oferta.'
          : 'Crea tu primera oferta para comenzar a promocionar tus servicios.'}
      </p>
      {!filtered && (
        <Link href="/admin/ofertas/nueva" className={cn(buttonVariants({ size: 'sm' }), 'mt-6 gap-2')}>
          <Plus size={14} />
          Nueva oferta
        </Link>
      )}
    </div>
  )
}
