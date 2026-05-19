'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function uploadServiceImage(file: File, fileName: string): Promise<string | null> {
  if (!file || file.size === 0) return null
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${fileName}.${ext}`
  const supabase = await createServiceClient()
  const { error } = await supabase.storage
    .from('service-images')
    .upload(path, file, { contentType: file.type, upsert: true })
  if (error) return null
  const { data } = supabase.storage.from('service-images').getPublicUrl(path)
  return data.publicUrl
}

export async function createServicioAction(formData: FormData) {
  const nombre      = (formData.get('nombre') as string).trim()
  const descripcion = (formData.get('descripcion') as string).trim() || null
  const icono       = (formData.get('icono') as string).trim() || null
  const duracionRaw = formData.get('duracion_dias') as string
  const duracion_dias = duracionRaw ? parseInt(duracionRaw, 10) : null
  const imagen      = formData.get('imagen') as File | null

  if (!nombre) throw new Error('El nombre es obligatorio')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .insert({ nombre, descripcion, icono, duracion_dias })
    .select('id')
    .single()
  if (error) throw new Error(error.message)

  if (imagen && imagen.size > 0) {
    const url = await uploadServiceImage(imagen, `service_${data.id}`)
    if (url) {
      await supabase.from('services').update({ imagen_url: url }).eq('id', data.id)
    }
  }

  revalidatePath('/admin/servicios')
  redirect('/admin/servicios')
}

export async function updateServicioAction(formData: FormData) {
  const id          = formData.get('id') as string
  const nombre      = (formData.get('nombre') as string).trim()
  const descripcion = (formData.get('descripcion') as string).trim() || null
  const icono       = (formData.get('icono') as string).trim() || null
  const activo      = formData.get('activo') === 'true'
  const duracionRaw = formData.get('duracion_dias') as string
  const duracion_dias = duracionRaw ? parseInt(duracionRaw, 10) : null
  const imagen      = formData.get('imagen') as File | null

  if (!nombre) throw new Error('El nombre es obligatorio')

  let imagen_url: string | undefined
  if (imagen && imagen.size > 0) {
    imagen_url = (await uploadServiceImage(imagen, `service_${id}`)) ?? undefined
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('services')
    .update({ nombre, descripcion, icono, activo, duracion_dias, ...(imagen_url ? { imagen_url } : {}) })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/servicios')
  redirect('/admin/servicios')
}

export async function toggleServicioAction(formData: FormData) {
  const id    = formData.get('id') as string
  const activo = formData.get('activo') === 'true'
  const supabase = await createClient()
  const { error } = await supabase.from('services').update({ activo: !activo }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/servicios')
}
