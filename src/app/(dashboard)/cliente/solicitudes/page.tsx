import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Plus } from 'lucide-react'
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

export default async function SolicitudesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: solicitudes } = await supabase
    .from('solicitudes')
    .select('id, titulo, tipo, estado, prioridad, created_at')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Solicitudes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Historial de tus solicitudes al equipo de Axendora.
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

      {!solicitudes?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <MessageSquare size={40} className="mb-4 text-muted-foreground/30" />
          <p className="text-base font-medium">Aún no tienes solicitudes</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea una solicitud para ponerte en contacto con el equipo.
          </p>
          <Link
            href="/cliente/solicitudes/nueva"
            className={cn(buttonVariants({ size: 'sm' }), 'mt-6 gap-2')}
          >
            <Plus size={15} />
            Crear primera solicitud
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          {/* Encabezado tabla */}
          <div className="hidden grid-cols-[1fr_120px_110px_90px_110px] gap-4 border-b border-border px-5 py-3 text-xs font-medium text-muted-foreground sm:grid">
            <span>Solicitud</span>
            <span>Tipo</span>
            <span>Prioridad</span>
            <span>Estado</span>
            <span>Fecha</span>
          </div>

          <div className="divide-y divide-border">
            {solicitudes.map((s) => {
              const estado = estadoConfig[s.estado as SolicitudEstado]
              const prioridad = prioridadConfig[s.prioridad as SolicitudPrioridad]
              return (
                <div
                  key={s.id}
                  className="flex flex-col gap-2 px-5 py-4 sm:grid sm:grid-cols-[1fr_120px_110px_90px_110px] sm:items-center sm:gap-4"
                >
                  <p className="text-sm font-medium">{s.titulo}</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    {tipoLabel[s.tipo as SolicitudTipo]}
                  </p>
                  <p className={cn('text-xs font-medium sm:text-sm', prioridad.className)}>
                    {prioridad.label}
                  </p>
                  <span className={cn('w-fit rounded-full px-2.5 py-0.5 text-xs font-medium', estado.className)}>
                    {estado.label}
                  </span>
                  <p className="text-xs text-muted-foreground">{formatDate(s.created_at)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
