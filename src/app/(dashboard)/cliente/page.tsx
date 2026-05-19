import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, MessageSquare, CheckCircle, Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SolicitudEstado, SolicitudTipo, SolicitudPrioridad } from '@/types/database.types'

const estadoConfig: Record<SolicitudEstado, { label: string; className: string }> = {
  abierta:    { label: 'Abierta',     className: 'bg-primary/10 text-primary' },
  en_proceso: { label: 'En proceso',  className: 'bg-warning/10 text-warning' },
  resuelta:   { label: 'Resuelta',    className: 'bg-success/10 text-success' },
  cerrada:    { label: 'Cerrada',     className: 'bg-muted text-muted-foreground' },
}

const tipoLabel: Record<SolicitudTipo, string> = {
  soporte:  'Soporte',
  consulta: 'Consulta',
  cambio:   'Cambio',
  otro:     'Otro',
}

const prioridadConfig: Record<SolicitudPrioridad, { label: string; className: string }> = {
  baja:  { label: 'Baja',  className: 'text-muted-foreground' },
  media: { label: 'Media', className: 'text-warning' },
  alta:  { label: 'Alta',  className: 'text-error' },
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
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
    { count: solicitudesAbiertas },
    { count: solicitudesResueltas },
    { data: solicitudesRecientes },
  ] = await Promise.all([
    supabase.from('profiles').select('nombre').eq('user_id', user.id).single(),
    supabase.from('client_services').select('id', { count: 'exact', head: true }).eq('client_id', user.id).eq('estado', 'activo'),
    supabase.from('solicitudes').select('id', { count: 'exact', head: true }).eq('client_id', user.id).eq('estado', 'abierta'),
    supabase.from('solicitudes').select('id', { count: 'exact', head: true }).eq('client_id', user.id).eq('estado', 'resuelta'),
    supabase.from('solicitudes').select('id, titulo, tipo, estado, prioridad, created_at').eq('client_id', user.id).order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Servicios activos',      value: serviciosActivos ?? 0, icon: Package,       href: '/cliente/servicios' },
    { label: 'Solicitudes abiertas',   value: solicitudesAbiertas ?? 0, icon: MessageSquare, href: '/cliente/solicitudes' },
    { label: 'Solicitudes resueltas',  value: solicitudesResueltas ?? 0, icon: CheckCircle,   href: '/cliente/solicitudes' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl">
            Bienvenido, {profile?.nombre?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aquí tienes un resumen de tu actividad.
          </p>
        </div>
        <Link
          href="/cliente/solicitudes/nueva"
          className={cn(buttonVariants({ size: 'sm' }), 'h-9 gap-2')}
        >
          <Plus size={15} />
          Nueva solicitud
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="rounded-lg bg-primary/10 p-2">
                <stat.icon size={16} className="text-primary" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Solicitudes recientes */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Solicitudes recientes</h2>
          <Link
            href="/cliente/solicitudes"
            className="text-xs text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {!solicitudesRecientes?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare size={32} className="mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Aún no tienes solicitudes.</p>
            <Link
              href="/cliente/solicitudes/nueva"
              className="mt-3 text-sm text-primary hover:underline"
            >
              Crear primera solicitud
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {solicitudesRecientes.map((s) => {
              const estado = estadoConfig[s.estado as SolicitudEstado]
              const prioridad = prioridadConfig[s.prioridad as SolicitudPrioridad]
              return (
                <div
                  key={s.id}
                  className="flex flex-col gap-1.5 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
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
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
