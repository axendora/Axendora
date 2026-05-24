'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SolicitarPlanState =
  | null
  | { error: string }
  | { success: true; planNombre: string; duracionDias: number | null }

export async function solicitarPlanAction(
  _: SolicitarPlanState,
  formData: FormData,
): Promise<SolicitarPlanState> {
  const plan_id = formData.get('plan_id') as string
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

  const tipoLabel = plan.tipo_precio === 'mensual' ? 'recurrente mensual' : 'pago único'
  const duracionTxt = plan.duracion_dias
    ? ` Duración por defecto: ${plan.duracion_dias} días.`
    : ''

  const { error } = await supabase
    .from('solicitudes')
    .insert({
      client_id:   user.id,
      titulo:      `Contratación: ${plan.nombre}`,
      descripcion: `Solicitud de contratación del plan "${plan.nombre}" (${tipoLabel}).${duracionTxt} El equipo de Axendora se pondrá en contacto contigo para coordinar el inicio del servicio.`,
      tipo:        'plan',
      estado:      'abierta',
      prioridad:   'media',
      plan_id,
    })

  if (error) return { error: error.message }

  revalidatePath('/cliente/solicitudes')
  revalidatePath('/admin/solicitudes')

  return {
    success: true,
    planNombre: plan.nombre,
    duracionDias: plan.duracion_dias,
  }
}
