'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { editarClienteSchema } from '@/lib/validations/cliente'
import { revalidatePath } from 'next/cache'

export type ActionResult = { ok: true } | { ok: false; error: string }

export async function editarClienteAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    user_id:         formData.get('user_id') as string,
    nombre:          formData.get('nombre') as string,
    telefono:        (formData.get('telefono') as string) || '',
    whatsapp_codigo: (formData.get('whatsapp_codigo') as string) || '',
    whatsapp_numero: (formData.get('whatsapp_numero') as string) || '',
    empresa:         (formData.get('empresa') as string) || '',
    sector:          (formData.get('sector') as string) || '',
    website:         (formData.get('website') as string) || '',
    ciudad:          (formData.get('ciudad') as string) || '',
    pais:            (formData.get('pais') as string) || '',
    notas_internas:  (formData.get('notas_internas') as string) || '',
  }

  const parsed = editarClienteSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const {
    user_id, nombre, telefono,
    whatsapp_codigo, whatsapp_numero,
    empresa, sector, website, ciudad, pais, notas_internas,
  } = parsed.data

  const whatsapp =
    whatsapp_codigo && whatsapp_numero
      ? `${whatsapp_codigo}${whatsapp_numero.replace(/\s/g, '')}`
      : null

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      nombre,
      telefono: telefono || null,
      whatsapp,
      empresa: empresa || null,
      sector: sector || null,
      website: website || null,
      ciudad: ciudad || null,
      pais: pais || null,
      notas_internas: notas_internas || null,
    })
    .eq('user_id', user_id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/clientes')
  revalidatePath(`/admin/clientes/${user_id}`)
  return { ok: true }
}

export async function eliminarClienteAction(userId: string): Promise<ActionResult> {
  const supabase = await createServiceClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/clientes')
  return { ok: true }
}
