import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CountdownTimer } from '@/components/dashboard/countdown-timer'
import type { ServiceEstado } from '@/types/database.types'

type ClientServiceRow = {
  id: string
  estado: ServiceEstado
  fecha_inicio: string | null
  fecha_fin: string | null
  notas: string | null
  services: { nombre: string; descripcion: string | null; imagen_url: string | null } | null
  plans:    { nombre: string; descripcion: string | null; imagen_url: string | null } | null
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
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

export default async function ServiciosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: servicios } = await supabase
    .from('client_services')
    .select('id, estado, fecha_inicio, fecha_fin, notas, services(nombre, descripcion, imagen_url), plans(nombre, descripcion, imagen_url)')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })
    .returns<ClientServiceRow[]>()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Mis Servicios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Servicios contratados con Axendora.
        </p>
      </div>

      {!servicios?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <Package size={40} className="mb-4 text-muted-foreground/30" />
          <p className="text-base font-medium">Aún no tienes servicios contratados</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Contáctanos para comenzar con el servicio que mejor se adapte a tu negocio.
          </p>
          <Link href="/#contacto"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-6')}>
            Contactar a Axendora
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((s) => {
            const estado  = estadoConfig[s.estado as ServiceEstado]
            const subject = s.plans ?? s.services
            const isPlan  = !!s.plans
            const isActive = s.estado === 'activo'
            return (
              <div key={s.id}
                className={cn(
                  'flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors',
                  isActive ? 'border-primary/30' : 'border-border',
                )}>
                {/* Service image */}
                <div className="aspect-square w-full overflow-hidden bg-muted/30">
                  {subject?.imagen_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={subject.imagen_url} alt={subject.nombre ?? ''}
                      className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package size={48} className="text-muted-foreground/20" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold leading-tight">{subject?.nombre ?? '—'}</h3>
                      {isPlan && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                          Plan
                        </span>
                      )}
                    </div>
                    <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', estado.className)}>
                      {estado.label}
                    </span>
                  </div>

                  {subject?.descripcion && (
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                      {subject.descripcion}
                    </p>
                  )}

                  {/* Countdown — prominent when active */}
                  {s.fecha_fin && s.estado !== 'finalizado' && (
                    <div className="mt-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                      <p className="mb-1 text-xs text-muted-foreground">Tiempo restante</p>
                      <CountdownTimer fechaFin={s.fecha_fin} className="text-sm font-bold" />
                    </div>
                  )}

                  {/* Dates */}
                  <div className="mt-4 space-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
                    {s.fecha_inicio && (
                      <div className="flex justify-between">
                        <span>Inicio</span>
                        <span className="text-right">{formatDate(s.fecha_inicio)}</span>
                      </div>
                    )}
                    {s.fecha_fin && (
                      <div className="flex justify-between">
                        <span>Vencimiento</span>
                        <span className="text-right">{formatDate(s.fecha_fin)}</span>
                      </div>
                    )}
                  </div>

                  {s.notas && (
                    <p className="mt-3 text-xs text-muted-foreground italic">{s.notas}</p>
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
