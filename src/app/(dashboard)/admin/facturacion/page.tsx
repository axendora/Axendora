import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Receipt, Plus, CalendarDays, AlertTriangle, CheckCircle2, Clock, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { EstadoFacturaSelect } from './_components/estado-factura-select'
import { EliminarFacturaBtn } from './_components/eliminar-factura-btn'
import type { FacturaEstado, MonedaTipo } from '@/types/database.types'

type FacturaRow = {
  id: string
  client_id: string
  client_service_id: string | null
  numero: string
  concepto: string
  monto: number
  moneda: MonedaTipo
  estado: FacturaEstado
  fecha_emision: string
  fecha_vencimiento: string | null
  fecha_pago: string | null
  notas: string | null
  profiles: {
    nombre: string
    email: string
    empresa: string | null
  } | null
}

const estadoConfig: Record<FacturaEstado, { label: string; className: string; icon: React.ElementType }> = {
  pendiente:  { label: 'Pendiente',  className: 'bg-warning/10 text-warning',                  icon: Clock       },
  pagada:     { label: 'Pagada',     className: 'bg-success/10 text-success',                  icon: CheckCircle2 },
  vencida:    { label: 'Vencida',    className: 'bg-destructive/10 text-destructive',           icon: AlertTriangle },
  cancelada:  { label: 'Cancelada',  className: 'bg-muted text-muted-foreground',               icon: Ban         },
}

