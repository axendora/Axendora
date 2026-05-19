'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ServiceEstado } from '@/types/database.types'

export async function assignServiceAction(clientId: string, data: {
  service_id:   string
  fecha_inicio?: string
  fecha_fin?:    string
  notas?:        string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('client_services').insert({
    client_id:    clientId,
    service_id:   data.service_id,
    fecha_inicio: data.fecha_inicio || null,
    fecha_fin:    data.fecha_fin    || null,
    notas:        data.notas        || null,
    estado:       data.fecha_inicio ? 'activo' : 'en_configuracion',
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/clientes/${clientId}`)
}

export async function updateClientServiceEstadoAction(formData: FormData) {
  const id = formData.get('id') as string
  const clientId = formData.get('clientId') as string
  const estado = formData.get('estado') as ServiceEstado

  const supabase = await createClient()
  const { error } = await supabase
    .from('client_services')
    .update({ estado })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/clientes/${clientId}`)
}
