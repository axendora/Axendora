import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Package,
  MessageSquare,
  CheckCircle,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  SolicitudEstado,
  SolicitudTipo,
  SolicitudPrioridad,
  ServiceEstado,
} from '@/types/database.types'
import { KpiCard } from '@/components/admin/kpi-card'

type ServicioItem = {
  id: string
  estado: ServiceEstado
  fecha_inicio: string | null
  fecha_fin: string | null
  services: {
    nombre: string
    descripcion: string | null
    imagen_url: string | null
  } | null
}

const estadoConfig: Record<SolicitudEstado, { label: string; className: string }> = {
  abierta:    { label: 'Abierta',    className: 'bg-[#14A8B6]/10 text-[#14A8B6]' },
  en_proceso: { label: 'En proceso', className: 'bg-[#F59E0B]/10 text-[#F59E0B]' },
  resuelta:   { label: 'Resuelta',   className: 'bg-[#10B981]/10 text-[#10B981]' },
  cerrada:    { label: 'Cerrada',    className: 'bg-[#27272A] text-[#71717A]' },
}

const servicioEstadoConfig: Record<ServiceEstado, { label: string; className: string }> = {
  en_configuracion: { label: 'Configurando', className: 'bg-[#F59E0B]/10 text-[#F59E0B]' },
  activo:           { label: 'Activo',        className: 'bg-[#10B981]/10 text-[#10B981]' },
  pausado:          { label: 'Pausado',       className: 'bg-[#27272A] text-[#71717A]'   },
  finalizado:       { label: 'Finalizado',    className: 'bg-[#27272A] text-[#71717A]'   },
}

const tipoLabel: Record<SolicitudTipo, string> = {
  soporte: 'Soporte', consulta: 'Consulta', cambio: 'Cambio', otro: 'Otro',
}

