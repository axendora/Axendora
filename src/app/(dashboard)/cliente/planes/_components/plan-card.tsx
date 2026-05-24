'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Star, Loader2, Send } from 'lucide-react'
import { Layers } from 'lucide-react'
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon'
import { getServiceIcon } from '@/lib/service-icons'
import { formatUSD, formatCOP, tipoPrecioLabel, buildWhatsAppLink } from '@/lib/plans'
import { solicitarPlanAction, type SolicitarPlanState } from '../actions'
import { RequestSuccessModal } from './request-success-modal'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import type { PlanCategoria, TipoPrecio } from '@/types/database.types'

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

interface PlanCardProps {
  plan: Plan
  whatsapp: string | null
  clientName: string
}

export function PlanCard({ plan, whatsapp, clientName }: PlanCardProps) {
  const [state, formAction] = useActionState<SolicitarPlanState, FormData>(solicitarPlanAction, null)
  const [modalOpen, setModalOpen] = useState(false)

  const PlanIcon = getServiceIcon(plan.icono)
  const usd = formatUSD(plan.precio_usd)
  const cop = formatCOP(plan.precio_cop)

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
          {plan.destacado && (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-warning/95 px-2.5 py-1 text-[10px] font-bold text-black">
              <Star size={11} fill="black" />
              MÁS POPULAR
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

          {/* Price */}
          <div className="mt-4 space-y-1 border-t border-border pt-4">
            {usd ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-primary">{usd}</span>
                <span className="text-xs text-muted-foreground">
                  {plan.tipo_precio === 'mensual' ? 'USD / mes' : 'USD único'}
                </span>
              </div>
            ) : (
              <p className="text-sm font-medium text-muted-foreground">Cotizar</p>
            )}
            {cop && (
              <p className="text-xs text-muted-foreground">
                {cop} {plan.tipo_precio === 'mensual' ? '/ mes' : 'único'}
              </p>
            )}
          </div>

          {errorState && (
            <p className="mt-3 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
              {errorState.error}
            </p>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2">
            <form action={formAction} className="flex flex-1">
              <input type="hidden" name="plan_id" value={plan.id} />
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
          clientName={clientName}
          whatsapp={whatsapp}
        />
      )}
    </>
  )
}
