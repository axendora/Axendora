'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { TipoDescuento, MonedaTipo } from '@/types/database.types'

export type OfertaActionState = { error: string } | null

const TIPOS_DESCUENTO: TipoDescuento[] = ['porcentaje', 'monto_fijo']
const MONEDAS: MonedaTipo[] = ['USD', 'COP']

function parseFields(formData: FormData) {
  const titulo          = (formData.get('titulo') as string).trim()
  const descripcion     = (formData.get('descripcion') as string | null)?.trim() || null
  const tipo_descuento  = formData.get('tipo_descuento') as TipoDescuento
  const valor_descuento = parseFloat((formData.get('valor_descuento') as string) || '0')
  const moneda          = (formData.get('moneda') as MonedaTipo) || 'USD'
  const codigo_promo    = (formData.get('codigo_promo') as string | null)?.trim().toUpperCase() || null
  const plan_id         = (formData.get('plan_id') as string | null)?.trim() || null
  const fecha_inicio    = (formData.get('fecha_inicio') as string).trim()
  const fecha_fin       = (formData.get('fecha_fin') as string | null)?.trim() || null
  const activo          = formData.get('activo') === 'true'
  return { titulo, descripcion, tipo_descuento, valor_descuento, moneda, codigo_promo, plan_id, fecha_inicio, fecha_fin, activo }
}

function validate(f: ReturnType<typeof parseFields>): string | null {
  if (!f.titulo)                                        return 'El título es obligatorio'
  if (!TIPOS_DESCUENTO.includes(f.tipo_descuento))     return 'Tipo de descuento inválido'
  if (!MONEDAS.includes(f.moneda))                     return 'Moneda inválida'
  if (isNaN(f.valor_descuento) || f.valor_descuento < 0) return 'El valor del descuento es inválido'
  if (f.tipo_descuento === 'porcentaje' && f.valor_descuento > 100) return 'El porcentaje no puede superar el 100%'
  if (!f.fecha_inicio)                                  return 'La fecha de inicio es obligatoria'
  return null
}

export async function crearOfertaAction(
  _: OfertaActionState,
  formData: FormData,
): Promise<OfertaActionState> {
  const fields = parseFields(formData)
  const err = validate(fields)
  if (err) return { error: err }

  const supabase = await createClient()
  const { error } = await supabase.from('ofertas').insert({
    titulo:          fields.titulo,
    descripcion:     fields.descripcion,
    tipo_descuento:  fields.tipo_descuento,
    valor_descuento: fields.valor_descuento,
    moneda:          fields.moneda,
    codigo_promo:    fields.codigo_promo,
    plan_id:         fields.plan_id,
    fecha_inicio:    fields.fecha_inicio,
    fecha_fin:       fields.fecha_fin,
    activo:          true,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/ofertas')
  redirect('/admin/ofertas')
}

export async function actualizarOfertaAction(
  _: OfertaActionState,
  formData: FormData,
): Promise<OfertaActionState> {
  const id = formData.get('id') as string
  const fields = parseFields(formData)
  const err = validate(fields)
  if (err) return { error: err }

  const supabase = await createClient()
  const { error } = await supabase
    .from('ofertas')
    .update({
      titulo:          fields.titulo,
      descripcion:     fields.descripcion,
      tipo_descuento:  fields.tipo_descuento,
      valor_descuento: fields.valor_descuento,
      moneda:          fields.moneda,
      codigo_promo:    fields.codigo_promo,
      plan_id:         fields.plan_id,
      fecha_inicio:    fields.fecha_inicio,
      fecha_fin:       fields.fecha_fin,
      activo:          fields.activo,
      updated_at:      new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/ofertas')
  redirect('/admin/ofertas')
}

export async function toggleActivoOfertaAction(formData: FormData) {
  const id     = formData.get('id') as string
  const activo = formData.get('activo') === 'true'
  const supabase = await createClient()
  const { error } = await supabase
    .from('ofertas')
    .update({ activo: !activo, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/ofertas')
}

export async function eliminarOfertaAction(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await createClient()
  const { error } = await supabase.from('ofertas').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/ofertas')
}
