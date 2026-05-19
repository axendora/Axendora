import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ServicioForm } from './_components/servicio-form'
import { createServicioAction } from '../actions'

export default function NuevoServicioPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/servicios"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5')}
        >
          <ArrowLeft size={15} />
          Catálogo
        </Link>
      </div>

      <div>
        <h1 className="font-serif text-2xl font-semibold">Nuevo servicio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Agrega un servicio al catálogo de Axendora.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <ServicioForm action={createServicioAction} submitLabel="Crear servicio" />
      </div>
    </div>
  )
}
