import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  SolicitudEstado,
  SolicitudTipo,
  SolicitudPrioridad,
  PlanCategoria,
  TipoPrecio,
} from '@/types/database.types'
import { UpdateSolicitudForm } from './_components/update-solicitud-form'
import { ApproveRejectPanel } from './_components/approve-reject-panel'
import { buttonVariants } from '@/components/ui/button'
import { getCategoriaLabel, formatUSD, formatCOP, tipoPrecioLabel } from '@/lib/plans'

const estadoConfig: Record<SolicitudEstado, { label: string; className: string }> = {
  abierta:    { label: 'Abierta',    className: 'bg-primary/10 text-primary' },
  en_proceso: { label: 'En proceso', className: 'bg-warning/10 text-warning' },
  resuelta:   { label: 'Resuelta',   className: 'bg-success/10 text-success' },
  cerrada:    { label: 'Cerrada',    className: 'bg-muted text-muted-foreground' },
  aprobada:   { label: 'Aprobada',   className: 'bg-success/10 text-success' },
  rechazada:  { label: 'Rechazada',  className: 'bg-error/10 text-error' },
}

const prioridadConfig: Record<SolicitudPrioridad, { label: string; className: string }> = {
  baja:  { label: 'Baja',  className: 'bg-muted text-muted-foreground' },
  media: { label: 'Media', className: 'bg-warning/10 text-warning' },
  alta:  { label: 'Alta',  className: 'bg-error/10 text-error' },
}

const tipoLabel: Record<SolicitudTipo, string> = {
  soporte: 'Soporte', consulta: 'Consulta', cambio: 'Cambio', plan: 'Plan', otro: 'Otro',
}

function formatFechaHora(iso: string) {
  const d = new Date(iso)
  const fecha = new Intl.DateTimeFormat('es', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(d)
  const hora = new Intl.DateTimeFormat('es', {
    hour: '2-digit', minute: '2-digit',
  }).format(d)
  return { fecha, hora }
}

export default async function SolicitudDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: solicitud }, { data: planes }] = await Promise.all([
    supabase.from('solicitudes').select('*').eq('id', id).single(),
    supabase
      .from('plans')
      .select('id, nombre, categoria, tipo_precio, precio_usd, precio_cop, duracion_dias')
      .eq('activo', true)
      .order('nombre'),
  ])

  if (!solicitud) notFound()

  const [{ data: cliente }, { data: planSolicitado }] = await Promise.all([
    supabase
      .from('profiles')
      .select('nombre, email, user_id, empresa, telefono')
      .eq('user_id', solicitud.client_id)
      .single(),
    solicitud.plan_id
      ? supabase
          .from('plans')
          .select('id, nombre, categoria, tipo_precio, precio_usd, precio_cop, duracion_dias, imagen_url')
          .eq('id', solicitud.plan_id)
          .single()
      : Promise.resolve({ data: null }),
  ])

  const estado    = estadoConfig[solicitud.estado as SolicitudEstado]
  const prioridad = prioridadConfig[solicitud.prioridad as SolicitudPrioridad]
  const { fecha, hora } = formatFechaHora(solicitud.created_at)

  const esSolicitudPlan = solicitud.tipo === 'plan'
  const estadoPendiente = solicitud.estado === 'abierta' || solicitud.estado === 'en_proceso'
  const mostrarPanel    = esSolicitudPlan && estadoPendiente

  const plan = planSolicitado as {
    id: string
    nombre: string
    categoria: PlanCategoria
    tipo_precio: TipoPrecio
    precio_usd: number | null
    precio_cop: number | null
    duracion_dias: number | null
    imagen_url: string | null
  } | null

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/solicitudes"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5')}
        >
          <ArrowLeft size={15} />
          Solicitudes
        </Link>
      </div>

      {/* Solicitud info */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-serif text-xl font-semibold">{solicitud.titulo}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {tipoLabel[solicitud.tipo as SolicitudTipo]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', prioridad.className)}>
              {prioridad.label}
            </span>
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', estado.className)}>
              {estado.label}
            </span>
          </div>
        </div>

        {/* Fecha y hora destacada */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar size={12} className="text-primary" />
            <span className="font-medium text-foreground">{fecha}</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={12} className="text-primary" />
            <span className="font-medium text-foreground">{hora}</span>
          </span>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {solicitud.descripcion}
          </p>
        </div>

        {/* Plan solicitado */}
        {plan && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted/30">
                {plan.imagen_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={plan.imagen_url}
                    alt={plan.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package size={18} className="text-primary/40" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wide text-primary/70">
                  Plan solicitado
                </p>
                <p className="text-sm font-semibold">{plan.nombre}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {getCategoriaLabel(plan.categoria)}
                  {plan.precio_usd ? ` · ${formatUSD(plan.precio_usd)} ${tipoPrecioLabel(plan.tipo_precio)}` : ''}
                  {plan.precio_cop && !plan.precio_usd ? ` · ${formatCOP(plan.precio_cop)} ${tipoPrecioLabel(plan.tipo_precio)}` : ''}
                </p>
                {plan.duracion_dias && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Duración por defecto:{' '}
                    <span className="text-foreground">{plan.duracion_dias} días</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Motivo de rechazo */}
        {solicitud.estado === 'rechazada' && solicitud.motivo_rechazo && (
          <div className="border-t border-border pt-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Motivo del rechazo</p>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">
              {solicitud.motivo_rechazo}
            </p>
          </div>
        )}

        {/* Client info */}
        {cliente && (
          <div className="border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Cliente</p>
            <Link
              href={`/admin/clientes/${cliente.user_id}`}
              className="flex items-center gap-3 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                {cliente.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium group-hover:text-primary transition-colors">
                  {cliente.nombre}
                </p>
                <p className="truncate text-xs text-muted-foreground">{cliente.email}</p>
                {(cliente.empresa || cliente.telefono) && (
                  <p className="truncate text-xs text-muted-foreground">
                    {cliente.empresa}
                    {cliente.empresa && cliente.telefono ? ' · ' : ''}
                    {cliente.telefono}
                  </p>
                )}
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Panel de aprobación/rechazo — solo para solicitudes de tipo plan pendientes */}
      {mostrarPanel && (
        <ApproveRejectPanel
          solicitudId={solicitud.id}
          preselectedPlanId={solicitud.plan_id ?? null}
          planes={planes ?? []}
        />
      )}

      {/* Update form — estado y prioridad */}
      <UpdateSolicitudForm
        id={solicitud.id}
        currentEstado={solicitud.estado as SolicitudEstado}
        currentPrioridad={solicitud.prioridad as SolicitudPrioridad}
      />
    </div>
  )
}
