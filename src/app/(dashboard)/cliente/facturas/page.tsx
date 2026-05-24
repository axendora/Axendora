import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Receipt,
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Ban,
  MessageSquare,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import type { FacturaEstado, MonedaTipo } from '@/types/database.types'

type FacturaRow = {
  id: string
  numero: string
  concepto: string
  monto: number
  moneda: MonedaTipo
  estado: FacturaEstado
  fecha_emision: string
  fecha_vencimiento: string | null
  fecha_pago: string | null
  notas: string | null
}

const estadoConfig: Record<
  FacturaEstado,
  { label: string; className: string; dot: string; icon: React.ElementType }
> = {
  pendiente: { label: 'Pendiente de pago', className: 'bg-warning/10 text-warning border-warning/20',        dot: 'bg-warning',     icon: Clock        },
  pagada:    { label: 'Pagada',            className: 'bg-success/10 text-success border-success/20',        dot: 'bg-success',     icon: CheckCircle2 },
  vencida:   { label: 'Vencida',           className: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive', icon: AlertTriangle },
  cancelada: { label: 'Cancelada',         className: 'bg-muted/50 text-muted-foreground border-border',     dot: 'bg-muted-foreground', icon: Ban      },
}

function formatMonto(monto: number, moneda: MonedaTipo) {
  if (moneda === 'USD') {
    return `$ ${monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
  }
  return `$ ${monto.toLocaleString('es-CO', { maximumFractionDigits: 0 })} COP`
}

function formatDate(date: string | null) {
  if (!date) return null
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
}

function isProximaVencer(fecha: string | null) {
  if (!fecha) return false
  const diff = new Date(fecha).getTime() - Date.now()
  return diff > 0 && diff < 7 * 86_400_000 // menos de 7 días
}

const FILTROS: { value: FacturaEstado | 'todas'; label: string }[] = [
  { value: 'todas',     label: 'Todas'      },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'pagada',    label: 'Pagadas'    },
  { value: 'vencida',   label: 'Vencidas'   },
  { value: 'cancelada', label: 'Canceladas' },
]

export default async function ClienteFacturasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { estado: filtroEstado } = await searchParams

  const { data: raw } = await supabase
    .from('facturas')
    .select('id, numero, concepto, monto, moneda, estado, fecha_emision, fecha_vencimiento, fecha_pago, notas')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  const todas = (raw ?? []) as FacturaRow[]

  // Stats
  const pendientes = todas.filter((f) => f.estado === 'pendiente')
  const pagadas    = todas.filter((f) => f.estado === 'pagada')
  const vencidas   = todas.filter((f) => f.estado === 'vencida')

  // Filtrado
  const lista =
    filtroEstado && filtroEstado !== 'todas'
      ? todas.filter((f) => f.estado === filtroEstado)
      : todas

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Mis facturas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Historial de cobros y estado de pagos de tus servicios con Axendora.
        </p>
      </div>

      {/* Stats — solo si hay facturas */}
      {todas.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Por pagar</p>
              <TrendingDown size={14} className="text-warning/60" />
            </div>
            <p className="mt-2 text-2xl font-bold text-warning">{pendientes.length}</p>
            {pendientes.length > 0 && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {pendientes.length === 1 ? 'factura pendiente' : 'facturas pendientes'}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-success/30 bg-success/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Pagadas</p>
              <CheckCircle2 size={14} className="text-success/60" />
            </div>
            <p className="mt-2 text-2xl font-bold text-success">{pagadas.length}</p>
            {pagadas.length > 0 && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {pagadas.length === 1 ? 'factura pagada' : 'facturas pagadas'}
              </p>
            )}
          </div>

          <div className={cn('rounded-xl border p-4', vencidas.length > 0 ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card')}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Total facturas</p>
              <Receipt size={14} className="text-muted-foreground/60" />
            </div>
            <p className="mt-2 text-2xl font-bold">{todas.length}</p>
            {vencidas.length > 0 && (
              <p className="mt-0.5 text-[11px] text-destructive">{vencidas.length} vencida{vencidas.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
      )}

      {/* Alerta de vencidas */}
      {vencidas.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-destructive" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium text-foreground">
              Tienes {vencidas.length === 1 ? 'una factura vencida' : `${vencidas.length} facturas vencidas`}
            </p>
            <p className="mt-0.5 text-muted-foreground">
              Contáctanos para regularizar el pago y evitar interrupciones en tu servicio.
            </p>
          </div>
          <Link
            href="/cliente/solicitudes/nueva"
            className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'shrink-0 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10')}
          >
            <MessageSquare size={13} />
            Contactar
          </Link>
        </div>
      )}

      {!todas.length ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Receipt size={28} className="text-primary" />
          </div>
          <p className="text-base font-medium">Aún no tienes facturas</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Cuando Axendora genere un cobro por tus servicios, aparecerá aquí con toda la información de pago.
          </p>
        </div>
      ) : (
        <>
          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            {FILTROS.map((f) => {
              const active = (filtroEstado ?? 'todas') === f.value
              const count = f.value === 'todas' ? todas.length : todas.filter((x) => x.estado === f.value).length
              if (f.value !== 'todas' && count === 0) return null
              return (
                <Link
                  key={f.value}
                  href={f.value === 'todas' ? '/cliente/facturas' : `/cliente/facturas?estado=${f.value}`}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                  )}
                >
                  {f.label}
                  <span className="ml-1.5 opacity-60">{count}</span>
                </Link>
              )
            })}
          </div>

          {/* Lista */}
          {lista.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay facturas con ese estado.
            </p>
          ) : (
            <div className="space-y-3">
              {lista.map((f) => {
                const cfg      = estadoConfig[f.estado]
                const Icon     = cfg.icon
                const proximaVencer = isProximaVencer(f.fecha_vencimiento)

                return (
                  <div
                    key={f.id}
                    className={cn(
                      'overflow-hidden rounded-2xl border bg-card transition-colors',
                      f.estado === 'vencida'   ? 'border-destructive/30' :
                      f.estado === 'pagada'    ? 'border-success/20' :
                      proximaVencer            ? 'border-warning/40' :
                                                 'border-border',
                    )}
                  >
                    <div className="p-5">
                      {/* Header de la tarjeta */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-muted-foreground">
                              {f.numero}
                            </span>
                            <span
                              className={cn(
                                'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                                cfg.className,
                              )}
                            >
                              <Icon size={9} />
                              {cfg.label}
                            </span>
                          </div>
                          <p className="mt-1 font-semibold leading-snug">{f.concepto}</p>
                        </div>

                        {/* Monto */}
                        <div className="shrink-0 text-right">
                          <p className="text-xl font-bold">{formatMonto(f.monto, f.moneda)}</p>
                        </div>
                      </div>

                      {/* Alerta próxima a vencer */}
                      {proximaVencer && f.fecha_vencimiento && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs">
                          <AlertTriangle size={12} className="shrink-0 text-warning" />
                          <span className="text-muted-foreground">
                            Vence el{' '}
                            <span className="font-medium text-warning">
                              {formatDate(f.fecha_vencimiento)}
                            </span>{' '}
                            — coordina tu pago con Axendora antes de esa fecha.
                          </span>
                        </div>
                      )}

                      {/* Fechas */}
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={11} />
                          Emitida el{' '}
                          <span className="text-foreground/80">{formatDate(f.fecha_emision)}</span>
                        </span>

                        {f.fecha_vencimiento && f.estado !== 'pagada' && f.estado !== 'cancelada' && (
                          <span className={cn('flex items-center gap-1.5', f.estado === 'vencida' && 'text-destructive')}>
                            <CalendarDays size={11} />
                            Vence el{' '}
                            <span className={cn('font-medium', f.estado === 'vencida' ? 'text-destructive' : 'text-foreground/80')}>
                              {formatDate(f.fecha_vencimiento)}
                            </span>
                          </span>
                        )}

                        {f.fecha_pago && (
                          <span className="flex items-center gap-1.5 text-success">
                            <CheckCircle2 size={11} />
                            Pagada el{' '}
                            <span className="font-medium">{formatDate(f.fecha_pago)}</span>
                          </span>
                        )}
                      </div>

                      {/* Notas */}
                      {f.notas && (
                        <p className="mt-3 text-xs italic text-muted-foreground">{f.notas}</p>
                      )}

                      {/* CTA pendiente/vencida */}
                      {(f.estado === 'pendiente' || f.estado === 'vencida') && (
                        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                          <p className="text-xs text-muted-foreground">
                            ¿Tienes dudas sobre este cobro?
                          </p>
                          <Link
                            href="/cliente/solicitudes/nueva"
                            className={cn(
                              buttonVariants({ size: 'sm', variant: 'outline' }),
                              'shrink-0 gap-1.5 text-xs',
                            )}
                          >
                            <MessageSquare size={12} />
                            Consultar
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
