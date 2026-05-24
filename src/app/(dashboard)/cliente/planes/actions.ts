'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SolicitarPlanState =
  | null
  | { error: string }
  | { success: true; planNombre: string; duracionDias: number | null; ofertaTitulo?: string; whatsapp: string | null }

export async function solicitarPlanAction(
  _: SolicitarPlanState,
  formData: FormData,
): Promise<SolicitarPlanState> {
  const plan_id    = formData.get('plan_id') as string
  const oferta_id  = formData.get('oferta_id') as string | null
  if (!plan_id) return { error: 'Plan no especificado' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: plan, error: planErr } = await supabase
    .from('plans')
    .select('nombre, categoria, tipo_precio, duracion_dias')
    .eq('id', plan_id)
    .single()

  if (planErr) return { error: `Error al buscar el plan: ${planErr.message}` }
  if (!plan)   return { error: 'Plan no encontrado' }

  // Resolver oferta aplicada (si la hay)
  let ofertaLinea = ''
  let ofertaTitulo: string | undefined

  if (oferta_id) {
    const { data: oferta } = await supabase
      .from('ofertas')
      .select('titulo, tipo_descuento, valor_descuento, moneda, codigo_promo')
      .eq('id', oferta_id)
      .eq('activo', true)
      .single()

    if (oferta) {
      const descuento =
        oferta.tipo_descuento === 'porcentaje'
          ? `${oferta.valor_descuento}% de descuento`
          : `$${oferta.valor_descuento} ${oferta.moneda} de descuento`
      const codigo = oferta.codigo_promo ? ` (código: ${oferta.codigo_promo})` : ''
      ofertaLinea  = ` Con oferta aplicada: "${oferta.titulo}" — ${descuento}${codigo}.`
      ofertaTitulo = oferta.titulo
    }
  }

  const tipoLabel  = plan.tipo_precio === 'mensual' ? 'recurrente mensual' : 'pago único'
  const duracionTxt = plan.duracion_dias ? ` Duración por defecto: ${plan.duracion_dias} días.` : ''

  const { error } = await supabase
    .from('solicitudes')
    .insert({
      client_id:   user.id,
      titulo:      `Contratación: ${plan.nombre}`,
      descripcion: `Solicitud de contratación del plan "${plan.nombre}" (${tipoLabel}).${duracionTxt}${ofertaLinea} El equipo de Axendora se pondrá en contacto contigo para coordinar el inicio del servicio.`,
      tipo:        'plan',
      estado:      'abierta',
      prioridad:   'media',
      plan_id,
    })

  if (error) return { error: error.message }

  // Obtener WhatsApp del admin via RPC (SECURITY DEFINER — bypasa RLS siempre)
  const { data: whatsappResult } = await supabase.rpc('get_admin_whatsapp')
  const adminWhatsapp: string | null = (whatsappResult as unknown as string) || null

  revalidatePath('/cliente/solicitudes')
  revalidatePath('/admin/solicitudes')

  return {
    success:      true,
    planNombre:   plan.nombre,
    duracionDias: plan.duracion_dias,
    ofertaTitulo,
    whatsapp:     adminWhatsapp,
  }
}
