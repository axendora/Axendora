'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { FacturaEstado, MonedaTipo } from '@/types/database.types'

export async function crearFacturaAction(
  formData: FormData,
): Promise<{ error?: string; success?: true }> {
  const client_id         = formData.get('client_id') as string
  const client_service_id = (formData.get('client_service_id') as string) || null
  const concepto          = (formData.get('concepto') as string)?.trim()
  const montoRaw          = formData.get('monto') as string
  const moneda            = formData.get('moneda') as MonedaTipo
  const fecha_vencimiento = (formData.get('fecha_vencimiento') as string) || null
  const notas             = (formData.get('notas') as string)?.trim() || null

  if (!client_id) return { error: 'Selecciona un cliente' }
  if (!concepto)  return { error: 'El concepto es obligatorio' }
  const monto = parseFloat(montoRaw)
  if (isNaN(monto) || monto <= 0) return { error: 'El monto debe ser mayor a 0' }
  if (!['USD', 'COP'].includes(moneda)) return { error: 'Moneda inválida' }

  const supabase = await createClient()

  // Generar número de factura: AXE-YYYY-NNN
  const { count } = await supabase
    .from('facturas')
    .select('id', { count: 'exact', head: true })

  const year   = new Date().getFullYear()
  const numero = `AXE-${year}-${String((count ?? 0) + 1).padStart(3, '0')}`

  const { error } = await supabase.from('facturas').insert({
    client_id,
    client_service_id,
    numero,
    concepto,
    monto,
    moneda,
    fecha_vencimiento: fecha_vencimiento || null,
    notas,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/facturacion')
  return { success: true }
}

export async function cambiarEstadoFacturaAction(
  formData: FormData,
): Promise<{ error?: string }> {
  const id     = formData.get('id') as string
  const estado = formData.get('estado') as FacturaEstado

  if (!id || !estado) return { error: 'Datos incompletos' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('facturas')
    .update(
      estado === 'pagada'
        ? { estado, fecha_pago: new Date().toISOString().split('T')[0] }
        : { estado },
    )
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/facturacion')
  return {}
}

export async function eliminarFacturaAction(
  formData: FormData,
): Promise<{ error?: string }> {
  const id = formData.get('id') as string
  if (!id) return { error: 'ID no especificado' }

  const supabase = await createClient()
  const { error } = await supabase.from('facturas').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/facturacion')
  return {}
}
