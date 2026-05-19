'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createServicioAction(formData: FormData) {
  const nombre = (formData.get('nombre') as string).trim()
  const descripcion = (formData.get('descripcion') as string).trim() || null
  const icono = (formData.get('icono') as string).trim() || null

  if (!nombre) throw new Error('El nombre es obligatorio')

  const supabase = await createServiceClient()
  const { error } = await supabase.from('services').insert({ nombre, descripcion, icono })
  if (error) throw new Error(error.message)

  revalidatePath('/admin/servicios')
  redirect('/admin/servicios')
}

export async function updateServicioAction(formData: FormData) {
  const id = formData.get('id') as string
  const nombre = (formData.get('nombre') as string).trim()
  const descripcion = (formData.get('descripcion') as string).trim() || null
  const icono = (formData.get('icono') as string).trim() || null
  const activo = formData.get('activo') === 'true'

  if (!nombre) throw new Error('El nombre es obligatorio')

  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('services')
    .update({ nombre, descripcion, icono, activo })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/servicios')
  redirect('/admin/servicios')
}

export async function toggleServicioAction(formData: FormData) {
  const id = formData.get('id') as string
  const activo = formData.get('activo') === 'true'

  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('services')
    .update({ activo: !activo })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/servicios')
}
