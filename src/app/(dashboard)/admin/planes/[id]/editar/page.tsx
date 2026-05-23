import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PlanForm } from '../../nuevo/_components/plan-form'
import { updatePlanAction } from '../../actions'

export default async function EditarPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: plan } = await supabase
    .from('plans')
    .select('*')
    .eq('id', id)
    .single()

  if (!plan) notFound()

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/planes" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5')}>
          <ArrowLeft size={15} />
          Planes
        </Link>
      </div>

      <div>
        <h1 className="font-serif text-2xl font-semibold">Editar plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">{plan.nombre}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <PlanForm
          action={updatePlanAction}
          defaultValues={{
            id:           plan.id,
            nombre:       plan.nombre,
            descripcion:  plan.descripcion ?? '',
            categoria:    plan.categoria,
            precio_usd:   plan.precio_usd,
            precio_cop:   plan.precio_cop,
            tipo_precio:  plan.tipo_precio,
            imagen_url:   plan.imagen_url ?? null,
            icono:        plan.icono ?? '',
            destacado:    plan.destacado,
            activo:       plan.activo,
          }}
          submitLabel="Guardar cambios"
        />
      </div>
    </div>
  )
}
