import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PlanForm } from './_components/plan-form'
import { createPlanAction } from '../actions'

export default function NuevoPlanPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/planes" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5')}>
          <ArrowLeft size={15} />
          Planes
        </Link>
      </div>

      <div>
        <h1 className="font-serif text-2xl font-semibold">Nuevo plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea un plan vendible que tus clientes podrán contratar.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <PlanForm action={createPlanAction} submitLabel="Crear plan" />
      </div>
    </div>
  )
}
