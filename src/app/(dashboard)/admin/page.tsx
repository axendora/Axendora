import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Package, MessageSquare, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SolicitudEstado, SolicitudTipo, SolicitudPrioridad } from '@/types/database.types'

const estadoConfig: Record<SolicitudEstado, { label: string; className: string }> = {
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

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

export default async function AdminDashboardPage() {
  const supabase = await createServiceClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [
    { count: totalClientes },
    { count: serviciosActivos },
    { count: solicitudesAbiertas },
    { count: solicitudesEnProceso },
    { data: solicitudesRecientes },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('client_services').select('id', { count: 'exact', head: true }).eq('estado', 'activo'),
    supabase.from('solicitudes').select('id', { count: 'exact', head: true }).eq('estado', 'abierta'),
    supabase.from('solicitudes').select('id', { count: 'exact', head: true }).eq('estado', 'en_proceso'),
    supabase
      .from('solicitudes')
      .select('id, titulo, tipo, estado, prioridad, created_at')
      .in('estado', ['abierta', 'en_proceso'])
      .order('prioridad', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const stats = [
    { label: 'Clientes registrados', value: totalClientes ?? 0,      icon: Users,         href: '/admin/clientes',     color: 'text-primary' },
    { label: 'Servicios activos',    value: serviciosActivos ?? 0,    icon: Package,       href: '/admin/clientes',     color: 'text-success' },
    { label: 'Solicitudes abiertas', value: solicitudesAbiertas ?? 0, icon: MessageSquare, href: '/admin/solicitudes',  color: 'text-warning' },
    { label: 'En proceso',           value: solicitudesEnProceso ?? 0,icon: Clock,         href: '/admin/solicitudes',  color: 'text-primary' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Panel de administración</h1>
        <p className="mt-1 text-sm text-muted-foreground">Resumen general de Axendora.</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="rounded-lg bg-primary/10 p-2">
                <stat.icon size={16} className={stat.color} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Solicitudes pendientes */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Solicitudes pendientes</h2>
          <Link
            href="/admin/solicitudes"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>

        {!solicitudesRecientes?.length ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle size={18} className="text-success" />
              Sin solicitudes pendientes
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {solicitudesRecientes.map((s) => {
              const estado = estadoConfig[s.estado as SolicitudEstado]
              const prioridad = prioridadConfig[s.prioridad as SolicitudPrioridad]
              return (
                <Link
                  key={s.id}
                  href={`/admin/solicitudes/${s.id}`}
                  className="flex flex-col gap-1.5 px-5 py-3.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {tipoLabel[s.tipo as SolicitudTipo]} · {formatDate(s.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={cn('text-xs font-medium', prioridad.className)}>
                      {prioridad.label}
                    </span>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', estado.className)}>
                      {estado.label}
                    </span>
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
