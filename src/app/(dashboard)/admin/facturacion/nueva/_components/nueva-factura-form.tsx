'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { crearFacturaAction } from '../../actions'
import type { MonedaTipo } from '@/types/database.types'

type Client = {
  user_id: string
  nombre: string
  email: string
  empresa: string | null
}

type Campaign = {
  id: string
  client_id: string
  plan_nombre: string | null
  estado: string
}

const INPUT =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'

const MONEDAS: { value: MonedaTipo; label: string; symbol: string }[] = [
  { value: 'USD', label: 'USD — Dólar', symbol: '$' },
  { value: 'COP', label: 'COP — Peso colombiano', symbol: '$' },
]

interface Props {
  clients: Client[]
  campaigns: Campaign[]
}

export function NuevaFacturaForm({ clients, campaigns }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [clientId, setClientId]         = useState(clients[0]?.user_id ?? '')
  const [campaignId, setCampaignId]     = useState('')
  const [concepto, setConcepto]         = useState('')
  const [moneda, setMoneda]             = useState<MonedaTipo>('USD')
  const [monto, setMonto]               = useState('')
  const [vencimiento, setVencimiento]   = useState('')

  const clientCampaigns = campaigns.filter((c) => c.client_id === clientId)

  function onClientChange(id: string) {
    setClientId(id)
    setCampaignId('')
    setConcepto('')
  }

  function onCampaignChange(id: string) {
    setCampaignId(id)
    if (id) {
      const cam = campaigns.find((c) => c.id === id)
      if (cam?.plan_nombre) setConcepto(cam.plan_nombre)
    } else {
      setConcepto('')
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await crearFacturaAction(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        router.push('/admin/facturacion')
      }
    })
  }

  const preview = monto && !isNaN(parseFloat(monto))
    ? `${moneda === 'USD' ? '$ ' : '$ '}${parseFloat(monto).toLocaleString('es-CO')} ${moneda}`
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/facturacion" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5')}>
          <ArrowLeft size={14} />
          Volver
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Nueva factura</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Genera una factura para un cliente</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <form action={handleSubmit} className="space-y-5 rounded-xl border border-border bg-card p-6">

          {/* Cliente */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Cliente <span className="text-destructive">*</span>
            </label>
            {clients.length === 0 ? (
              <p className="text-xs text-muted-foreground">No hay clientes registrados.</p>
            ) : (
              <select
                name="client_id"
                value={clientId}
                onChange={(e) => onClientChange(e.target.value)}
                className={INPUT}
              >
                {clients.map((c) => (
                  <option key={c.user_id} value={c.user_id}>
                    {c.nombre}{c.empresa ? ` · ${c.empresa}` : ''} ({c.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Campaña vinculada */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Campaña vinculada <span className="font-normal">(opcional)</span>
            </label>
            <select
              name="client_service_id"
              value={campaignId}
              onChange={(e) => onCampaignChange(e.target.value)}
              className={INPUT}
            >
              <option value="">Sin vincular</option>
              {clientCampaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.plan_nombre ?? 'Campaña'} · {c.estado}
                </option>
              ))}
            </select>
            {clientId && clientCampaigns.length === 0 && (
              <p className="text-xs text-muted-foreground">Este cliente no tiene campañas activas.</p>
            )}
          </div>

          {/* Concepto */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Concepto <span className="text-destructive">*</span>
            </label>
            <input
              name="concepto"
              type="text"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="ej. Plan Marketing Digital — Mayo 2025"
              className={INPUT}
              required
            />
          </div>

          {/* Monto + Moneda */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Monto <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="monto"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  className={cn(INPUT, 'pl-8')}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Moneda</label>
              <select
                name="moneda"
                value={moneda}
                onChange={(e) => setMoneda(e.target.value as MonedaTipo)}
                className={INPUT}
              >
                {MONEDAS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
          {preview && (
            <p className="text-xs text-muted-foreground">
              Total a cobrar: <span className="font-semibold text-foreground">{preview}</span>
            </p>
          )}

          {/* Fecha de vencimiento */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Fecha de vencimiento <span className="font-normal">(opcional)</span>
            </label>
            <input
              name="fecha_vencimiento"
              type="date"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
              className={INPUT}
            />
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notas internas</label>
            <textarea
              name="notas"
              rows={3}
              placeholder="Observaciones, detalles del acuerdo, método de pago..."
              className={cn(INPUT, 'resize-none')}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending || clients.length === 0}
              className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}
            >
              {isPending ? 'Guardando...' : 'Crear factura'}
            </button>
            <Link href="/admin/facturacion" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
