'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Helpers ───────────────────────────────────────────────────────────────────

async function resolverCategoriaIngreso(
  supabase: Awaited<ReturnType<typeof createClient>>,
  categoriaId: string | null,
  nuevaCategoria: string | null,
): Promise<string | null> {
  if (nuevaCategoria?.trim()) {
    const { data } = await supabase
      .from('ingreso_categorias')
      .upsert({ nombre: nuevaCategoria.trim(), icono: 'Tag', color: '#1FA8B8' }, { onConflict: 'nombre' })
      .select('id')
      .single()
    return data?.id ?? null
  }
  return categoriaId || null
}

async function resolverCategoriaGasto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  categoriaId: string | null,
  nuevaCategoria: string | null,
): Promise<string | null> {
  if (nuevaCategoria?.trim()) {
    const { data } = await supabase
      .from('gasto_categorias')
      .upsert({ nombre: nuevaCategoria.trim(), icono: 'Tag', color: '#71717A' }, { onConflict: 'nombre' })
      .select('id')
      .single()
    return data?.id ?? null
  }
  return categoriaId || null
}

// ── Ingresos ─────────────────────────────────────────────────────────────────

export async function crearIngresoAction(
  formData: FormData,
): Promise<{ error?: string; success?: true }> {
  const titulo          = (formData.get('titulo') as string)?.trim()
  const montoRaw        = formData.get('monto') as string
  const categoria_id    = (formData.get('categoria_id') as string) || null
  const nueva_categoria = (formData.get('nueva_categoria') as string) || null
  const fecha           = (formData.get('fecha') as string) || new Date().toISOString()
  const descripcion     = (formData.get('descripcion') as string)?.trim() || null

  if (!titulo) return { error: 'El título es obligatorio' }
  const monto = parseFloat(montoRaw)
  if (isNaN(monto) || monto <= 0) return { error: 'El monto debe ser mayor a 0' }

  const supabase = await createClient()
  const catId    = await resolverCategoriaIngreso(supabase, categoria_id, nueva_categoria)

  const { error } = await supabase.from('ingresos').insert({
    titulo,
    monto,
    categoria_id: catId,
    fecha,
    descripcion,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/finanzas')
  return { success: true }
}

export async function eliminarIngresoAction(
  formData: FormData,
): Promise<{ error?: string }> {
  const id = formData.get('id') as string
  if (!id) return { error: 'ID no especificado' }

  const supabase = await createClient()
  const { error } = await supabase.from('ingresos').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/finanzas')
  return {}
}

// ── Gastos ───────────────────────────────────────────────────────────────────

export async function crearGastoAction(
  formData: FormData,
): Promise<{ error?: string; success?: true }> {
  const titulo          = (formData.get('titulo') as string)?.trim()
  const montoRaw        = formData.get('monto') as string
  const categoria_id    = (formData.get('categoria_id') as string) || null
  const nueva_categoria = (formData.get('nueva_categoria') as string) || null
  const fecha           = (formData.get('fecha') as string) || new Date().toISOString()
  const descripcion     = (formData.get('descripcion') as string)?.trim() || null

  if (!titulo) return { error: 'El título es obligatorio' }
  const monto = parseFloat(montoRaw)
  if (isNaN(monto) || monto <= 0) return { error: 'El monto debe ser mayor a 0' }

  const supabase = await createClient()
  const catId    = await resolverCategoriaGasto(supabase, categoria_id, nueva_categoria)

  const { error } = await supabase.from('gastos').insert({
    titulo,
    monto,
    categoria_id: catId,
    fecha,
    descripcion,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/finanzas')
  return { success: true }
}

export async function eliminarGastoAction(
  formData: FormData,
): Promise<{ error?: string }> {
  const id = formData.get('id') as string
  if (!id) return { error: 'ID no especificado' }

  const supabase = await createClient()
  const { error } = await supabase.from('gastos').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/finanzas')
  return {}
}

// ── Auto-ingreso (llamado desde aprobarSolicitudAction) ───────────────────────

export async function autoCrearIngreso(params: {
  titulo: string
  monto: number
  categoria: string        // plan.categoria ('marketing' | 'diseno' | 'web')
  client_service_id: string
}) {
  try {
    const supabase = await createClient()

    const categoriaMap: Record<string, string> = {
      marketing: 'Marketing',
      diseno:    'Diseño',
      web:       'Web',
    }
    const categoriaNombre = categoriaMap[params.categoria] ?? 'Otro'

    const { data: cat } = await supabase
      .from('ingreso_categorias')
      .select('id')
      .eq('nombre', categoriaNombre)
      .single()

    await supabase.from('ingresos').insert({
      titulo:            params.titulo,
      monto:             params.monto > 0 ? params.monto : 0.01,
      categoria_id:      cat?.id ?? null,
      client_service_id: params.client_service_id,
    })
  } catch (e) {
    console.error('[finanzas] autoCrearIngreso error:', e)
  }
}
