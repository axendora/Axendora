'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SolicitudEstado, SolicitudPrioridad } from '@/types/database.types'

export async function updateSolicitudAction(formData: FormData) {
  const id = formData.get('id') as string
  const estado = formData.get('estado') as SolicitudEstado
  const prioridad = formData.get('prioridad') as SolicitudPrioridad

  const supabase = await createClient()
  const { error } = await supabase
    .from('solicitudes')
    .update({ estado, prioridad })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/solicitudes/${id}`)
  revalidatePath('/admin/solicitudes')
  revalidatePath('/admin')
}
