import { createClient } from '@/lib/supabase/server'
import { getAgencyTimezone } from '@/lib/timezone.server'
import { formatDate, formatRelative } from '@/lib/timezone'
import Link from 'next/link'
import {
  Users,
  Package,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowRight,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SolicitudEstado, SolicitudTipo, SolicitudPrioridad } from '@/types/database.types'
import { KpiCard } from '@/components/admin/kpi-card'
import { SolicitudesTrendChart } from '@/components/admin/solicitudes-trend-chart'
import { SolicitudesEstadoChart } from '@/components/dashboard/charts/solicitudes-estado-chart'

// timezone helpers now imported from @/lib/timezone
const estadoConfig: Record<SolicitudEstado, { label: string; className: string }> = {
  abierta:    { label: 'Abierta',    className: 'bg-[#14A8B6]/10 text-[#14A8B6]' },
  en_proceso: { label: 'En proceso', className: 'bg-[#F59E0B]/10 text-[#F59E0B]' },
  resuelta:   { label: 'Resuelta',   className: 'bg-[#10B981]/10 text-[#10B981]' },
  cerrada:    { label: 'Cerrada',    className: 'bg-[#27272A] text-[#71717A]' },
  aprobada:   { label: 'Aprobada',   className: 'bg-[#10B981]/10 text-[#10B981]' },
  rechazada:  { label: 'Rechazada',  className: 'bg-[#EF4444]/10 text-[#EF4444]' },
}

const tipoLabel: Record<SolicitudTipo, string> = {
  soporte: 'Soporte', consulta: 'Consulta', cambio: 'Cambio', plan: 'Plan', otro: 'Otro',
}

const prioridadConfig: Record<SolicitudPrioridad, { label: string; className: string }> = {
  baja:  { label: 'Baja',  className: 'text-[#71717A]' },
  media: { label: 'Media', className: 'text-[#F59E0B]' },
  alta:  { label: 'Alta',  className: 'text-[#EF4444]' },
}


