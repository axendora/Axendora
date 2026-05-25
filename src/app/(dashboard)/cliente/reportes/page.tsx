import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import {
  FileText, Package, CheckCircle2, Clock, AlertTriangle,
  Ban, CalendarDays, BarChart2, Layers, Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PeriodoSelector } from './_components/periodo-selector'
import { PrintButton } from './_components/print-button'
import type { SolicitudEstado, SolicitudTipo, SolicitudPrioridad, ServiceEstado, FacturaEstado, MonedaTipo } from '@/types/database.types'

// ── Tipos ────────────────────────────────────────────────────────────────────

type SolicitudRow = {
  id: string
  titulo: string
  tipo: SolicitudTipo
  estado: SolicitudEstado
  prioridad: SolicitudPrioridad
  created_at: string
  updated_at: string
}

type ServicioRow = {
  id: string
  estado: ServiceEstado
  fecha_inicio: string | null
  fecha_fin: string | null
  duracion_dias: number | null
  services: { nombre: string } | null
  plans:    { nombre: string } | null
}

type FacturaRow = {
  id: string
  numero: string
  concepto: string
  monto: number
  moneda: MonedaTipo
  estado: FacturaEstado
  fecha_emision: string
  fecha_vencimiento: string | null
  fecha_pago: string | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function periodoToDate(periodo: string): Date | null {
  const now = new Date()
  if (periodo === '30d') return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  if (periodo === '3m')  return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
  if (periodo === '6m')  return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
  if (periodo === '1a')  return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  return null
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

function formatCurrency(amount: number, moneda: string) {
  if (moneda === 'COP') return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

// ── Config badges ────────────────────────────────────────────────────────────

const solicitudEstado: Record<SolicitudEstado, { label: string; cls: string }> = {
  abierta:    { label: 'Pendiente',  cls: 'bg-primary/10 text-primary' },
  en_proceso: { label: 'En revisión', cls: 'bg-warning/10 text-warning' },
  resuelta:   { label: 'Resuelta',   cls: 'bg-success/10 text-success' },
  cerrada:    { label: 'Cerrada',    cls: 'bg-muted text-muted-foreground' },
  aprobada:   { label: 'Aprobada',   cls: 'bg-success/10 text-success' },
  rechazada:  { label: 'Rechazada',  cls: 'bg-destructive/10 text-destructive' },
}

const solicitudTipo: Record<SolicitudTipo, string> = {
  soporte: 'Soporte', consulta: 'Consulta', cambio: 'Cambio', plan: 'Plan', otro: 'Otro',
}

const solicitudPrioridad: Record<SolicitudPrioridad, { label: string; cls: string }> = {
  baja:  { label: 'Baja',  cls: 'text-muted-foreground' },
  media: { label: 'Media', cls: 'text-warning' },
  alta:  { label: 'Alta',  cls: 'text-destructive font-semibold' },
}

const servicioEstado: Record<ServiceEstado, { label: string; cls: string }> = {
  en_configuracion: { label: 'Configurando', cls: 'bg-warning/10 text-warning' },
  activo:           { label: 'Activo',        cls: 'bg-success/10 text-success' },
  pausado:          { label: 'Pausado',        cls: 'bg-muted text-muted-foreground' },
  finalizado:       { label: 'Finalizado',     cls: 'bg-border text-muted-foreground' },
}

const facturaEstado: Record<FacturaEstado, { label: string; cls: string; icon: React.ElementType }> = {
  pendiente: { label: 'Pendiente', cls: 'bg-warning/10 text-warning',         icon: Clock        },
  pagada:    { label: 'Pagada',    cls: 'bg-success/10 text-success',          icon: CheckCircle2 },
  vencida:   { label: 'Vencida',   cls: 'bg-destructive/10 text-destructive',  icon: AlertTriangle },
  cancelada: { label: 'Cancelada', cls: 'bg-muted text-muted-foreground',      icon: Ban          },
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { periodo = '6m' } = await searchParams
  const desde = periodoToDate(periodo)
  const desdeISO = desde?.toISOString()

  const [solicitudesRes, serviciosRes, campanasRes, facturasRes, profileRes] = await Promise.all([
    supabase
      .from('solicitudes')
      .select('id, titulo, tipo, estado, prioridad, created_at, updated_at')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .then((res) => desdeISO
        ? { ...res, data: (res.data ?? []).filter((s) => s.created_at >= desdeISO) }
        : res),
    supabase
      .from('client_services')
      .select('id, estado, fecha_inicio, fecha_fin, duracion_dias, services(nombre)')
      .eq('client_id', user.id)
      .is('plan_id', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('client_services')
      .select('id, estado, fecha_inicio, fecha_fin, duracion_dias, plans(nombre)')
      .eq('client_id', user.id)
      .not('plan_id', 'is', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('facturas')
      .select('id, numero, concepto, monto, moneda, estado, fecha_emision, fecha_vencimiento, fecha_pago')
      .eq('client_id', user.id)
      .order('fecha_emision', { ascending: false })
      .then((res) => desdeISO
        ? { ...res, data: (res.data ?? []).filter((f) => f.fecha_emision >= desdeISO.slice(0, 10)) }
        : res),
    supabase.from('profiles').select('nombre').eq('user_id', user.id).single(),
  ])

  const solicitudes = (solicitudesRes.data ?? []) as SolicitudRow[]
  const servicios   = (serviciosRes.data ?? []) as unknown as ServicioRow[]
  const campanas    = (campanasRes.data ?? []) as unknown as ServicioRow[]
  const facturas    = (facturasRes.data ?? []) as FacturaRow[]
  const clientName  = profileRes.data?.nombre ?? 'Cliente'

  // Resumen período
  const resueltas   = solicitudes.filter((s) => ['resuelta', 'aprobada'].includes(s.estado)).length
  const factPagadas = facturas.filter((f) => f.estado === 'pagada')
  const totalPagado = {
    usd: factPagadas.filter((f) => f.moneda === 'USD').reduce((s, f) => s + Number(f.monto), 0),
    cop: factPagadas.filter((f) => f.moneda === 'COP').reduce((s, f) => s + Number(f.monto), 0),
  }

  const periodoLabel: Record<string, string> = {
    '30d': 'últimos 30 días', '3m': 'últimos 3 meses',
    '6m': 'últimos 6 meses', '1a': 'último año', 'todo': 'todo el historial',
  }

  const generadoEl = new Intl.DateTimeFormat('es', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date())

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:flex-row print:items-center">
        <div>
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Reportes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reporte de {periodoLabel[periodo]} · Generado el {generadoEl}
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <PrintButton />
        </div>
      </div>

      {/* Período selector */}
      <Suspense>
        <div className="print:hidden">
          <PeriodoSelector />
        </div>
      </Suspense>

      {/* Resumen ejecutivo */}
      <section>
        <SectionTitle icon={<BarChart2 size={16} />} title="Resumen ejecutivo" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ResumenCard label="Solicitudes" value={solicitudes.length} sub={`${resueltas} resueltas`} />
          <ResumenCard label="Servicios activos" value={servicios.filter((s) => s.estado === 'activo').length + campanas.filter((c) => c.estado === 'activo').length} sub={`${servicios.length + campanas.length} en total`} />
          <ResumenCard label="Facturas emitidas" value={facturas.length} sub={`${factPagadas.length} pagadas`} />
          <ResumenCard
            label="Total pagado"
            value={[
              totalPagado.usd > 0 ? formatCurrency(totalPagado.usd, 'USD') : null,
              totalPagado.cop > 0 ? formatCurrency(totalPagado.cop, 'COP') : null,
            ].filter(Boolean).join(' · ') || '—'}
            sub="En el período"
            compact
          />
        </div>
      </section>

      {/* Solicitudes */}
      <section>
        <SectionTitle icon={<FileText size={16} />} title="Solicitudes" count={solicitudes.length} />
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          {solicitudes.length === 0 ? (
            <EmptyRow text="Sin solicitudes en este período" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Solicitud</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Prioridad</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Actualizado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {solicitudes.map((s) => {
                    const est = solicitudEstado[s.estado]
                    const pri = solicitudPrioridad[s.prioridad]
                    return (
                      <tr key={s.id} className="bg-card hover:bg-muted/30 transition-colors">
                        <td className="max-w-[220px] truncate px-4 py-3 font-medium text-foreground">{s.titulo}</td>
                        <td className="px-4 py-3 text-muted-foreground">{solicitudTipo[s.tipo]}</td>
                        <td className={cn('px-4 py-3 text-xs', pri.cls)}>{pri.label}</td>
                        <td className="px-4 py-3">
                          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', est.cls)}>{est.label}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(s.created_at)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(s.updated_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Servicios */}
      <section>
        <SectionTitle icon={<Package size={16} />} title="Servicios contratados" count={servicios.length} />
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          {servicios.length === 0 ? (
            <EmptyRow text="Sin servicios registrados" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Servicio</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Inicio</th>
                    <th className="px-4 py-3 font-medium">Fin</th>
                    <th className="px-4 py-3 font-medium">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {servicios.map((s) => {
                    const est = servicioEstado[s.estado]
                    return (
                      <tr key={s.id} className="bg-card hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{s.services?.nombre ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', est.cls)}>{est.label}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(s.fecha_inicio)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(s.fecha_fin)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {s.duracion_dias ? `${s.duracion_dias} días` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Planes / Campañas */}
      <section>
        <SectionTitle icon={<Layers size={16} />} title="Planes y campañas" count={campanas.length} />
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          {campanas.length === 0 ? (
            <EmptyRow text="Sin planes ni campañas contratadas" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Inicio</th>
                    <th className="px-4 py-3 font-medium">Fin</th>
                    <th className="px-4 py-3 font-medium">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {campanas.map((c) => {
                    const est = servicioEstado[c.estado]
                    return (
                      <tr key={c.id} className="bg-card hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{c.plans?.nombre ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', est.cls)}>{est.label}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(c.fecha_inicio)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(c.fecha_fin)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {c.duracion_dias ? `${c.duracion_dias} días` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Facturas */}
      <section>
        <SectionTitle icon={<Receipt size={16} />} title="Historial de facturación" count={facturas.length} />
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          {facturas.length === 0 ? (
            <EmptyRow text="Sin facturas en este período" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">N°</th>
                    <th className="px-4 py-3 font-medium">Concepto</th>
                    <th className="px-4 py-3 font-medium">Monto</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Emisión</th>
                    <th className="px-4 py-3 font-medium">Vencimiento</th>
                    <th className="px-4 py-3 font-medium">Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {facturas.map((f) => {
                    const est = facturaEstado[f.estado]
                    const Icon = est.icon
                    return (
                      <tr key={f.id} className="bg-card hover:bg-muted/30 transition-colors">
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{f.numero}</td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-foreground">{f.concepto}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold">{formatCurrency(f.monto, f.moneda)}</td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', est.cls)}>
                            <Icon size={10} />
                            {est.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(f.fecha_emision)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(f.fecha_vencimiento)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(f.fecha_pago)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Footer impresión */}
      <div className="hidden border-t border-border pt-4 print:block">
        <p className="text-xs text-muted-foreground">
          Reporte generado para {clientName} · {generadoEl} · Axendora
        </p>
      </div>
    </div>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function SectionTitle({ icon, title, count }: { icon: React.ReactNode; title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-primary">{icon}</span>
      <h2 className="text-base font-semibold">{title}</h2>
      {count !== undefined && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{count}</span>
      )}
    </div>
  )
}

function ResumenCard({ label, value, sub, compact = false }: { label: string; value: string | number; sub: string; compact?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1 font-bold text-foreground', compact ? 'text-lg' : 'text-2xl')}>{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-10">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
