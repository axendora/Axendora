import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Layers, AlertTriangle } from 'lucide-react'
import { PLAN_CATEGORIAS } from '@/lib/plans'
import { PlanCard } from './_components/plan-card'

export default async function ClientePlanesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [planesRes, profileRes] = await Promise.all([
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
  ])

  const { data: planes, error: planesError } = planesRes
  const clientName = profileRes.data?.nombre ?? 'Cliente'

  // RPC opcional: si la función no existe, degradar sin WhatsApp
  let whatsapp: string | null = null
  try {
    const wa = await (supabase as unknown as {
      rpc: (fn: string) => Promise<{ data: string | null; error: unknown }>
    }).rpc('get_admin_whatsapp')
    whatsapp = wa.data ?? null
  } catch {
    whatsapp = null
  }

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
            const items = planes.filter((p) => p.categoria === value)
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
