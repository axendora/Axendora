import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
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
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

const filterTabs: { value: string; label: string }[] = [
  { value: 'all',        label: 'Todas' },
  { value: 'abierta',    label: 'Abiertas' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'resuelta',   label: 'Resueltas' },
  { value: 'cerrada',    label: 'Cerradas' },
]

export default async function AdminSolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; cliente?: string }>
}) {
  const { estado: estadoFilter, cliente: clienteFilter } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('solicitudes')
    .select('id, titulo, tipo, estado, prioridad, created_at, client_id')
    .order('created_at', { ascending: false })

  if (estadoFilter && estadoFilter !== 'all') {
    query = query.eq('estado', estadoFilter as SolicitudEstado)
  }
  if (clienteFilter) {
    query = query.eq('client_id', clienteFilter)
  }

  const { data: solicitudes } = await query.limit(50)

  const activeFilter = estadoFilter ?? 'all'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Solicitudes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {solicitudes?.length ?? 0} solicitud{solicitudes?.length !== 1 ? 'es' : ''}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1.5">
        {filterTabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/solicitudes?estado=${tab.value}`}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              activeFilter === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* List */}
      <div className="rounded-xl border border-border bg-card">
        {!solicitudes?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare size={32} className="mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No hay solicitudes en esta categoría.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {solicitudes.map((s) => {
              const estado = estadoConfig[s.estado as SolicitudEstado]
              const prioridad = prioridadConfig[s.prioridad as SolicitudPrioridad]
              return (
                <Link
                  key={s.id}
                  href={`/admin/solicitudes/${s.id}`}
                  className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
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
