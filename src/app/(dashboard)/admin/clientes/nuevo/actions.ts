'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { registrarClienteSchema } from '@/lib/validations/cliente'
import { revalidatePath } from 'next/cache'

export type ClienteRegistrado = {
  id: string
  nombre: string
  email: string
  empresa: string | null
  sector: string | null
  telefono: string | null
  whatsapp: string | null
  website: string | null
  ciudad: string | null
  pais: string | null
  notas_internas: string | null
}

export type RegistrarClienteResult =
  | { ok: true; cliente: ClienteRegistrado }
  | { ok: false; error: string }

export async function registrarClienteAction(
  _prev: RegistrarClienteResult | null,
  formData: FormData,
): Promise<RegistrarClienteResult> {
  const raw = {
    nombre:           formData.get('nombre') as string,
    email:            formData.get('email') as string,
    password:         formData.get('password') as string,
    telefono:         (formData.get('telefono') as string) || '',
    whatsapp_codigo:  (formData.get('whatsapp_codigo') as string) || '',
    whatsapp_numero:  (formData.get('whatsapp_numero') as string) || '',
    empresa:          (formData.get('empresa') as string) || '',
    sector:           (formData.get('sector') as string) || '',
    website:          (formData.get('website') as string) || '',
    ciudad:           (formData.get('ciudad') as string) || '',
    pais:             (formData.get('pais') as string) || '',
    notas_internas:   (formData.get('notas_internas') as string) || '',
  }

  const parsed = registrarClienteSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const {
    nombre, email, password, telefono,
    whatsapp_codigo, whatsapp_numero,
    empresa, sector, website, ciudad, pais, notas_internas,
  } = parsed.data

  // Construir número de WhatsApp completo: "+57" + "3001234567" → "+573001234567"
  const whatsapp =
    whatsapp_codigo && whatsapp_numero
      ? `${whatsapp_codigo}${whatsapp_numero.replace(/\s/g, '')}`
      : null

  const supabase = await createServiceClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre },
  })

  if (authError) {
    if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
      return { ok: false, error: 'Ya existe un usuario registrado con ese email.' }
    }
    return { ok: false, error: authError.message }
  }

  const userId = authData.user.id

  const { data: profile, error: profileError } = await supabase
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
    .eq('user_id', userId)
    .select('id, nombre, email, empresa, sector, telefono, whatsapp, website, ciudad, pais, notas_internas')
    .single()

  if (profileError || !profile) {
    return { ok: false, error: 'Cliente creado pero error al guardar datos adicionales.' }
  }

  revalidatePath('/admin/clientes')
  return { ok: true, cliente: profile }
}
