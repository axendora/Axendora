'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ServiceActionState = { error: string } | null

async function uploadServiceImage(file: File, path: string): Promise<string> {
  const supabase = await createServiceClient()
  const { error } = await supabase.storage
    .from('service-images')
    .upload(path, file, { contentType: file.type, upsert: true })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('service-images').getPublicUrl(path)
  return data.publicUrl
}

export async function createServicioAction(
  _: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const nombre        = (formData.get('nombre') as string).trim()
  const descripcion   = (formData.get('descripcion') as string).trim() || null
  const icono         = (formData.get('icono') as string).trim() || null
  const duracionRaw   = formData.get('duracion_dias') as string
  const duracion_dias = duracionRaw ? parseInt(duracionRaw, 10) : null
  const imagen        = formData.get('imagen') as File | null

  if (!nombre) return { error: 'El nombre es obligatorio' }

  let imagen_url: string | null = null
  if (imagen && imagen.size > 0) {
    const ext  = imagen.name.split('.').pop() ?? 'jpg'
    const path = `${crypto.randomUUID()}.${ext}`
    try {
      imagen_url = await uploadServiceImage(imagen, path)
    } catch (e) {
      return { error: `Error al subir imagen: ${e instanceof Error ? e.message : 'Error desconocido'}` }
    }
  }

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
  const imagen        = formData.get('imagen') as File | null
  const imageRemoved  = formData.get('imagen_removed') === '1'

  if (!nombre) return { error: 'El nombre es obligatorio' }

  let imagenUrlPatch: { imagen_url: string | null } | undefined

  if (imageRemoved) {
    imagenUrlPatch = { imagen_url: null }
  } else if (imagen && imagen.size > 0) {
    const ext  = imagen.name.split('.').pop() ?? 'jpg'
    const path = `service_${id}.${ext}`
    try {
      imagenUrlPatch = { imagen_url: await uploadServiceImage(imagen, path) }
    } catch (e) {
      return { error: `Error al subir imagen: ${e instanceof Error ? e.message : 'Error desconocido'}` }
    }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('services')
    .update({ nombre, descripcion, icono, activo, duracion_dias, ...imagenUrlPatch })
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