function getLast6Months() {
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

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const timezone = await getAgencyTimezone()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

  const months = getLast6Months()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const since = sixMonthsAgo.toISOString()

  const [
    { count: totalClientes },
    { count: clientesEsteMes },
    { count: clientesMesAnterior },
    { count: serviciosActivos },
    { count: solicitudesAbiertas },
    { count: solicitudesEnProceso },
    { data: solicitudesRecientes },
    { data: solicitudesTrend },
    { data: todasSolicitudes },
    { data: actividadReciente },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'client').gte('created_at', startOfMonth),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'client').gte('created_at', startOfLastMonth).lt('created_at', startOfMonth),
    supabase.from('client_services').select('id', { count: 'exact', head: true }).eq('estado', 'activo'),
    supabase.from('solicitudes').select('id', { count: 'exact', head: true }).eq('estado', 'abierta'),
    supabase.from('solicitudes').select('id', { count: 'exact', head: true }).eq('estado', 'en_proceso'),
    supabase
      .from('solicitudes')
      .select('id, titulo, tipo, estado, prioridad, created_at')
      .in('estado', ['abierta', 'en_proceso'])
      .order('prioridad', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('solicitudes').select('created_at').gte('created_at', since),
    supabase.from('solicitudes').select('estado, tipo'),
    supabase
      .from('solicitudes')
      .select('id, titulo, estado, tipo, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const clientesTrend: number | undefined =
    (clientesMesAnterior ?? 0) > 0
      ? Math.round(
          (((clientesEsteMes ?? 0) - (clientesMesAnterior ?? 0)) / (clientesMesAnterior ?? 1)) *
            100,
        )
      : undefined

  const pendientesTotal = (solicitudesAbiertas ?? 0) + (solicitudesEnProceso ?? 0)
  const trendData = groupByMonth(solicitudesTrend ?? [], months)

  const tipoCounts: Record<string, number> = {}
  for (const s of todasSolicitudes ?? []) {
    tipoCounts[s.tipo] = (tipoCounts[s.tipo] ?? 0) + 1
  }
  const tipoChartData = [
    { name: 'Soporte',   value: tipoCounts['soporte']  ?? 0, color: '#14A8B6' },
    { name: 'Consulta',  value: tipoCounts['consulta'] ?? 0, color: '#5BC7D2' },
    { name: 'Cambio',    value: tipoCounts['cambio']   ?? 0, color: '#0A6670' },
    { name: 'Otro',      value: tipoCounts['otro']     ?? 0, color: '#3F3F46' },
  ].filter((d) => d.value > 0)

  const kpis = [
    {
      label: 'Clientes registrados',
      value: totalClientes ?? 0,
      iconNode: <Users size={18} className="text-[#14A8B6]" />,
      href: '/admin/clientes',
      change: clientesTrend,
    },
    {
      label: 'Servicios activos',
      value: serviciosActivos ?? 0,
      iconNode: <Package size={18} className="text-[#14A8B6]" />,
      href: '/admin/servicios',
      change: undefined,
    },
    {
      label: 'Solicitudes abiertas',
      value: solicitudesAbiertas ?? 0,
      iconNode: <MessageSquare size={18} className="text-[#14A8B6]" />,
      href: '/admin/solicitudes',
      change: undefined,
    },
    {
      label: 'En proceso',
      value: pendientesTotal,
      iconNode: <Clock size={18} className="text-[#14A8B6]" />,
      href: '/admin/solicitudes',
      change: undefined,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Panel de administración
        </h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">Resumen general de Axendora.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            iconNode={kpi.iconNode}
            href={kpi.href}
            change={kpi.change}
            index={i}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend area chart */}
        <div className="rounded-xl border border-[#27272A] bg-[#121212] p-6 lg:col-span-2">
          <div className="mb-6">
            <h2 className="font-semibold text-white">Tendencia de solicitudes</h2>
            <p className="mt-0.5 text-xs text-[#71717A]">Últimos 6 meses</p>
          </div>
          <SolicitudesTrendChart data={trendData} />
        </div>

        {/* Donut chart */}
        <div className="rounded-xl border border-[#27272A] bg-[#121212] p-6">
          <div className="mb-4">
            <h2 className="font-semibold text-white">Por tipo</h2>
            <p className="mt-0.5 text-xs text-[#71717A]">Distribución de solicitudes</p>
          </div>
          {tipoChartData.length > 0 ? (
            <SolicitudesEstadoChart data={tipoChartData} />
          ) : (
            <div className="flex h-44 flex-col items-center justify-center gap-2">
              <Activity size={28} className="text-[#27272A]" />
              <p className="text-sm text-[#71717A]">Sin datos aún</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Solicitudes pendientes */}
        <div className="rounded-xl border border-[#27272A] bg-[#121212] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#27272A] px-6 py-4">
            <h2 className="font-semibold text-white">Solicitudes pendientes</h2>
            <Link
              href="/admin/solicitudes"
              className="flex items-center gap-1 text-xs text-[#14A8B6] hover:underline"
            >
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>

          {!solicitudesRecientes?.length ? (
            <div className="flex flex-col items-center justify-center py-14">
              <CheckCircle size={32} className="mb-3 text-[#10B981]" />
              <p className="text-sm text-[#71717A]">Sin solicitudes pendientes</p>
            </div>
          ) : (
            <div className="divide-y divide-[#27272A]">
              {solicitudesRecientes.map((s) => {
                const estado = estadoConfig[s.estado as SolicitudEstado]
                const prioridad = prioridadConfig[s.prioridad as SolicitudPrioridad]
                return (
                  <Link
                    key={s.id}
                    href={`/admin/solicitudes/${s.id}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-[#1A1A1A]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{s.titulo}</p>
                      <p className="text-xs text-[#71717A]">
                        {tipoLabel[s.tipo as SolicitudTipo]} · {formatDate(s.created_at, timezone, { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={cn('text-xs font-medium', prioridad.className)}>
                        {prioridad.label}
                      </span>
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-medium',
                          estado.className,
                        )}
                      >
                        {estado.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Actividad reciente */}
        <div className="rounded-xl border border-[#27272A] bg-[#121212]">
          <div className="border-b border-[#27272A] px-6 py-4">
            <h2 className="font-semibold text-white">Actividad reciente</h2>
          </div>
          {!actividadReciente?.length ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Activity size={28} className="mb-2 text-[#27272A]" />
              <p className="text-sm text-[#71717A]">Sin actividad</p>
            </div>
          ) : (
            <div className="divide-y divide-[#27272A]">
              {actividadReciente.map((a) => (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#14A8B6]/10">
                    <Activity size={13} className="text-[#14A8B6]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{a.titulo}</p>
                    <p className="text-xs text-[#71717A]">
                      {tipoLabel[a.tipo as SolicitudTipo]} · {formatRelative(a.created_at, timezone)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
