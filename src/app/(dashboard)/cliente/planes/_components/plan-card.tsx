'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Star, Loader2, Send, Tag } from 'lucide-react'
import { Layers } from 'lucide-react'
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon'
import { getServiceIcon } from '@/lib/service-icons'
import { formatUSD, formatCOP, tipoPrecioLabel, buildWhatsAppLink } from '@/lib/plans'
import { solicitarPlanAction, type SolicitarPlanState } from '../actions'
import { RequestSuccessModal } from './request-success-modal'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import type { PlanCategoria, TipoPrecio } from '@/types/database.types'
import type { OfertaActiva } from '../page'

type Plan = {
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
}

// ── Helpers de descuento ──────────────────────────────────────────────────────

function calcUSD(precio: number | null, oferta: OfertaActiva): number | null {
  if (precio == null) return null
  if (oferta.tipo_descuento === 'porcentaje') {
    return Math.round(precio * (1 - oferta.valor_descuento / 100))
  }
  if (oferta.moneda === 'USD') return Math.max(0, Math.round((precio - oferta.valor_descuento) * 100) / 100)
  return precio
}

function calcCOP(precio: number | null, oferta: OfertaActiva): number | null {
  if (precio == null) return null
  if (oferta.tipo_descuento === 'porcentaje') {
    return Math.round(precio * (1 - oferta.valor_descuento / 100))
  }
  if (oferta.moneda === 'COP') return Math.max(0, Math.round(precio - oferta.valor_descuento))
  return precio
}

function badgeLabel(oferta: OfertaActiva): string {
  if (oferta.tipo_descuento === 'porcentaje') return `−${oferta.valor_descuento}%`
  if (oferta.moneda === 'USD') return `−$${oferta.valor_descuento} USD`
  return `−$${oferta.valor_descuento.toLocaleString('es-CO', { maximumFractionDigits: 0 })} COP`
}

// ── Submit button ─────────────────────────────────────────────────────────────

function ContratarButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className={cn(buttonVariants({ size: 'sm' }), 'h-9 flex-1 gap-1.5')}>
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
      {pending ? 'Enviando...' : 'Solicitar'}
    </button>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: Plan
  oferta: OfertaActiva | null
  whatsapp: string | null
  clientName: string
}

export function PlanCard({ plan, oferta, whatsapp, clientName }: PlanCardProps) {
  const [state, formAction] = useActionState<SolicitarPlanState, FormData>(solicitarPlanAction, null)
  const [modalOpen, setModalOpen] = useState(false)

  const PlanIcon = getServiceIcon(plan.icono)
  const usd = formatUSD(plan.precio_usd)
  const cop = formatCOP(plan.precio_cop)

  // Precios con descuento
  const usdRawDesc = oferta ? calcUSD(plan.precio_usd, oferta) : plan.precio_usd
  const copRawDesc = oferta ? calcCOP(plan.precio_cop, oferta) : plan.precio_cop
  const usdDesc    = oferta ? formatUSD(usdRawDesc) : null
  const copDesc    = oferta ? formatCOP(copRawDesc) : null
  const usdCambio  = oferta !== null && usdRawDesc !== plan.precio_usd
  const copCambio  = oferta !== null && copRawDesc !== plan.precio_cop

  const waMsg = `Hola Axendora, me interesa el plan "${plan.nombre}". ¿Me puedes dar más información?`
  const waLink = whatsapp ? buildWhatsAppLink(whatsapp, waMsg) : null

  useEffect(() => {
    if (state && 'success' in state && state.success) {
      setModalOpen(true)
    }
  }, [state])

  const successState = state && 'success' in state ? state : null
  const errorState   = state && 'error'   in state ? state : null

  return (
    <>
      <div className={cn(
        'flex flex-col overflow-hidden rounded-xl border bg-card transition-colors',
        plan.destacado ? 'border-primary/60 shadow-[0_0_0_1px_rgb(31_168_184/0.3)]' : 'border-border',
      )}>
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
          {plan.imagen_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={plan.imagen_url} alt={plan.nombre} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Layers size={48} className="text-muted-foreground/20" />
            </div>
          )}

          {/* Badge: MÁS POPULAR (top-left) */}
          {plan.destacado && (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-warning/95 px-2.5 py-1 text-[10px] font-bold text-black">
              <Star size={11} fill="black" />
              MÁS POPULAR
            </div>
          )}

          {/* Badge: Descuento (top-right) */}
          {oferta && (
            <div className="absolute right-2 top-2 rounded-full bg-success px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
              {badgeLabel(oferta)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start gap-2">
            {PlanIcon && <PlanIcon size={18} className="mt-0.5 shrink-0 text-primary" />}
            <h3 className="font-semibold leading-tight">{plan.nombre}</h3>
          </div>

          {plan.descripcion && (
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{plan.descripcion}</p>
          )}

          {/* Precio */}
          <div className="mt-4 space-y-1 border-t border-border pt-4">
            {usd ? (
              usdCambio ? (
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-success">{usdDesc}</span>
                    <span className="text-xs text-muted-foreground">
                      {plan.tipo_precio === 'mensual' ? 'USD / mes' : 'USD único'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/60 line-through">{usd}</p>
                </div>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-primary">{usd}</span>
                  <span className="text-xs text-muted-foreground">
                    {plan.tipo_precio === 'mensual' ? 'USD / mes' : 'USD único'}
                  </span>
                </div>
              )
            ) : (
              <p className="text-sm font-medium text-muted-foreground">Cotizar</p>
            )}

            {cop && (
              copCambio ? (
                <div>
                  <p className="text-xs font-medium text-muted-foreground/80">
                    {copDesc} {plan.tipo_precio === 'mensual' ? '/ mes' : 'único'}
                  </p>
                  <p className="text-[10px] text-muted-foreground/40 line-through">
                    {cop}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {cop} {plan.tipo_precio === 'mensual' ? '/ mes' : 'único'}
                </p>
              )
            )}

            {/* Código promo */}
            {oferta?.codigo_promo && (
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                  <Tag size={9} />
                  {oferta.codigo_promo}
                </span>
              </div>
            )}
          </div>

          {errorState && (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {errorState.error}
            </p>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2">
            <form action={formAction} className="flex flex-1">
              <input type="hidden" name="plan_id" value={plan.id} />
              {oferta && <input type="hidden" name="oferta_id" value={oferta.id} />}
              <ContratarButton />
            </form>
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                title="Contactar por WhatsApp"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'h-9 w-9 p-0 border-green-600/30 text-green-500 hover:bg-green-500/10 hover:text-green-400',
                )}>
                <WhatsAppIcon size={16} />
              </a>
            )}
          </div>
          <span className="sr-only">{tipoPrecioLabel(plan.tipo_precio)}</span>
        </div>
      </div>

      {successState && (
        <RequestSuccessModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          planNombre={successState.planNombre}
          duracionDias={successState.duracionDias}
          ofertaTitulo={successState.ofertaTitulo}
          clientName={clientName}
          whatsapp={whatsapp}
        />
      )}
    </>
  )
}
