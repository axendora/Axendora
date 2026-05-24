import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { OfertaForm } from '../../_components/oferta-form'
import { actualizarOfertaAction } from '../../actions'
import type { TipoDescuento, MonedaTipo } from '@/types/database.types'

export default async function EditarOfertaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: oferta }, { data: planes }] = await Promise.all([
    supabase.from('ofertas').select('*').eq('id', id).single(),
    supabase.from('plans').select('id, nombre').eq('activo', true).order('nombre'),
  ])

  if (!oferta) notFound()

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/admin/ofertas" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5')}>
          <ArrowLeft size={15} />
          Ofertas
        </Link>
      </div>

      <div>
        <h1 className="font-serif text-2xl font-semibold">Editar oferta</h1>
        <p className="mt-1 text-sm text-muted-foreground">{oferta.titulo}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <OfertaForm
          action={actualizarOfertaAction}
          defaultValues={{
            id:              oferta.id,
            titulo:          oferta.titulo,
            descripcion:     oferta.descripcion ?? '',
            tipo_descuento:  oferta.tipo_descuento as TipoDescuento,
            valor_descuento: Number(oferta.valor_descuento),
            moneda:          oferta.moneda as MonedaTipo,
            codigo_promo:    oferta.codigo_promo ?? '',
            plan_id:         oferta.plan_id,
            fecha_inicio:    oferta.fecha_inicio,
            fecha_fin:       oferta.fecha_fin,
            activo:          oferta.activo,
          }}
          planes={planes ?? []}
          submitLabel="Guardar cambios"
        />
      </div>
    </div>
  )
}
