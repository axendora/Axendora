'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ServiceActionState = { error: string } | null

export async function createServicioAction(
  _: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const nombre        = (formData.get('nombre') as string).trim()
  const descripcion   = (formData.get('descripcion') as string).trim() || null
  const icono         = (formData.get('icono') as string).trim() || null
  const duracionRaw   = formData.get('duracion_dias') as string
  const duracion_dias = duracionRaw ? parseInt(duracionRaw, 10) : null
  const imagen_url    = (formData.get('imagen_url') as string).trim() || null

  if (!nombre) return { error: 'El nombre es obligatorio' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('services')
    .insert({ nombre, descripcion, icono, duracion_dias, imagen_url })

  if (error) return { error: error.message }

  revalidatePath('/admin/servicios')
  redirect('/admin/servicios')
}

export async function updateServicioAction(
  _: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const id            = formData.get('id') as string
  const nombre        = (formData.get('nombre') as string).trim()
  const descripcion   = (formData.get('descripcion') as string).trim() || null
  const icono         = (formData.get('icono') as string).trim() || null
  const activo        = formData.get('activo') === 'true'
  const duracionRaw   = formData.get('duracion_dias') as string
  const duracion_dias = duracionRaw ? parseInt(duracionRaw, 10) : null
  const imagen_url    = (formData.get('imagen_url') as string).trim() || null

  if (!nombre) return { error: 'El nombre es obligatorio' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('services')
    .update({ nombre, descripcion, icono, activo, duracion_dias, imagen_url })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/servicios')
  redirect('/admin/servicios')
}

export async function toggleServicioAction(formData: FormData) {
  const id     = formData.get('id') as string
  const activo = formData.get('activo') === 'true'
  const supabase = await createClient()
  const { error } = await supabase.from('services').update({ activo: !activo }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/servicios')
}
