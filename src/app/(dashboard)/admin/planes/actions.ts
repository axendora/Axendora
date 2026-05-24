'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { PlanCategoria, TipoPrecio } from '@/types/database.types'

export type PlanActionState = { error: string } | null

const CATEGORIAS: PlanCategoria[] = ['marketing', 'diseno', 'web']
const TIPOS: TipoPrecio[] = ['mensual', 'unico']

function parseNumeric(value: FormDataEntryValue | null): number | null {
  if (value == null) return null
  const raw = String(value).trim()
  if (raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export async function createPlanAction(
  _: PlanActionState,
  formData: FormData,
): Promise<PlanActionState> {
  const nombre        = (formData.get('nombre') as string).trim()
  const descripcion   = (formData.get('descripcion') as string).trim() || null
  const icono         = (formData.get('icono') as string).trim() || null
  const imagen_url    = (formData.get('imagen_url') as string).trim() || null
  const categoria     = formData.get('categoria') as PlanCategoria
  const tipo_precio   = (formData.get('tipo_precio') as TipoPrecio) || 'mensual'
  const precio_usd    = parseNumeric(formData.get('precio_usd'))
  const precio_cop    = parseNumeric(formData.get('precio_cop'))
  const duracionRaw   = formData.get('duracion_dias') as string
  const duracion_dias = duracionRaw ? parseInt(duracionRaw, 10) : null
  const destacado     = formData.get('destacado') === 'on'

  if (!nombre) return { error: 'El nombre es obligatorio' }
  if (!CATEGORIAS.includes(categoria)) return { error: 'Categoría inválida' }
  if (!TIPOS.includes(tipo_precio))   return { error: 'Tipo de precio inválido' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('plans')
    .insert({
      nombre, descripcion, icono, imagen_url,
      categoria, tipo_precio, precio_usd, precio_cop, duracion_dias, destacado,
    })

  if (error) return { error: error.message }

  revalidatePath('/admin/planes')
  revalidatePath('/cliente/planes')
  redirect('/admin/planes')
}

export async function updatePlanAction(
  _: PlanActionState,
  formData: FormData,
): Promise<PlanActionState> {
  const id          = formData.get('id') as string
  const nombre      = (formData.get('nombre') as string).trim()
  const descripcion = (formData.get('descripcion') as string).trim() || null
  const icono       = (formData.get('icono') as string).trim() || null
  const imagen_url  = (formData.get('imagen_url') as string).trim() || null
  const categoria   = formData.get('categoria') as PlanCategoria
  const tipo_precio = (formData.get('tipo_precio') as TipoPrecio) || 'mensual'
  const precio_usd  = parseNumeric(formData.get('precio_usd'))
  const precio_cop  = parseNumeric(formData.get('precio_cop'))
  const destacado   = formData.get('destacado') === 'on'
  const activo      = formData.get('activo') === 'true'

  if (!nombre) return { error: 'El nombre es obligatorio' }
  if (!CATEGORIAS.includes(categoria)) return { error: 'Categoría inválida' }
  if (!TIPOS.includes(tipo_precio))   return { error: 'Tipo de precio inválido' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('plans')
    .update({
      nombre, descripcion, icono, imagen_url,
      categoria, tipo_precio, precio_usd, precio_cop, destacado, activo,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/planes')
  revalidatePath('/cliente/planes')
  redirect('/admin/planes')
}

export async function togglePlanAction(formData: FormData) {
  const id     = formData.get('id') as string
  const activo = formData.get('activo') === 'true'
  const supabase = await createClient()
  const { error } = await supabase.from('plans').update({ activo: !activo }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/planes')
  revalidatePath('/cliente/planes')
}

export async function toggleDestacadoAction(formData: FormData) {
  const id        = formData.get('id') as string
  const destacado = formData.get('destacado') === 'true'
  const supabase = await createClient()
  const { error } = await supabase.from('plans').update({ destacado: !destacado }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/planes')
  revalidatePath('/cliente/planes')
}
