'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendSolicitudAprobada, sendSolicitudRechazada } from '@/lib/email'
import type { SolicitudEstado, SolicitudPrioridad } from '@/types/database.types'

export async function updateSolicitudAction(
  formData: FormData,
): Promise<{ error?: string }> {
  const id = formData.get('id') as string
  const estado = formData.get('estado') as SolicitudEstado
  const prioridad = formData.get('prioridad') as SolicitudPrioridad

  const supabase = await createClient()
  const { error } = await supabase
    .from('solicitudes')
    .update({ estado, prioridad })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath(`/admin/solicitudes/${id}`)
  revalidatePath('/admin/solicitudes')
  revalidatePath('/admin')
  return {}
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

  // Aprobar = aceptar gestionar. La campaña queda EN CONFIGURACIÓN
  // sin fechas. El countdown empieza cuando el admin la ACTIVE desde
  // la sección Campañas (ahí se setean fecha_inicio y fecha_fin).
  const { error: csErr } = await supabase.from('client_services').insert({
    client_id: solicitud.client_id,
    plan_id,
    estado: 'en_configuracion',
    duracion_dias: duracion,
  })

  if (csErr) return { error: csErr.message }

  const { error: updErr } = await supabase
    .from('solicitudes')
    .update({ estado: 'aprobada' })
    .eq('id', id)

  if (updErr) return { error: updErr.message }

  // Email al cliente — fire and forget
  const [{ data: perfil }, { data: plan }] = await Promise.all([
    supabase.from('profiles').select('nombre, email').eq('user_id', solicitud.client_id).single(),
    plan_id
      ? supabase.from('plans').select('nombre').eq('id', plan_id).single()
      : Promise.resolve({ data: null }),
  ])
  if (perfil?.email) {
    sendSolicitudAprobada({
      to: perfil.email,
      nombre: perfil.nombre,
      planNombre: plan?.nombre ?? 'tu plan',
      duracionDias: duracion,
    }).catch((e) => console.error('[email] aprobar:', e))
  }

  revalidatePath(`/admin/solicitudes/${id}`)
  revalidatePath('/admin/solicitudes')
  revalidatePath('/admin/campanas')
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

  // Fetch client + plan info needed for the email before updating
  const { data: sol } = await supabase
    .from('solicitudes')
    .select('client_id, plan_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('solicitudes')
    .update({ estado: 'rechazada', motivo_rechazo })
    .eq('id', id)

  if (error) return { error: error.message }

  // Email al cliente — fire and forget
  if (sol?.client_id) {
    const [{ data: perfil }, { data: plan }] = await Promise.all([
      supabase.from('profiles').select('nombre, email').eq('user_id', sol.client_id).single(),
      sol.plan_id
        ? supabase.from('plans').select('nombre').eq('id', sol.plan_id).single()
        : Promise.resolve({ data: null }),
    ])
    if (perfil?.email) {
      sendSolicitudRechazada({
        to: perfil.email,
        nombre: perfil.nombre,
        planNombre: plan?.nombre ?? 'tu plan',
        motivo: motivo_rechazo,
      }).catch((e) => console.error('[email] rechazar:', e))
    }
  }

  revalidatePath(`/admin/solicitudes/${id}`)
  revalidatePath('/admin/solicitudes')
  revalidatePath('/admin')
  return {}
}
