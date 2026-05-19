import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package, Plus, Pencil } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toggleServicioAction } from './actions'

export default async function AdminServiciosPage() {
  const supabase = await createClient()

  const { data: servicios } = await supabase
    .from('services')
    .select('id, nombre, descripcion, icono, activo, created_at')
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
        <Link
          href="/admin/servicios/nuevo"
          className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}
        >
          <Plus size={15} />
          Nuevo servicio
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {!servicios?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package size={32} className="mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">El catálogo está vacío.</p>
            <Link
              href="/admin/servicios/nuevo"
              className="mt-3 text-sm text-primary hover:underline"
            >
              Agregar primer servicio
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {servicios.map((servicio) => (
              <div
                key={servicio.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Package size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{servicio.nombre}</p>
                    {servicio.descripcion && (
                      <p className="truncate text-xs text-muted-foreground">
                        {servicio.descripcion}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      servicio.activo
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {servicio.activo ? 'Activo' : 'Inactivo'}
                  </span>

                  <form action={toggleServicioAction}>
                    <input type="hidden" name="id" value={servicio.id} />
                    <input type="hidden" name="activo" value={String(servicio.activo)} />
                    <button
                      type="submit"
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'sm' }),
                        'h-7 px-2 text-xs text-muted-foreground',
                      )}
                    >
                      {servicio.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </form>

                  <Link
                    href={`/admin/servicios/${servicio.id}/editar`}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'h-7 gap-1 px-2 text-xs',
                    )}
                  >
                    <Pencil size={12} />
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
