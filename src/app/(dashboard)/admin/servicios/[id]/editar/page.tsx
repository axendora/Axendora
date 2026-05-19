import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ServicioForm } from '../../nuevo/_components/servicio-form'
import { updateServicioAction } from '../../actions'

export default async function EditarServicioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServiceClient()

  const { data: servicio } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()

  if (!servicio) notFound()

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
        <h1 className="font-serif text-2xl font-semibold">Editar servicio</h1>
        <p className="mt-1 text-sm text-muted-foreground">{servicio.nombre}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <ServicioForm
          action={updateServicioAction}
          defaultValues={{
            id: servicio.id,
            nombre: servicio.nombre,
            descripcion: servicio.descripcion ?? '',
            icono: servicio.icono ?? '',
            activo: servicio.activo,
          }}
          submitLabel="Guardar cambios"
        />
      </div>
    </div>
  )
}
