import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Calendar, Phone, Globe, MapPin, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { waLink } from '@/lib/countries'
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon'
import { CountdownTimer } from '@/components/dashboard/countdown-timer'
import type { ServiceEstado, SolicitudEstado, SolicitudTipo, SolicitudPrioridad } from '@/types/database.types'
import { AssignServiceForm } from './_components/assign-service-form'
import { updateClientServiceEstadoAction } from './actions'
import { buttonVariants } from '@/components/ui/button'

type ClientServiceRow = {
  id: string
  estado: ServiceEstado
  fecha_inicio: string | null
  fecha_fin:    string | null
  notas: string | null
  services: { nombre: string; descripcion: string | null; imagen_url: string | null } | null
}

const serviceEstadoConfig: Record<ServiceEstado, { label: string; className: string }> = {
  en_configuracion: { label: 'En configuración', className: 'bg-primary/10 text-primary' },
  activo:           { label: 'Activo',            className: 'bg-success/10 text-success' },
  pausado:          { label: 'Pausado',           className: 'bg-warning/10 text-warning' },
  finalizado:       { label: 'Finalizado',        className: 'bg-muted text-muted-foreground' },
}

const solicitudEstadoConfig: Record<SolicitudEstado, { label: string; className: string }> = {
  abierta:    { label: 'Abierta',    className: 'bg-primary/10 text-primary' },
  en_proceso: { label: 'En proceso', className: 'bg-warning/10 text-warning' },
  resuelta:   { label: 'Resuelta',   className: 'bg-success/10 text-success' },
  cerrada:    { label: 'Cerrada',    className: 'bg-muted text-muted-foreground' },
}

const tipoLabel: Record<SolicitudTipo, string> = {
  soporte: 'Soporte', consulta: 'Consulta', cambio: 'Cambio', otro: 'Otro',
}

const prioridadConfig: Record<SolicitudPrioridad, { label: string; className: string }> = {
  baja:  { label: 'Baja',  className: 'text-muted-foreground' },
  media: { label: 'Media', className: 'text-warning' },
  alta:  { label: 'Alta',  className: 'text-error' },
}

