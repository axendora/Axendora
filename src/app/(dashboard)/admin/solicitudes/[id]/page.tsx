import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SolicitudEstado, SolicitudTipo, SolicitudPrioridad } from '@/types/database.types'
import { UpdateSolicitudForm } from './_components/update-solicitud-form'
import { ApproveRejectPanel } from './_components/approve-reject-panel'
import { buttonVariants } from '@/components/ui/button'

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

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
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

  const { data: cliente } = await supabase
    .from('profiles')
    .select('nombre, email, user_id')
    .eq('user_id', solicitud.client_id)
    .single()

  const estado    = estadoConfig[solicitud.estado as SolicitudEstado]
  const prioridad = prioridadConfig[solicitud.prioridad as SolicitudPrioridad]

  const esSolicitudPlan   = solicitud.tipo === 'plan'
  const estadoPendiente   = solicitud.estado === 'abierta' || solicitud.estado === 'en_proceso'
  const mostrarPanel      = esSolicitudPlan && estadoPendiente

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
              {tipoLabel[solicitud.tipo as SolicitudTipo]} · {formatDate(solicitud.created_at)}
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

        <div className="border-t border-border pt-4">
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {solicitud.descripcion}
          </p>
        </div>

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
              className="flex items-center gap-2 group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                {cliente.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium group-hover:text-primary transition-colors">
                  {cliente.nombre}
                </p>
                <p className="text-xs text-muted-foreground">{cliente.email}</p>
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
