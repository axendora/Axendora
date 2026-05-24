'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAgenciaAction(
  formData: FormData,
): Promise<{ error?: string; success?: true }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const settings_id = (formData.get('settings_id') as string)?.trim() || null

  const telefonoCode = (formData.get('telefono_code') as string)?.trim() || '+57'
  const telefonoNum  = (formData.get('telefono_num')  as string)?.trim() || ''
  const whatsappCode = (formData.get('whatsapp_code') as string)?.trim() || '+57'
  const whatsappNum  = (formData.get('whatsapp_num')  as string)?.trim() || ''

  const payload = {
    nombre_agencia: (formData.get('nombre_agencia') as string)?.trim() || 'Axendora',
    slogan:         (formData.get('slogan')         as string)?.trim() || null,
    email_contacto: (formData.get('email_contacto') as string)?.trim() || null,
    telefono:       telefonoNum ? `${telefonoCode}${telefonoNum.replace(/\s/g, '')}` : null,
    whatsapp:       whatsappNum ? `${whatsappCode}${whatsappNum.replace(/\s/g, '')}` : null,
    website:        (formData.get('website')        as string)?.trim() || null,
    instagram:      (formData.get('instagram')      as string)?.trim() || null,
    facebook:       (formData.get('facebook')       as string)?.trim() || null,
    timezone:       (formData.get('timezone')       as string)?.trim() || 'America/Caracas',
    updated_at:     new Date().toISOString(),
  }

  const service = await createServiceClient()

  let dbError
  if (settings_id) {
    const { error } = await service
      .from('agency_settings')
      .update(payload)
      .eq('id', settings_id)
    dbError = error
  } else {
    const { error } = await service
      .from('agency_settings')
      .upsert({ ...payload })
    dbError = error
  }

  if (dbError) return { error: `No se pudo guardar: ${dbError.message}` }

  revalidatePath('/admin/configuracion')
  return { success: true }
}

export async function updateCuentaAction(
  formData: FormData,
): Promise<{ error?: string; success?: true }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const nombre = (formData.get('nombre') as string)?.trim()
  if (!nombre || nombre.length < 2) return { error: 'El nombre debe tener al menos 2 caracteres.' }

  const { error } = await supabase
    .from('profiles')
    .update({ nombre, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  if (error) return { error: 'No se pudo actualizar la cuenta.' }

  revalidatePath('/admin/configuracion')
  return { success: true }
}

export async function updatePasswordAction(
  formData: FormData,
): Promise<{ error?: string; success?: true }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const nueva    = (formData.get('nueva')    as string)?.trim()
  const confirmar = (formData.get('confirmar') as string)?.trim()

  if (!nueva || nueva.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  if (nueva !== confirmar)         return { error: 'Las contraseñas no coinciden.' }

  const { error } = await supabase.auth.updateUser({ password: nueva })
  if (error) return { error: 'No se pudo cambiar la contraseña.' }

  return { success: true }
}

export async function updateNotificacionesAction(
  formData: FormData,
): Promise<{ error?: string; success?: true }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const settings_id = (formData.get('settings_id') as string)?.trim() || null

  const payload = {
    notif_bienvenida:          formData.get('notif_bienvenida')          === 'on',
    notif_solicitud_aprobada:  formData.get('notif_solicitud_aprobada')  === 'on',
    notif_solicitud_rechazada: formData.get('notif_solicitud_rechazada') === 'on',
    notif_factura_emitida:     formData.get('notif_factura_emitida')     === 'on',
    notif_campana_iniciada:    formData.get('notif_campana_iniciada')    === 'on',
    updated_at:                new Date().toISOString(),
  }

  const service = await createServiceClient()

  let dbError
  if (settings_id) {
    const { error } = await service
      .from('agency_settings')
      .update(payload)
      .eq('id', settings_id)
    dbError = error
  } else {
    const { error } = await service
      .from('agency_settings')
      .upsert({ ...payload })
    dbError = error
  }

  if (dbError) return { error: `No se pudo guardar: ${dbError.message}` }

  revalidatePath('/admin/configuracion')
  return { success: true }
}
