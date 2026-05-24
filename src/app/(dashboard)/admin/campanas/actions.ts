'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ServiceEstado } from '@/types/database.types'

/**
 * Activa una campaña: cambia estado a "activo", setea fecha_inicio = ahora
 * y fecha_fin = ahora + duracion_dias. Aquí es donde realmente inicia el
 * countdown que ve cliente y admin.
 */
export async function activarCampanaAction(
  formData: FormData,
): Promise<{ error?: string }> {
  const id        = formData.get('id') as string
  const diasRaw   = formData.get('duracion_dias') as string
  const duracion  = diasRaw ? parseInt(diasRaw, 10) : null

  if (!id) return { error: 'ID de campaña no especificado' }
  if (!duracion || duracion <= 0) {
    return { error: 'Define los días de duración antes de activar' }
  }

  const supabase = await createClient()

  const ahora = new Date()
  const fecha_inicio = ahora.toISOString()
  const fecha_fin    = new Date(ahora.getTime() + duracion * 86_400_000).toISOString()

  const { data: cs, error: fetchErr } = await supabase
    .from('client_services')
    .select('client_id')
    .eq('id', id)
    .single()

  if (fetchErr || !cs) return { error: 'Campaña no encontrada' }

  const { error } = await supabase
    .from('client_services')
    .update({
      estado:        'activo',
      fecha_inicio,
      fecha_fin,
      duracion_dias: duracion,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/campanas')
  revalidatePath(`/admin/clientes/${cs.client_id}`)
  revalidatePath('/cliente/campanas')
  revalidatePath('/cliente/servicios')
  return {}
}

/**
 * Cambia el estado de una campaña (pausar, reanudar, finalizar).
 * No toca fechas — solo el estado.
 */
export async function cambiarEstadoCampanaAction(
  formData: FormData,
): Promise<{ error?: string }> {
  const id     = formData.get('id') as string
  const estado = formData.get('estado') as ServiceEstado

  if (!id || !estado) return { error: 'Datos incompletos' }

  const supabase = await createClient()

  const { data: cs, error: fetchErr } = await supabase
    .from('client_services')
    .select('client_id')
    .eq('id', id)
    .single()

  if (fetchErr || !cs) return { error: 'Campaña no encontrada' }

  const { error } = await supabase
    .from('client_services')
    .update({ estado })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/campanas')
  revalidatePath(`/admin/clientes/${cs.client_id}`)
  revalidatePath('/cliente/campanas')
  revalidatePath('/cliente/servicios')
  return {}
}
