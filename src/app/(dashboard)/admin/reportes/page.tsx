import { createClient } from '@/lib/supabase/server'
import { SolicitudesEstadoChart } from '@/components/dashboard/charts/solicitudes-estado-chart'
import { SolicitudesMesChart } from '@/components/dashboard/charts/solicitudes-mes-chart'
import { ClientesMesChart } from '@/components/dashboard/charts/clientes-mes-chart'
import { SolicitudesTipoChart } from '@/components/dashboard/charts/solicitudes-tipo-chart'

function getLast6Months(): { key: string; label: string }[] {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('es', { month: 'short', year: '2-digit' })
    months.push({ key, label })
  }
  return months
}

function groupByMonth<T extends { created_at: string }>(
  items: T[],
  months: { key: string; label: string }[],
): { mes: string; total: number }[] {
  const counts: Record<string, number> = {}
  for (const item of items) {
    const d = new Date(item.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    counts[key] = (counts[key] ?? 0) + 1
  }
  return months.map(({ key, label }) => ({ mes: label, total: counts[key] ?? 0 }))
}

export default async function AdminReportesPage() {
  const supabase = await createClient()
  const months = getLast6Months()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const since = sixMonthsAgo.toISOString()

  const [
    { data: todasSolicitudes },
    { data: solicitudesRecientes },
    { data: clientesRecientes },
  ] = await Promise.all([
    supabase.from('solicitudes').select('estado, tipo'),
    supabase
      .from('solicitudes')
      .select('created_at')
      .gte('created_at', since),
    supabase
      .from('profiles')
      .select('created_at')
      .eq('role', 'client')
      .gte('created_at', since),
  ])

  // Solicitudes por estado (donut)
  const estadoCounts: Record<string, number> = {}
  for (const s of todasSolicitudes ?? []) {
    estadoCounts[s.estado] = (estadoCounts[s.estado] ?? 0) + 1
  }
  const estadoData = [
    { name: 'Abierta',    value: estadoCounts['abierta']    ?? 0, color: '#1FA8B8' },
    { name: 'En proceso', value: estadoCounts['en_proceso'] ?? 0, color: '#F59E0B' },
    { name: 'Resuelta',   value: estadoCounts['resuelta']   ?? 0, color: '#10B981' },
    { name: 'Cerrada',    value: estadoCounts['cerrada']    ?? 0, color: '#3F3F46' },
  ].filter((d) => d.value > 0)

  // Solicitudes por tipo (barras horizontales)
  const tipoCounts: Record<string, number> = {}
  for (const s of todasSolicitudes ?? []) {
    tipoCounts[s.tipo] = (tipoCounts[s.tipo] ?? 0) + 1
  }
  const tipoLabels: Record<string, string> = {
    soporte: 'Soporte', consulta: 'Consulta', cambio: 'Cambio', otro: 'Otro',
  }
  const tipoData = Object.entries(tipoCounts).map(([tipo, total]) => ({
    tipo: tipoLabels[tipo] ?? tipo,
    total,
  }))

  // Solicitudes por mes
  const solicitudesMes = groupByMonth(solicitudesRecientes ?? [], months).map(
    ({ mes, total }) => ({ mes, total }),
  )

  // Clientes por mes
  const clientesMes = groupByMonth(clientesRecientes ?? [], months).map(
    ({ mes, total }) => ({ mes, clientes: total }),
  )

  const totalSolicitudes = todasSolicitudes?.length ?? 0
  const totalPendientes =
    (estadoCounts['abierta'] ?? 0) + (estadoCounts['en_proceso'] ?? 0)
  const tasaResolucion =
    totalSolicitudes > 0
      ? Math.round(((estadoCounts['resuelta'] ?? 0) / totalSolicitudes) * 100)
      : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Reportes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Métricas generales del CRM de Axendora.
        </p>
      </div>

      {/* KPIs rápidos */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total solicitudes</p>
          <p className="mt-2 text-3xl font-semibold">{totalSolicitudes}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Pendientes activas</p>
          <p className="mt-2 text-3xl font-semibold text-warning">{totalPendientes}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Tasa de resolución</p>
          <p className="mt-2 text-3xl font-semibold text-success">{tasaResolucion}%</p>
        </div>
      </div>

      {/* Gráficas — fila 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Solicitudes por estado</h2>
          <SolicitudesEstadoChart data={estadoData} />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Solicitudes por tipo</h2>
          <SolicitudesTipoChart data={tipoData} />
        </div>
      </div>

      {/* Gráficas — fila 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-1 text-sm font-semibold">Solicitudes por mes</h2>
          <p className="mb-4 text-xs text-muted-foreground">Últimos 6 meses</p>
          <SolicitudesMesChart data={solicitudesMes} />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-1 text-sm font-semibold">Clientes nuevos por mes</h2>
          <p className="mb-4 text-xs text-muted-foreground">Últimos 6 meses</p>
          <ClientesMesChart data={clientesMes} />
        </div>
      </div>
    </div>
  )
}
