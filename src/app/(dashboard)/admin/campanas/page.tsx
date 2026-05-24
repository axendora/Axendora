import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Megaphone, Layers, Hourglass, CalendarDays, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CountdownTimer } from '@/components/dashboard/countdown-timer'
import { getCategoriaLabel } from '@/lib/plans'
import { ActivarCampanaButton } from './_components/activar-campana-button'
import { EstadoCampanaSelect } from './_components/estado-campana-select'
import type { ServiceEstado, PlanCategoria } from '@/types/database.types'

type AdminCampanaRow = {
  id: string
  client_id: string
  estado: ServiceEstado
  fecha_inicio: string | null
  fecha_fin: string | null
  duracion_dias: number | null
  notas: string | null
  created_at: string
  plans: {
    nombre: string
    descripcion: string | null
    categoria: PlanCategoria
    imagen_url: string | null
  } | null
  profiles: {
    user_id: string
    nombre: string
    email: string
    empresa: string | null
  } | null
}

const estadoConfig: Record<ServiceEstado, { label: string; className: string }> = {
  en_configuracion: { label: 'En configuración', className: 'bg-warning/10 text-warning' },
  activo:           { label: 'Activo',            className: 'bg-success/10 text-success' },
  pausado:          { label: 'Pausado',            className: 'bg-muted text-muted-foreground' },
  finalizado:       { label: 'Finalizado',         className: 'bg-border text-muted-foreground' },
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date))
}

export default async function AdminCampanasPage() {
  const supabase = await createClient()

  const { data: raw } = await supabase
    .from('client_services')
    .select(`
      id, client_id, estado, fecha_inicio, fecha_fin, duracion_dias, notas, created_at,
      plans(nombre, descripcion, categoria, imagen_url)
    `)
    .not('plan_id', 'is', null)
    .order('created_at', { ascending: false })

  const baseRows = (raw ?? []) as unknown as Omit<AdminCampanaRow, 'profiles'>[]

  // No hay FK directa entre client_services y profiles (apunta a auth.users),
  // así que resolvemos los perfiles en una segunda query y los mergeamos.
  const ids = Array.from(new Set(baseRows.map((c) => c.client_id)))
  const { data: perfiles } = ids.length
    ? await supabase
        .from('profiles')
        .select('user_id, nombre, email, empresa')
        .in('user_id', ids)
    : { data: [] as { user_id: string; nombre: string; email: string; empresa: string | null }[] }

  const byId = new Map((perfiles ?? []).map((p) => [p.user_id, p]))
  const campanas: AdminCampanaRow[] = baseRows.map((c) => ({
    ...c,
    profiles: byId.get(c.client_id) ?? null,
  }))

  const enConfig    = campanas.filter((c) => c.estado === 'en_configuracion')
  const activos     = campanas.filter((c) => c.estado === 'activo')
  const pausados    = campanas.filter((c) => c.estado === 'pausado')
  const finalizados = campanas.filter((c) => c.estado === 'finalizado')

  const orden       = [...enConfig, ...activos, ...pausados, ...finalizados]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Campañas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aquí inicias el countdown de cada plan contratado. Aprobar una solicitud solo crea
          la campaña en configuración — debes iniciarla aquí para que arranque el conteo.
        </p>
      </div>

      {/* Resumen */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Por iniciar"     count={enConfig.length}    tone="warning" />
        <Stat label="Activas"         count={activos.length}     tone="success" />
        <Stat label="Pausadas"        count={pausados.length}    tone="muted"   />
        <Stat label="Finalizadas"     count={finalizados.length} tone="muted"   />
      </div>

      {!orden.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
          <Megaphone size={40} className="mb-4 text-muted-foreground/30" />
          <p className="text-base font-medium">Aún no hay campañas</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Cuando un cliente solicite un plan y la apruebes, la campaña aparecerá aquí lista
            para iniciar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orden.map((c) => {
            const cfg         = estadoConfig[c.estado]
            const plan        = c.plans
            const cliente     = c.profiles
            const isActive    = c.estado === 'activo'
            const isConfig    = c.estado === 'en_configuracion'

            return (
              <div
                key={c.id}
                className={cn(
                  'overflow-hidden rounded-xl border bg-card transition-colors',
                  isActive ? 'border-primary/30' :
                  isConfig ? 'border-warning/40' :
                             'border-border',
                )}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                  {/* Imagen plan */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted/30">
                    {plan?.imagen_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={plan.imagen_url} alt={plan.nombre ?? ''}
                        className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Layers size={24} className="text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Info principal */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {plan ? getCategoriaLabel(plan.categoria) : 'Plan'}
                        </p>
                        <p className="text-sm font-semibold">{plan?.nombre ?? 'Plan'}</p>
                      </div>
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.className)}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Cliente */}
                    {cliente && (
                      <Link
                        href={`/admin/clientes/${cliente.user_id}`}
                        className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
                      >
                        <User size={11} />
                        <span className="font-medium text-foreground/90 group-hover:text-primary">
                          {cliente.nombre}
                        </span>
                        {cliente.empresa && <span>· {cliente.empresa}</span>}
                      </Link>
                    )}

                    {/* Fechas y countdown */}
                    {isActive && c.fecha_fin && (
                      <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-primary/80">
                          <Hourglass size={10} />
                          Tiempo restante
                        </div>
                        <CountdownTimer
                          fechaFin={c.fecha_fin}
                          className="mt-0.5 text-base font-bold"
                        />
                      </div>
                    )}

                    {(c.fecha_inicio || c.fecha_fin) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {c.fecha_inicio && (
                          <span className="flex items-center gap-1">
                            <CalendarDays size={11} />
                            Inicio: <span className="text-foreground/80">{formatDate(c.fecha_inicio)}</span>
                          </span>
                        )}
                        {c.fecha_fin && (
                          <span className="flex items-center gap-1">
                            <CalendarDays size={11} />
                            Fin: <span className="text-foreground/80">{formatDate(c.fecha_fin)}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {isConfig && c.duracion_dias && (
                      <p className="text-xs text-muted-foreground">
                        Duración acordada:{' '}
                        <span className="text-foreground">{c.duracion_dias} días</span>
                      </p>
                    )}

                    {c.notas && (
                      <p className="text-xs italic text-muted-foreground">{c.notas}</p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex w-full shrink-0 flex-col gap-2 sm:w-56">
                    {isConfig ? (
                      <ActivarCampanaButton
                        id={c.id}
                        defaultDuracion={c.duracion_dias}
                      />
                    ) : (
                      <EstadoCampanaSelect id={c.id} current={c.estado} />
                    )}
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

function Stat({
  label, count, tone,
}: {
  label: string
  count: number
  tone: 'success' | 'warning' | 'muted'
}) {
  const cls =
    tone === 'success' ? 'border-success/30 bg-success/5 text-success' :
    tone === 'warning' ? 'border-warning/30 bg-warning/5 text-warning' :
                         'border-border bg-card text-foreground'

  return (
    <div className={cn('rounded-xl border p-4', cls)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{count}</p>
    </div>
  )
}
