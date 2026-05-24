import { createClient } from '@/lib/supabase/server'
import { FinanzasClient } from './_components/finanzas-client'
import type { Ingreso, Gasto, IngresoCategoria, GastoCategoria } from '@/types/database.types'

export const metadata = { title: 'Finanzas — Axendora Admin' }

export default async function FinanzasPage() {
  const supabase = await createClient()

  const [
    { data: ingresos },
    { data: gastos },
    { data: ingresoCategorias },
    { data: gastoCategorias },
  ] = await Promise.all([
    supabase
      .from('ingresos')
      .select('*, categoria:ingreso_categorias(id, nombre, icono, color, sistema, orden, created_at)')
      .order('fecha', { ascending: false }),
    supabase
      .from('gastos')
      .select('*, categoria:gasto_categorias(id, nombre, icono, color, sistema, orden, created_at)')
      .order('fecha', { ascending: false }),
    supabase
      .from('ingreso_categorias')
      .select('*')
      .order('orden'),
    supabase
      .from('gasto_categorias')
      .select('*')
      .order('orden'),
  ])

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Finanzas</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Ingresos y gastos de la agencia
        </p>
      </div>

      <FinanzasClient
        ingresos={(ingresos ?? []) as unknown as Ingreso[]}
        gastos={(gastos ?? []) as unknown as Gasto[]}
        ingresoCategorias={(ingresoCategorias ?? []) as IngresoCategoria[]}
        gastoCategorias={(gastoCategorias ?? []) as GastoCategoria[]}
      />
    </div>
  )
}
