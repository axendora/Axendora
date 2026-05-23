import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Layers, Plus, Pencil, Star, AlertTriangle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { togglePlanAction, toggleDestacadoAction } from './actions'
import { getServiceIcon } from '@/lib/service-icons'
import { PLAN_CATEGORIAS, formatUSD, formatCOP, tipoPrecioLabel } from '@/lib/plans'

export default async function AdminPlanesPage() {
  const supabase = await createClient()

  const { data: planes, error: planesError } = await supabase
    .from('plans')
    .select('id, nombre, descripcion, categoria, precio_usd, precio_cop, tipo_precio, imagen_url, icono, destacado, activo, created_at')
    .order('destacado', { ascending: false })
    .order('created_at', { ascending: false })

  if (planesError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Planes</h1>
        </div>
        <div className="rounded-xl border border-warning/40 bg-warning/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-warning" />
            <div className="space-y-2">
              <p className="font-medium text-warning">Migración pendiente</p>
              <p className="text-sm text-muted-foreground">
                La tabla <code className="rounded bg-muted px-1.5 py-0.5 text-xs">public.plans</code> no existe todavía.
                Necesitas ejecutar la migración <code className="rounded bg-muted px-1.5 py-0.5 text-xs">009_plans.sql</code> en el SQL Editor de Supabase.
              </p>
              <p className="text-xs text-muted-foreground/80 font-mono">
                Detalle: {planesError.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Planes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {planes?.length ?? 0} plan{planes?.length !== 1 ? 'es' : ''} en el catálogo
          </p>
        </div>
        <Link href="/admin/planes/nuevo" className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}>
          <Plus size={15} />
          Nuevo plan
        </Link>
      </div>

      {!planes?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <Layers size={32} className="mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Aún no hay planes creados.</p>
          <Link href="/admin/planes/nuevo" className="mt-3 text-sm text-primary hover:underline">
            Crear primer plan
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {PLAN_CATEGORIAS.map(({ value, label, Icon: CatIcon }) => {
            const items = planes.filter((p) => p.categoria === value)
            if (items.length === 0) return null
            return (
              <section key={value}>
                <div className="mb-3 flex items-center gap-2">
                  <CatIcon size={18} className="text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </h2>
                  <span className="text-xs text-muted-foreground/60">· {items.length}</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((plan) => {
                    const PlanIcon = getServiceIcon(plan.icono)
                    const usd = formatUSD(plan.precio_usd)
                    const cop = formatCOP(plan.precio_cop)
                    return (
                      <div key={plan.id}
                        className={cn(
                          'flex flex-col overflow-hidden rounded-xl border bg-card transition-colors',
                          plan.destacado ? 'border-primary/50' : 'border-border',
                        )}>
                        {/* Image */}
                        <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
                          {plan.imagen_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={plan.imagen_url} alt={plan.nombre} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Layers size={40} className="text-muted-foreground/20" />
                            </div>
                          )}
                          {plan.destacado && (
                            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-warning/95 px-2 py-0.5 text-[10px] font-bold text-black">
                              <Star size={10} fill="black" />
                              Destacado
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-1 flex-col p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex min-w-0 items-start gap-2">
                              {PlanIcon && <PlanIcon size={16} className="mt-0.5 shrink-0 text-primary" />}
                              <p className="font-medium leading-tight">{plan.nombre}</p>
                            </div>
                            <span className={cn(
                              'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                              plan.activo ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground',
                            )}>
                              {plan.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>

                          {plan.descripcion && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{plan.descripcion}</p>
                          )}

                          {/* Precios */}
                          <div className="mt-3 space-y-0.5 border-t border-border pt-3">
                            {usd && (
                              <p className="text-sm font-semibold">
                                {usd} <span className="text-xs font-normal text-muted-foreground">{tipoPrecioLabel(plan.tipo_precio)}</span>
                              </p>
                            )}
                            {cop && (
                              <p className="text-xs text-muted-foreground">
                                {cop} COP
                              </p>
                            )}
                            {!usd && !cop && (
                              <p className="text-xs italic text-muted-foreground">Sin precio</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                            <form action={toggleDestacadoAction}>
                              <input type="hidden" name="id" value={plan.id} />
                              <input type="hidden" name="destacado" value={String(plan.destacado)} />
                              <button type="submit" title={plan.destacado ? 'Quitar destacado' : 'Destacar'}
                                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-7 w-7 p-0',
                                  plan.destacado ? 'text-warning' : 'text-muted-foreground hover:text-warning')}>
                                <Star size={13} fill={plan.destacado ? 'currentColor' : 'none'} />
                              </button>
                            </form>
                            <form action={togglePlanAction} className="flex-1">
                              <input type="hidden" name="id" value={plan.id} />
                              <input type="hidden" name="activo" value={String(plan.activo)} />
                              <button type="submit"
                                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-7 w-full px-2 text-xs text-muted-foreground')}>
                                {plan.activo ? 'Desactivar' : 'Activar'}
                              </button>
                            </form>
                            <Link href={`/admin/planes/${plan.id}/editar`}
                              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-7 gap-1 px-2 text-xs')}>
                              <Pencil size={12} />
                              Editar
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
