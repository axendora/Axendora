import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  BarChart2, Package, CheckCircle2, Clock, XCircle,
  TrendingUp, FileText, DollarSign, Layers, CalendarDays,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SolicitudesChart } from './_components/solicitudes-chart'
import { ActividadChart } from './_components/actividad-chart'
import type { ServiceEstado } from '@/types/database.types'

type SolicitudRow = {
  estado: string
  created_at: string
}

type FacturaRow = {
  monto: number
  moneda: string
  estado: string
}

type ServicioRow = {
  id: string
  estado: ServiceEstado
  fecha_inicio: string | null
  fecha_fin: string | null
  services: { nombre: string } | null
  plans:    { nombre: string } | null
}

function kpiClass(color: 'primary' | 'success' | 'warning' | 'error') {
  return {
    primary: { bg: 'bg-primary/10',  icon: 'text-primary',  border: 'border-primary/20'  },
    success: { bg: 'bg-success/10',  icon: 'text-success',  border: 'border-success/20'  },
    warning: { bg: 'bg-warning/10',  icon: 'text-warning',  border: 'border-warning/20'  },
    error:   { bg: 'bg-destructive/10', icon: 'text-destructive', border: 'border-destructive/20' },
  }[color]
}

function formatCurrency(amount: number, moneda: string) {
  if (moneda === 'COP') {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

export default async function EstadisticasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    solicitudesRes,
    facturasRes,
    serviciosRes,
    campanasRes,
  ] = await Promise.all([
    supabase
      .from('solicitudes')
      .select('estado, created_at')
      .eq('client_id', user.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('facturas')
      .select('monto, moneda, estado')
      .eq('client_id', user.id),
    supabase
      .from('client_services')
      .select('id, estado, fecha_inicio, fecha_fin, services(nombre)')
      .eq('client_id', user.id)
      .is('plan_id', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('client_services')
      .select('id, estado, fecha_inicio, fecha_fin, plans(nombre)')
      .eq('client_id', user.id)
      .not('plan_id', 'is', null)
      .order('created_at', { ascending: false }),
  ])

  const solicitudes = (solicitudesRes.data ?? []) as SolicitudRow[]
  const facturas    = (facturasRes.data ?? []) as FacturaRow[]
  const servicios   = (serviciosRes.data ?? []) as unknown as ServicioRow[]
  const campanas    = (campanasRes.data ?? []) as unknown as ServicioRow[]

  // ── Solicitudes por estado ──────────────────────────────────────────────────
  const solCount = (estado: string) => solicitudes.filter((s) => s.estado === estado).length
  const totalSolicitudes = solicitudes.length
  const resueltas = solCount('resuelta') + solCount('aprobada')
  const tasaResolucion = totalSolicitudes > 0 ? Math.round((resueltas / totalSolicitudes) * 100) : 0

  // ── Actividad mensual (últimos 6 meses) ─────────────────────────────────────
  const now = new Date()
  const mesData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const label = d.toLocaleString('es', { month: 'short' })
    const año = d.getFullYear()
    const mes = d.getMonth()
    return {
      mes: `${label} ${año !== now.getFullYear() ? año : ''}`.trim(),
      solicitudes: solicitudes.filter((s) => {
        const dt = new Date(s.created_at)
        return dt.getFullYear() === año && dt.getMonth() === mes
      }).length,
    }
  })

  // ── Facturas ────────────────────────────────────────────────────────────────
  const factPagadas  = facturas.filter((f) => f.estado === 'pagada')
  const factPend     = facturas.filter((f) => f.estado === 'pendiente')
  const factVencidas = facturas.filter((f) => f.estado === 'vencida')

  const sumUSD = (rows: FacturaRow[]) =>
    rows.filter((f) => f.moneda === 'USD').reduce((s, f) => s + Number(f.monto), 0)
  const sumCOP = (rows: FacturaRow[]) =>
    rows.filter((f) => f.moneda === 'COP').reduce((s, f) => s + Number(f.monto), 0)

  // ── Servicios + campañas activos ────────────────────────────────────────────
  const serviciosActivos  = servicios.filter((s) => s.estado === 'activo').length
  const campanasActivas   = campanas.filter((c) => c.estado === 'activo').length
  const totalContratos    = servicios.length + campanas.length

  // ── Timeline combinado (servicios + planes) ─────────────────────────────────
  const timeline = [
    ...servicios.map((s) => ({
      id: s.id, nombre: s.services?.nombre ?? '—',
      tipo: 'Servicio', estado: s.estado,
      inicio: s.fecha_inicio, fin: s.fecha_fin,
    })),
    ...campanas.map((c) => ({
      id: c.id, nombre: c.plans?.nombre ?? '—',
      tipo: 'Plan', estado: c.estado,
      inicio: c.fecha_inicio, fin: c.fecha_fin,
    })),
  ].sort((a, b) => {
    const da = a.inicio ? new Date(a.inicio).getTime() : 0
    const db = b.inicio ? new Date(b.inicio).getTime() : 0
    return db - da
  }).slice(0, 6)

  const estadoServBadge: Record<ServiceEstado, { label: string; cls: string }> = {
    en_configuracion: { label: 'Configurando', cls: 'bg-warning/10 text-warning'         },
    activo:           { label: 'Activo',        cls: 'bg-success/10 text-success'         },
    pausado:          { label: 'Pausado',        cls: 'bg-muted text-muted-foreground'     },
    finalizado:       { label: 'Finalizado',     cls: 'bg-border text-muted-foreground'    },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Estadísticas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen de tu actividad, servicios y facturación con Axendora.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Servicios activos */}
        <KpiCard
          icon={<Package size={18} />}
          label="Contratos activos"
          value={serviciosActivos + campanasActivas}
          sub={`${totalContratos} total`}
          color="primary"
        />
        {/* Tasa resolución */}
        <KpiCard
          icon={<CheckCircle2 size={18} />}
          label="Tasa de resolución"
          value={`${tasaResolucion}%`}
          sub={`${resueltas} de ${totalSolicitudes} solicitudes`}
          color="success"
        />
        {/* Solicitudes abiertas */}
        <KpiCard
          icon={<Clock size={18} />}
          label="Solicitudes activas"
          value={solCount('abierta') + solCount('en_proceso')}
          sub="Pendientes o en revisión"
          color="warning"
        />
        {/* Facturas vencidas */}
        <KpiCard
          icon={<XCircle size={18} />}
          label="Facturas vencidas"
          value={factVencidas.length}
          sub={factVencidas.length > 0 ? 'Requieren atención' : 'Todo al día'}
          color={factVencidas.length > 0 ? 'error' : 'success'}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Solicitudes por estado */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-1 flex items-center gap-2">
            <BarChart2 size={16} className="text-primary" />
            <h2 className="text-sm font-semibold">Solicitudes por estado</h2>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">{totalSolicitudes} solicitudes en total</p>
          <SolicitudesChart
            abierta={solCount('abierta')}
            en_proceso={solCount('en_proceso')}
            resuelta={solCount('resuelta')}
            cerrada={solCount('cerrada')}
            aprobada={solCount('aprobada')}
            rechazada={solCount('rechazada')}
          />
        </div>

        {/* Actividad mensual */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            <h2 className="text-sm font-semibold">Actividad mensual</h2>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">Solicitudes creadas en los últimos 6 meses</p>
          <ActividadChart data={mesData} />
        </div>
      </div>

      {/* Facturación */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <DollarSign size={16} className="text-primary" />
          <h2 className="text-sm font-semibold">Resumen de facturación</h2>
        </div>

        {facturas.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Aún no tienes facturas emitidas.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Pagadas */}
            <div className="rounded-xl border border-success/20 bg-success/5 p-4">
              <p className="text-xs text-muted-foreground">Pagado</p>
              <p className="mt-1 text-xl font-bold text-success">{factPagadas.length}</p>
              <p className="mt-0.5 text-xs text-success/70">
                {sumUSD(factPagadas) > 0 && formatCurrency(sumUSD(factPagadas), 'USD')}
                {sumUSD(factPagadas) > 0 && sumCOP(factPagadas) > 0 && ' · '}
                {sumCOP(factPagadas) > 0 && formatCurrency(sumCOP(factPagadas), 'COP')}
                {factPagadas.length === 0 && '—'}
              </p>
            </div>
            {/* Pendientes */}
            <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
              <p className="text-xs text-muted-foreground">Pendiente</p>
              <p className="mt-1 text-xl font-bold text-warning">{factPend.length}</p>
              <p className="mt-0.5 text-xs text-warning/70">
                {sumUSD(factPend) > 0 && formatCurrency(sumUSD(factPend), 'USD')}
                {sumUSD(factPend) > 0 && sumCOP(factPend) > 0 && ' · '}
                {sumCOP(factPend) > 0 && formatCurrency(sumCOP(factPend), 'COP')}
                {factPend.length === 0 && '—'}
              </p>
            </div>
            {/* Vencidas */}
            <div className={cn(
              'rounded-xl border p-4',
              factVencidas.length > 0
                ? 'border-destructive/20 bg-destructive/5'
                : 'border-border bg-muted/30',
            )}>
              <p className="text-xs text-muted-foreground">Vencida</p>
              <p className={cn('mt-1 text-xl font-bold', factVencidas.length > 0 ? 'text-destructive' : 'text-foreground')}>
                {factVencidas.length}
              </p>
              <p className={cn('mt-0.5 text-xs', factVencidas.length > 0 ? 'text-destructive/70' : 'text-muted-foreground')}>
                {sumUSD(factVencidas) > 0 && formatCurrency(sumUSD(factVencidas), 'USD')}
                {sumUSD(factVencidas) > 0 && sumCOP(factVencidas) > 0 && ' · '}
                {sumCOP(factVencidas) > 0 && formatCurrency(sumCOP(factVencidas), 'COP')}
                {factVencidas.length === 0 && 'Todo al día ✓'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Timeline de servicios/planes */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Layers size={16} className="text-primary" />
          <h2 className="text-sm font-semibold">Historial de servicios y planes</h2>
        </div>

        {timeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarDays size={32} className="mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Aún no tienes servicios ni planes contratados.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {timeline.map((item) => {
              const badge = estadoServBadge[item.estado as ServiceEstado]
              return (
                <div key={item.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      {item.tipo === 'Plan' ? (
                        <BarChart2 size={14} className="text-primary" />
                      ) : (
                        <Package size={14} className="text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-muted-foreground/60">{item.tipo}</span>
                        {item.inicio && ` · Desde ${formatDate(item.inicio)}`}
                        {item.fin    && ` · Hasta ${formatDate(item.fin)}`}
                      </p>
                    </div>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', badge.cls)}>
                    {badge.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Métricas rápidas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <FileText size={20} className="mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{totalSolicitudes}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Total de solicitudes</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <CheckCircle2 size={20} className="mx-auto mb-2 text-success" />
          <p className="text-2xl font-bold text-success">{tasaResolucion}%</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Tasa de resolución</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <Package size={20} className="mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{totalContratos}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Contratos históricos</p>
        </div>
      </div>
    </div>
  )
}

// ── KpiCard ─────────────────────────────────────────────────────────────────────

function KpiCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub: string
  color: 'primary' | 'success' | 'warning' | 'error'
}) {
  const cls = kpiClass(color)
  return (
    <div className={cn('rounded-xl border p-5', cls.border, 'bg-card')}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', cls.bg, cls.icon)}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}
