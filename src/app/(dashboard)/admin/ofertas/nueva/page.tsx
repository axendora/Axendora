import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { OfertaForm } from '../_components/oferta-form'
import { crearOfertaAction } from '../actions'

export default async function NuevaOfertaPage() {
  const supabase = await createClient()
  const { data: planes } = await supabase
    .from('plans')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/admin/ofertas" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5')}>
          <ArrowLeft size={15} />
          Ofertas
        </Link>
      </div>

      <div>
        <h1 className="font-serif text-2xl font-semibold">Nueva oferta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea una oferta o promoción para tus clientes.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <OfertaForm
          action={crearOfertaAction}
          planes={planes ?? []}
          submitLabel="Crear oferta"
        />
      </div>
    </div>
  )
}
