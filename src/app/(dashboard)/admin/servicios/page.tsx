import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package, Plus, Pencil, Clock } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toggleServicioAction } from './actions'

export default async function AdminServiciosPage() {
  const supabase = await createClient()

  const { data: servicios } = await supabase
    .from('services')
    .select('id, nombre, descripcion, imagen_url, duracion_dias, activo, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Catálogo de servicios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {servicios?.length ?? 0} servicio{servicios?.length !== 1 ? 's' : ''} en el catálogo
          </p>
        </div>
        <Link href="/admin/servicios/nuevo" className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}>
          <Plus size={15} />
          Nuevo servicio
        </Link>
      </div>

      {!servicios?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <Package size={32} className="mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">El catálogo está vacío.</p>
          <Link href="/admin/servicios/nuevo" className="mt-3 text-sm text-primary hover:underline">
            Agregar primer servicio
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((servicio) => (
            <div key={servicio.id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
              {/* Image */}
              <div className="aspect-square w-full overflow-hidden bg-muted/30">
                {servicio.imagen_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={servicio.imagen_url}
                    alt={servicio.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package size={40} className="text-muted-foreground/20" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium leading-tight">{servicio.nombre}</p>
                  <span className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                    servicio.activo ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground',
                  )}>
                    {servicio.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {servicio.descripcion && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{servicio.descripcion}</p>
                )}

                {servicio.duracion_dias && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={11} />
                    Duración: {servicio.duracion_dias} días
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                  <form action={toggleServicioAction} className="flex-1">
                    <input type="hidden" name="id" value={servicio.id} />
                    <input type="hidden" name="activo" value={String(servicio.activo)} />
                    <button type="submit"
                      className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-7 w-full px-2 text-xs text-muted-foreground')}>
                      {servicio.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </form>
                  <Link href={`/admin/servicios/${servicio.id}/editar`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-7 gap-1 px-2 text-xs')}>
                    <Pencil size={12} />
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
