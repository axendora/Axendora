import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ServiceEstado } from '@/types/database.types'

type ClientServiceRow = {
  id: string
  estado: ServiceEstado
  fecha_inicio: string | null
  fecha_fin: string | null
  notas: string | null
  services: { nombre: string; descripcion: string | null } | null
}

const estadoConfig: Record<ServiceEstado, { label: string; className: string }> = {
  en_configuracion: { label: 'En configuración', className: 'bg-warning/10 text-warning' },
  activo:           { label: 'Activo',            className: 'bg-success/10 text-success' },
  pausado:          { label: 'Pausado',            className: 'bg-muted text-muted-foreground' },
  finalizado:       { label: 'Finalizado',         className: 'bg-border text-muted-foreground' },
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
}

export default async function ServiciosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: servicios } = await supabase
    .from('client_services')
    .select('id, estado, fecha_inicio, fecha_fin, notas, services(nombre, descripcion)')
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
          <Link
            href="/#contacto"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-6')}
          >
            Contactar a Axendora
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((s) => {
            const estado = estadoConfig[s.estado as ServiceEstado]
            const service = s.services
            return (
              <div
                key={s.id}
                className="flex flex-col rounded-xl border border-border bg-card p-5"
              >
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Package size={18} className="text-primary" />
                  </div>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', estado.className)}>
                    {estado.label}
                  </span>
                </div>

                <h3 className="text-sm font-semibold">{service?.nombre ?? '—'}</h3>
                {service?.descripcion && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {service.descripcion}
                  </p>
                )}

                <div className="mt-4 space-y-1 border-t border-border pt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Inicio</span>
                    <span>{formatDate(s.fecha_inicio)}</span>
                  </div>
                  {s.fecha_fin && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Fin</span>
                      <span>{formatDate(s.fecha_fin)}</span>
                    </div>
                  )}
                </div>

                {s.notas && (
                  <p className="mt-3 text-xs text-muted-foreground italic">{s.notas}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