function formatMonto(monto: number, moneda: MonedaTipo) {
  if (moneda === 'USD') {
    return `$ ${monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
  }
  return `$ ${monto.toLocaleString('es-CO', { maximumFractionDigits: 0 })} COP`
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date))
}

const FILTROS: { value: FacturaEstado | 'todos'; label: string }[] = [
  { value: 'todos',     label: 'Todas'      },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'pagada',    label: 'Pagadas'    },
  { value: 'vencida',   label: 'Vencidas'   },
  { value: 'cancelada', label: 'Canceladas' },
]

export default async function AdminFacturacionPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const { estado: filtroEstado } = await searchParams
  const supabase = await createClient()

  const { data: raw } = await supabase
    .from('facturas')
    .select('id, client_id, client_service_id, numero, concepto, monto, moneda, estado, fecha_emision, fecha_vencimiento, fecha_pago, notas')
    .order('created_at', { ascending: false })

  const base = (raw ?? []) as Omit<FacturaRow, 'profiles'>[]

  // Resolver perfiles (client_id → auth.users, join manual)
  const ids = Array.from(new Set(base.map((f) => f.client_id)))
  const { data: perfiles } = ids.length
    ? await supabase.from('profiles').select('user_id, nombre, email, empresa').in('user_id', ids)
    : { data: [] as { user_id: string; nombre: string; email: string; empresa: string | null }[] }

  const byId   = new Map((perfiles ?? []).map((p) => [p.user_id, p]))
  const todas: FacturaRow[] = base.map((f) => ({ ...f, profiles: byId.get(f.client_id) ?? null }))

  // Stats
  const pendientes  = todas.filter((f) => f.estado === 'pendiente')
  const pagadas     = todas.filter((f) => f.estado === 'pagada')
  const vencidas    = todas.filter((f) => f.estado === 'vencida')

  const cobradoUSD = pagadas.filter((f) => f.moneda === 'USD').reduce((s, f) => s + f.monto, 0)
  const cobradoCOP = pagadas.filter((f) => f.moneda === 'COP').reduce((s, f) => s + f.monto, 0)

  // Filtrado
  const lista =
    filtroEstado && filtroEstado !== 'todos'
      ? todas.filter((f) => f.estado === filtroEstado)
      : todas

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Facturación</h1>
          <p className="mt-1 text-sm text-muted-foreground">Crea y gestiona las facturas de tus clientes.</p>
        </div>
        <Link href="/admin/facturacion/nueva" className={cn(buttonVariants({ size: 'sm' }), 'h-9 gap-2 shrink-0')}>
          <Plus size={15} />
          Nueva factura
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard
          label="Total facturas"
          value={String(todas.length)}
          tone="neutral"
          icon={Receipt}
        />
        <StatCard
          label="Pendientes"
          value={String(pendientes.length)}
          tone="warning"
          icon={Clock}
        />
        <StatCard
          label="Vencidas"
          value={String(vencidas.length)}
          tone="danger"
          icon={AlertTriangle}
        />
        <StatCard
          label="Cobrado USD"
          value={cobradoUSD > 0 ? `$${cobradoUSD.toLocaleString('en-US', { minimumFractionDigits: 0 })}` : cobradoCOP > 0 ? `$${cobradoCOP.toLocaleString('es-CO', { maximumFractionDigits: 0 })} COP` : '—'}
          tone="success"
          icon={CheckCircle2}
          sub={cobradoUSD > 0 && cobradoCOP > 0 ? `+ $${cobradoCOP.toLocaleString('es-CO', { maximumFractionDigits: 0 })} COP` : undefined}
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => {
          const active = (filtroEstado ?? 'todos') === f.value
          return (
            <Link
              key={f.value}
              href={f.value === 'todos' ? '/admin/facturacion' : `/admin/facturacion?estado=${f.value}`}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {f.label}
              {f.value !== 'todos' && (
                <span className="ml-1.5 opacity-60">
                  {todas.filter((x) => x.estado === f.value).length}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Lista */}
      {!lista.length ? (
        <EmptyState filtered={!!filtroEstado && filtroEstado !== 'todos'} />
      ) : (
        <div className="space-y-2">
          {lista.map((f) => {
            const cfg     = estadoConfig[f.estado]
            const Icon    = cfg.icon
            const cliente = f.profiles

            return (
              <div
                key={f.id}
                className={cn(
                  'overflow-hidden rounded-xl border bg-card transition-colors',
                  f.estado === 'vencida' ? 'border-destructive/30' :
                  f.estado === 'pagada'  ? 'border-success/20' :
                                           'border-border',
                )}
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  {/* Número + concepto */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-muted-foreground">{f.numero}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1', cfg.className)}>
                        <Icon size={10} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium leading-tight">{f.concepto}</p>
                    {cliente && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {cliente.nombre}
                        {cliente.empresa ? ` · ${cliente.empresa}` : ''}
                      </p>
                    )}
                  </div>

                  {/* Monto */}
                  <div className="shrink-0 text-right sm:text-left">
                    <p className="text-base font-bold">{formatMonto(f.monto, f.moneda)}</p>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground sm:flex-col sm:gap-y-0.5">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={10} />
                        Emitida {formatDate(f.fecha_emision)}
                      </span>
                      {f.fecha_vencimiento && (
                        <span className={cn('flex items-center gap-1', f.estado === 'vencida' && 'text-destructive')}>
                          <CalendarDays size={10} />
                          Vence {formatDate(f.fecha_vencimiento)}
                        </span>
                      )}
                      {f.fecha_pago && (
                        <span className="flex items-center gap-1 text-success">
                          <CheckCircle2 size={10} />
                          Pagada {formatDate(f.fecha_pago)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex shrink-0 items-center gap-2">
                    <EstadoFacturaSelect id={f.id} current={f.estado} />
                    <EliminarFacturaBtn id={f.id} numero={f.numero} />
                  </div>
                </div>

                {f.notas && (
                  <div className="border-t border-border px-4 py-2">
                    <p className="text-xs italic text-muted-foreground">{f.notas}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label, value, tone, icon: Icon, sub,
}: {
  label: string
  value: string
  tone: 'success' | 'warning' | 'danger' | 'neutral'
  icon: React.ElementType
  sub?: string
}) {
  const cls =
    tone === 'success' ? 'border-success/30 bg-success/5 text-success' :
    tone === 'warning' ? 'border-warning/30 bg-warning/5 text-warning' :
    tone === 'danger'  ? 'border-destructive/30 bg-destructive/5 text-destructive' :
                         'border-border bg-card text-foreground'

  return (
    <div className={cn('rounded-xl border p-4', cls)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon size={14} className="opacity-60" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
      <Receipt size={40} className="mb-4 text-muted-foreground/30" />
      <p className="text-base font-medium">
        {filtered ? 'Sin facturas con ese estado' : 'Aún no hay facturas'}
      </p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {filtered
          ? 'Prueba con otro filtro o crea una nueva factura.'
          : 'Crea tu primera factura para comenzar a registrar los cobros.'}
      </p>
      {!filtered && (
        <Link href="/admin/facturacion/nueva" className={cn(buttonVariants({ size: 'sm' }), 'mt-6 gap-2')}>
          <Plus size={14} />
          Nueva factura
        </Link>
      )}
    </div>
  )
}