const serviceEstadoOptions: { value: ServiceEstado; label: string }[] = [
  { value: 'en_configuracion', label: 'En configuración' },
  { value: 'activo',           label: 'Activo' },
  { value: 'pausado',          label: 'Pausado' },
  { value: 'finalizado',       label: 'Finalizado' },
]

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: userId } = await params
  const supabase = await createClient()

  const [
    { data: profile },
    { data: clientServicesRaw },
    { data: solicitudes },
    { data: availableServices },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).single(),
    supabase
      .from('client_services')
      .select('id, estado, fecha_inicio, fecha_fin, notas, services(nombre, descripcion, imagen_url)')
      .eq('client_id', userId)
      .order('created_at', { ascending: false })
      .returns<ClientServiceRow[]>(),
    supabase
      .from('solicitudes')
      .select('id, titulo, tipo, estado, prioridad, created_at')
      .eq('client_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('services').select('id, nombre, duracion_dias').eq('activo', true),
  ])

  if (!profile) notFound()

  return (
    <div className="space-y-8">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <Link
          href="/admin/clientes"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'mt-0.5 shrink-0 gap-1.5')}
        >
          <ArrowLeft size={15} />
          Volver
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-base font-semibold text-primary">
              {profile.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-xl font-semibold sm:text-2xl">{profile.nombre}</h1>
              {profile.empresa && (
                <p className="text-sm text-muted-foreground">{profile.empresa}</p>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Mail size={11} />{profile.email}</span>
                {profile.telefono && <span className="flex items-center gap-1"><Phone size={11} />{profile.telefono}</span>}
                {profile.ciudad && <span className="flex items-center gap-1"><MapPin size={11} />{profile.ciudad}{profile.pais ? `, ${profile.pais}` : ''}</span>}
                {profile.website && (
                  <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline">
                    <Globe size={11} />{profile.website}
                  </a>
                )}
                <span className="flex items-center gap-1"><Calendar size={11} />Desde {new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(profile.created_at))}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {(profile.whatsapp || profile.telefono) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.whatsapp && (
                <a href={waLink(profile.whatsapp)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#25D366]/40 bg-[#25D366]/10 px-3 py-1.5 text-xs font-medium text-[#25D366] transition-colors hover:bg-[#25D366]/20">
                  <WhatsAppIcon size={13} />
                  WhatsApp · {profile.whatsapp}
                </a>
              )}
              {profile.telefono && (
                <a href={`tel:${profile.telefono}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20">
                  <Phone size={13} />
                  Llamar · {profile.telefono}
                </a>
              )}
            </div>
          )}

          {profile.notas_internas && (
            <div className="mt-4 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Notas internas:</span> {profile.notas_internas}
            </div>
          )}
        </div>
      </div>

      {/* Servicios contratados */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Servicios contratados</h2>
          <AssignServiceForm clientId={userId} availableServices={availableServices ?? []} />
        </div>

        {!clientServicesRaw?.length ? (
          <div className="rounded-xl border border-border bg-card py-10 text-center">
            <p className="text-sm text-muted-foreground">Sin servicios asignados.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clientServicesRaw.map((cs) => {
              const estadoCfg = serviceEstadoConfig[cs.estado]
              return (
                <div key={cs.id}
                  className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Image + info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted/30">
                        {cs.services?.imagen_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cs.services.imagen_url} alt={cs.services.nombre ?? ''}
                            className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package size={20} className="text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{cs.services?.nombre ?? '—'}</p>
                        {cs.services?.descripcion && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{cs.services.descripcion}</p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {cs.fecha_inicio && <span>Inicio: {formatDate(cs.fecha_inicio)}</span>}
                          {cs.fecha_fin && <span>Vence: {formatDate(cs.fecha_fin)}</span>}
                        </div>
                        {/* Live countdown */}
                        {cs.fecha_fin && cs.estado !== 'finalizado' && (
                          <div className="mt-1.5">
                            <CountdownTimer fechaFin={cs.fecha_fin} />
                          </div>
                        )}
                        {cs.notas && (
                          <p className="mt-1 text-xs text-muted-foreground italic">{cs.notas}</p>
                        )}
                      </div>
                    </div>

                    {/* Estado control */}
                    <form action={updateClientServiceEstadoAction}
                      className="flex shrink-0 items-center gap-2">
                      <input type="hidden" name="id" value={cs.id} />
                      <input type="hidden" name="clientId" value={userId} />
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', estadoCfg.className)}>
                        {estadoCfg.label}
                      </span>
                      <select name="estado" defaultValue={cs.estado}
                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30">
                        {serviceEstadoOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <button type="submit"
                        className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'h-7 px-2 text-xs')}>
                        Guardar
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Solicitudes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Solicitudes</h2>
          <Link href={`/admin/solicitudes?cliente=${userId}`} className="text-xs text-primary hover:underline">
            Ver todas
          </Link>
        </div>

        {!solicitudes?.length ? (
          <div className="rounded-xl border border-border bg-card py-10 text-center">
            <p className="text-sm text-muted-foreground">Sin solicitudes registradas.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {solicitudes.map((s) => {
              const estado = solicitudEstadoConfig[s.estado as SolicitudEstado]
              const prioridad = prioridadConfig[s.prioridad as SolicitudPrioridad]
              return (
                <Link key={s.id} href={`/admin/solicitudes/${s.id}`}
                  className="flex flex-col gap-1.5 px-5 py-3.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {tipoLabel[s.tipo as SolicitudTipo]} · {new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(s.created_at))}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={cn('text-xs font-medium', prioridad.className)}>{prioridad.label}</span>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', estado.className)}>{estado.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