const prioridadConfig: Record<SolicitudPrioridad, { label: string; className: string }> = {
  baja:  { label: 'Baja',  className: 'text-[#71717A]' },
  media: { label: 'Media', className: 'text-[#F59E0B]' },
  alta:  { label: 'Alta',  className: 'text-[#EF4444]' },
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

export default async function ClienteDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { count: serviciosActivos },
    { count: serviciosTotales },
    { count: solicitudesAbiertas },
    { count: solicitudesResueltas },
    { data: solicitudesRecientes },
    { data: serviciosDetalle },
  ] = await Promise.all([
    supabase.from('profiles').select('nombre').eq('user_id', user.id).single(),
    supabase.from('client_services').select('id', { count: 'exact', head: true }).eq('client_id', user.id).eq('estado', 'activo'),
    supabase.from('client_services').select('id', { count: 'exact', head: true }).eq('client_id', user.id),
    supabase.from('solicitudes').select('id', { count: 'exact', head: true }).eq('client_id', user.id).in('estado', ['abierta', 'en_proceso']),
    supabase.from('solicitudes').select('id', { count: 'exact', head: true }).eq('client_id', user.id).eq('estado', 'resuelta'),
    supabase.from('solicitudes').select('id, titulo, tipo, estado, prioridad, created_at').eq('client_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('client_services').select('id, estado, fecha_inicio, fecha_fin, services(nombre, descripcion, imagen_url)').eq('client_id', user.id).in('estado', ['activo', 'en_configuracion']).order('created_at', { ascending: false }).limit(3).returns<ServicioItem[]>(),
  ])

  const firstName = profile?.nombre?.split(' ')[0] ?? 'Usuario'

  const kpis = [
    {
      label: 'Servicios activos',
      value: serviciosActivos ?? 0,
      iconNode: <Package size={18} className="text-[#14A8B6]" />,
      href: '/cliente/servicios',
    },
    {
      label: 'Total contratados',
      value: serviciosTotales ?? 0,
      iconNode: <ShoppingBag size={18} className="text-[#14A8B6]" />,
      href: '/cliente/servicios',
    },
    {
      label: 'Solicitudes abiertas',
      value: solicitudesAbiertas ?? 0,
      iconNode: <MessageSquare size={18} className="text-[#14A8B6]" />,
      href: '/cliente/solicitudes',
    },
    {
      label: 'Casos resueltos',
      value: solicitudesResueltas ?? 0,
      iconNode: <CheckCircle size={18} className="text-[#14A8B6]" />,
      href: '/cliente/solicitudes',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Hola, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            Este es el resumen de tu actividad con Axendora.
          </p>
        </div>
        <Link
          href="/cliente/solicitudes/nueva"
          className="flex w-fit items-center gap-2 rounded-xl bg-[#14A8B6] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0F8A95]"
        >
          <Sparkles size={15} />
          Solicitar servicio
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            iconNode={kpi.iconNode}
            href={kpi.href}
            index={i}
          />
        ))}
      </div>

      {/* Active services */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-white">Servicios activos</h2>
          <Link
            href="/cliente/servicios"
            className="flex items-center gap-1 text-xs text-[#14A8B6] hover:underline"
          >
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>

        {!serviciosDetalle?.length ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#27272A] bg-[#121212] py-14 text-center">
            <Package size={36} className="mb-3 text-[#27272A]" />
            <p className="text-base font-medium text-white">Aún no tienes servicios activos</p>
            <p className="mt-1 max-w-xs text-sm text-[#A1A1AA]">
              Solicita un servicio y nuestro equipo lo activará en breve.
            </p>
            <Link
              href="/cliente/solicitudes/nueva"
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#14A8B6] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0F8A95]"
            >
              <Sparkles size={15} />
              Solicitar primer servicio
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviciosDetalle.map((s) => {
              const estadoServ = servicioEstadoConfig[s.estado as ServiceEstado]
              return (
                <div
                  key={s.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-[#27272A] bg-[#121212] transition-colors hover:border-[#14A8B6]/30"
                >
                  <div className="aspect-video w-full overflow-hidden bg-[#1A1A1A]">
                    {s.services?.imagen_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.services.imagen_url}
                        alt={s.services.nombre ?? ''}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package size={32} className="text-[#27272A]" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium leading-tight text-white">
                        {s.services?.nombre ?? '—'}
                      </p>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                          estadoServ.className,
                        )}
                      >
                        {estadoServ.label}
                      </span>
                    </div>
                    {s.fecha_inicio && (
                      <p className="mt-2 text-xs text-[#71717A]">
                        Desde {formatShortDate(s.fecha_inicio)}
                      </p>
                    )}
                    <Link
                      href="/cliente/servicios"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#14A8B6] hover:underline"
                    >
                      Ver detalles <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              )
            })}

            {/* Add new service card */}
            <Link
              href="/cliente/solicitudes/nueva"
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#14A8B6]/30 bg-[#121212] p-8 text-center transition-all hover:border-[#14A8B6] hover:bg-[#14A8B6]/5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#14A8B6]/10">
                <Sparkles size={20} className="text-[#14A8B6]" />
              </div>
              <p className="text-sm font-medium text-[#14A8B6]">+ Solicitar nuevo servicio</p>
              <p className="mt-1 text-xs text-[#71717A]">Nuestro equipo te contactará pronto</p>
            </Link>
          </div>
        )}
      </div>

      {/* Recent solicitudes */}
      <div className="rounded-xl border border-[#27272A] bg-[#121212]">
        <div className="flex items-center justify-between border-b border-[#27272A] px-6 py-4">
          <h2 className="font-semibold text-white">Solicitudes recientes</h2>
          <Link
            href="/cliente/solicitudes"
            className="flex items-center gap-1 text-xs text-[#14A8B6] hover:underline"
          >
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>

        {!solicitudesRecientes?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare size={32} className="mb-3 text-[#27272A]" />
            <p className="text-sm text-[#71717A]">Aún no tienes solicitudes.</p>
            <Link
              href="/cliente/solicitudes/nueva"
              className="mt-3 text-sm text-[#14A8B6] hover:underline"
            >
              Crear primera solicitud
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#27272A]">
            {solicitudesRecientes.map((s) => {
              const estado = estadoConfig[s.estado as SolicitudEstado]
              const prioridad = prioridadConfig[s.prioridad as SolicitudPrioridad]
              return (
                <div key={s.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{s.titulo}</p>
                    <p className="text-xs text-[#71717A]">
                      {tipoLabel[s.tipo as SolicitudTipo]} · {formatDate(s.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={cn('text-xs font-medium', prioridad.className)}>
                      {prioridad.label}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        estado.className,
                      )}
                    >
                      {estado.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* CTA Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#14A8B6]/20 bg-[#121212] p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A6670]/25 via-transparent to-transparent" />
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-white">¿Quieres potenciar tus resultados?</h3>
          <p className="mt-1 max-w-md text-sm text-[#A1A1AA]">
            Habla con tu asesor de Axendora y descubre qué más podemos hacer por tu negocio.
          </p>
          <Link
            href="/cliente/solicitudes/nueva"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#14A8B6] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0F8A95]"
          >
            <Sparkles size={15} />
            Habla con tu asesor
          </Link>
        </div>
      </div>
    </div>
  )
}
