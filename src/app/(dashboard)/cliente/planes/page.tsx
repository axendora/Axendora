import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Layers, AlertTriangle } from 'lucide-react'
import { PLAN_CATEGORIAS } from '@/lib/plans'
import { getAgencyTimezone } from '@/lib/timezone.server'
import { toLocalDateKey } from '@/lib/timezone'
import { PlanCard } from './_components/plan-card'
import type { PlanCategoria, TipoPrecio } from '@/types/database.types'

export type OfertaActiva = {
  id: string
  titulo: string
  tipo_descuento: 'porcentaje' | 'monto_fijo'
  valor_descuento: number
  moneda: 'USD' | 'COP'
  codigo_promo: string | null
  plan_id: string | null
}

type PlanRow = {
  id: string
  nombre: string
  descripcion: string | null
  categoria: PlanCategoria
  precio_usd: number | null
  precio_cop: number | null
  tipo_precio: TipoPrecio
  imagen_url: string | null
  icono: string | null
  destacado: boolean
  activo: boolean
}

function resolveOfertaParaPlan(planId: string, ofertas: OfertaActiva[]): OfertaActiva | null {
  // Oferta específica para este plan tiene prioridad
  const especifica = ofertas.find((o) => o.plan_id === planId)
  if (especifica) return especifica
  // Si no, tomar la oferta global (sin plan específico)
  return ofertas.find((o) => o.plan_id === null) ?? null
}

export default async function ClientePlanesPage() {
  const supabase  = await createClient()
  const timezone  = await getAgencyTimezone()
  const today     = toLocalDateKey(new Date(), timezone)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [planesRes, profileRes, ofertasRes] = await Promise.all([
    supabase
      .from('plans')
      .select('id, nombre, descripcion, categoria, precio_usd, precio_cop, tipo_precio, imagen_url, icono, destacado, activo')
      .eq('activo', true)
      .order('destacado', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('nombre')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('ofertas')
      .select('id, titulo, tipo_descuento, valor_descuento, moneda, codigo_promo, plan_id')
      .eq('activo', true)
      .lte('fecha_inicio', today)
      .or(`fecha_fin.is.null,fecha_fin.gte.${today}`)
      .order('created_at', { ascending: false }),
  ])

  const { data: planes, error: planesError } = planesRes
  const clientName = profileRes.data?.nombre ?? 'Cliente'
  // Si la tabla de ofertas no existe aún, degradar sin error
  const ofertas = (!ofertasRes.error ? (ofertasRes.data ?? []) : []) as OfertaActiva[]

  // Service client bypasses RLS — always reads whatsapp regardless of policies
  const serviceSupabase = await createServiceClient()
  const { data: agencyData } = await serviceSupabase
    .from('agency_settings')
    .select('whatsapp')
    .limit(1)
    .single()
  const whatsapp: string | null = agencyData?.whatsapp ?? null

  if (planesError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Planes disponibles</h1>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-warning/30 bg-warning/5 px-6 py-12 text-center">
          <AlertTriangle size={32} className="mb-3 text-warning" />
          <p className="text-sm font-medium">Sección en preparación</p>
          <p className="mt-2 max-w-md text-xs text-muted-foreground">
            La tabla de planes todavía no está disponible. El equipo está terminando la configuración.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Planes disponibles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Elige el plan que mejor se ajuste a tu negocio. Te contactaremos por WhatsApp o desde el panel para coordinar el inicio.
        </p>
      </div>

      {!planes?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
          <Layers size={36} className="mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Aún no hay planes disponibles. Vuelve a revisar pronto.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {PLAN_CATEGORIAS.map(({ value, label, Icon: CatIcon }) => {
            const items = (planes as PlanRow[]).filter((p) => p.categoria === value)
            if (items.length === 0) return null
            return (
              <section key={value}>
                <div className="mb-4 flex items-center gap-2">
                  <CatIcon size={20} className="text-primary" />
                  <h2 className="text-lg font-semibold">{label}</h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      oferta={resolveOfertaParaPlan(plan.id, ofertas)}
                      whatsapp={whatsapp}
                      clientName={clientName}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
