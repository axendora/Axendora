'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { registrarClienteSchema } from '@/lib/validations/cliente'
import { revalidatePath } from 'next/cache'

export type RegistrarClienteResult =
  | { ok: true; cliente: { id: string; nombre: string; email: string; empresa: string | null; sector: string | null; telefono: string | null; website: string | null; ciudad: string | null; pais: string | null; notas_internas: string | null } }
  | { ok: false; error: string }

export async function registrarClienteAction(
  _prev: RegistrarClienteResult | null,
  formData: FormData,
): Promise<RegistrarClienteResult> {
  const raw = {
    nombre: formData.get('nombre') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    telefono: (formData.get('telefono') as string) || '',
    empresa: (formData.get('empresa') as string) || '',
    sector: (formData.get('sector') as string) || '',
    website: (formData.get('website') as string) || '',
    ciudad: (formData.get('ciudad') as string) || '',
    pais: (formData.get('pais') as string) || '',
    notas_internas: (formData.get('notas_internas') as string) || '',
  }

  const parsed = registrarClienteSchema.safeParse(raw)
  if (!parsed.success) {
    const issues = parsed.error.issues
    const msg = issues[0]?.message ?? 'Datos inválidos'
    return { ok: false, error: msg }
  }

  const { nombre, email, password, telefono, empresa, sector, website, ciudad, pais, notas_internas } = parsed.data

  const supabase = await createServiceClient()

  // Crear usuario en Supabase Auth
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

  // El trigger en profiles crea el registro básico al crear el auth user.
  // Actualizamos con los campos CRM adicionales.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      nombre,
      empresa: empresa || null,
      sector: sector || null,
      telefono: telefono || null,
      website: website || null,
      ciudad: ciudad || null,
      pais: pais || null,
      notas_internas: notas_internas || null,
    })
    .eq('user_id', userId)
    .select('id, nombre, email, empresa, sector, telefono, website, ciudad, pais, notas_internas')
    .single()

  if (profileError || !profile) {
    return { ok: false, error: 'Cliente creado pero error al guardar datos adicionales.' }
  }

  revalidatePath('/admin/clientes')

  return { ok: true, cliente: profile }
}
