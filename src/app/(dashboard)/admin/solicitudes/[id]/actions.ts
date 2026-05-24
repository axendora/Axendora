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

export async function aprobarSolicitudAction(
  formData: FormData,
): Promise<{ error?: string }> {
  const id        = formData.get('id') as string
  const plan_id   = (formData.get('plan_id') as string) || null
  const diasRaw   = formData.get('duracion_dias') as string
  const duracion  = diasRaw ? parseInt(diasRaw, 10) : null

  const supabase = await createClient()

  const { data: solicitud, error: fetchErr } = await supabase
    .from('solicitudes')
    .select('client_id')
    .eq('id', id)
    .single()

  if (fetchErr || !solicitud) return { error: 'Solicitud no encontrada' }

  const hoy = new Date()
  const fecha_inicio = hoy.toISOString().split('T')[0]
  const fecha_fin = duracion
    ? new Date(hoy.getTime() + duracion * 86_400_000).toISOString().split('T')[0]
    : null

  const { error: csErr } = await supabase.from('client_services').insert({
    client_id: solicitud.client_id,
    plan_id,
    estado: 'en_configuracion',
    fecha_inicio,
    fecha_fin,
  })

  if (csErr) return { error: csErr.message }

  const { error: updErr } = await supabase
    .from('solicitudes')
    .update({ estado: 'aprobada' })
    .eq('id', id)

  if (updErr) return { error: updErr.message }

  revalidatePath(`/admin/solicitudes/${id}`)
  revalidatePath('/admin/solicitudes')
  revalidatePath('/admin')
  return {}
}

export async function rechazarSolicitudAction(
  formData: FormData,
): Promise<{ error?: string }> {
  const id             = formData.get('id') as string
  const motivo_rechazo = (formData.get('motivo_rechazo') as string)?.trim() || null

  if (!motivo_rechazo) return { error: 'El motivo es obligatorio' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('solicitudes')
    .update({ estado: 'rechazada', motivo_rechazo })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/admin/solicitudes/${id}`)
  revalidatePath('/admin/solicitudes')
  revalidatePath('/admin')
  return {}
}
