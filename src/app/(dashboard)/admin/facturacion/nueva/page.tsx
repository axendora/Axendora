import { createClient } from '@/lib/supabase/server'
import { NuevaFacturaForm } from './_components/nueva-factura-form'

export default async function NuevaFacturaPage() {
  const supabase = await createClient()

  const [{ data: clientes }, { data: campanasRaw }] = await Promise.all([
    supabase
      .from('profiles')
      .select('user_id, nombre, email, empresa')
      .eq('role', 'client')
      .order('nombre'),
    supabase
      .from('client_services')
      .select('id, client_id, estado, plans(nombre)')
      .not('plan_id', 'is', null)
      .in('estado', ['en_configuracion', 'activo']),
  ])

  type CampanaRaw = {
    id: string
    client_id: string
    estado: string
    plans: { nombre: string } | null
  }
  const campanas = ((campanasRaw ?? []) as unknown as CampanaRaw[]).map((c) => ({
    id: c.id,
    client_id: c.client_id,
    plan_nombre: c.plans?.nombre ?? null,
    estado: c.estado,
  }))

  return (
    <NuevaFacturaForm
      clients={clientes ?? []}
      campaigns={campanas}
    />
  )
}
