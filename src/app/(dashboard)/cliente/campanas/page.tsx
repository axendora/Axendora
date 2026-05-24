import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Megaphone, Layers, Hourglass, CalendarDays, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { CountdownTimer } from '@/components/dashboard/countdown-timer'
import { getCategoriaLabel } from '@/lib/plans'
import type { ServiceEstado, PlanCategoria } from '@/types/database.types'

type CampanaRow = {
  id: string
  estado: ServiceEstado
  fecha_inicio: string | null
  fecha_fin: string | null
  notas: string | null
  plans: {
    nombre: string
    descripcion: string | null
    categoria: PlanCategoria
    imagen_url: string | null
  } | null
}

const estadoConfig: Record<ServiceEstado, { label: string; className: string; tone: 'info' | 'success' | 'muted' | 'warning' }> = {
  en_configuracion: { label: 'En configuración', className: 'bg-warning/10 text-warning',           tone: 'warning' },
  activo:           { label: 'Activo',            className: 'bg-success/10 text-success',           tone: 'success' },
  pausado:          { label: 'Pausado',            className: 'bg-muted text-muted-foreground',      tone: 'muted'   },
  finalizado:       { label: 'Finalizado',         className: 'bg-border text-muted-foreground',     tone: 'muted'   },
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(date))
}

export default async function CampanasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: campanasRaw } = await supabase
    .from('client_services')
    .select('id, estado, fecha_inicio, fecha_fin, notas, plans(nombre, descripcion, categoria, imagen_url)')
    .eq('client_id', user.id)
    .not('plan_id', 'is', null)
    .order('created_at', { ascending: false })

  const campanas = (campanasRaw ?? []) as unknown as CampanaRow[]

  const activos     = campanas.filter((c) => c.estado === 'activo')
  const enConfig    = campanas.filter((c) => c.estado === 'en_configuracion')
  const pausados    = campanas.filter((c) => c.estado === 'pausado')
  const finalizados = campanas.filter((c) => c.estado === 'finalizado')
  const todos       = [...activos, ...enConfig, ...pausados, ...finalizados]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Campañas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aquí ves todos los planes que tienes contratados con Axendora y el tiempo restante de cada uno.
          </p>
        </div>
        <Link href="/cliente/planes" className={cn(buttonVariants({ size: 'sm' }), 'h-9 gap-2')}>
          <Sparkles size={15} />
          Explorar planes
        </Link>
      </div>

      {/* Resumen activos */}
      {activos.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-success/30 bg-success/5 p-4">
            <p className="text-xs text-muted-foreground">Activos</p>
            <p className="mt-1 text-2xl font-bold text-success">{activos.length}</p>
          </div>
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <p className="text-xs text-muted-foreground">En configuración</p>
            <p className="mt-1 text-2xl font-bold text-warning">{enConfig.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="mt-1 text-2xl font-bold">{todos.length}</p>
          </div>
        </div>
      )}

      {!todos.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Megaphone size={28} className="text-primary" />
          </div>
          <p className="text-base font-medium">Aún no tienes campañas activas</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Contrata un plan y aquí verás el tiempo restante en vivo.
          </p>
          <Link
            href="/cliente/planes"
            className={cn(buttonVariants({ size: 'sm' }), 'mt-6 gap-2')}
          >
            <Sparkles size={15} />
            Ver planes disponibles
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {todos.map((c) => {
            const cfg = estadoConfig[c.estado]
            const plan = c.plans
            const isActive    = c.estado === 'activo'
            const isFinalized = c.estado === 'finalizado'

            return (
              <div
                key={c.id}
                className={cn(
                  'flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors',
                  isActive       ? 'border-primary/40 shadow-[0_0_0_1px_rgb(31_168_184/0.2)]' :
                  isFinalized    ? 'border-border opacity-70' :
                                   'border-border',
                )}
              >
                {/* Imagen */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">
                  {plan?.imagen_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={plan.imagen_url}
                      alt={plan.nombre ?? ''}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Layers size={48} className="text-muted-foreground/20" />
                    </div>
                  )}
                  <span
                    className={cn(
                      'absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur',
                      cfg.className,
                    )}
                  >
                    {cfg.label}
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {plan ? getCategoriaLabel(plan.categoria) : 'Plan'}
                  </p>
                  <h3 className="mt-0.5 font-semibold leading-tight">{plan?.nombre ?? 'Plan'}</h3>

                  {plan?.descripcion && (
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                      {plan.descripcion}
                    </p>
                  )}

                  {/* Countdown destacado cuando activo */}
                  {isActive && c.fecha_fin && (
                    <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-primary/80">
                        <Hourglass size={11} />
                        Tiempo restante
                      </div>
                      <CountdownTimer
                        fechaFin={c.fecha_fin}
                        className="mt-1.5 text-lg font-bold"
                      />
                    </div>
                  )}

                  {/* Mensaje cuando en configuración */}
                  {c.estado === 'en_configuracion' && (
                    <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-3">
                      <div className="flex items-start gap-2 text-xs">
                        <Hourglass size={13} className="mt-0.5 shrink-0 text-warning" />
                        <p className="text-muted-foreground">
                          El equipo está preparando tu campaña. El conteo iniciará cuando
                          se active.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Fechas */}
                  <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
                    {c.fecha_inicio && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={11} />
                          Inicio
                        </span>
                        <span className="text-right text-foreground/80">
                          {formatDate(c.fecha_inicio)}
                        </span>
                      </div>
                    )}
                    {c.fecha_fin && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={11} />
                          Vencimiento
                        </span>
                        <span className="text-right text-foreground/80">
                          {formatDate(c.fecha_fin)}
                        </span>
                      </div>
                    )}
                  </div>

                  {c.notas && (
                    <p className="mt-3 text-xs italic text-muted-foreground">{c.notas}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
