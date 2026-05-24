'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { CheckCircle2, X, MessageCircleHeart, Tag } from 'lucide-react'
import confetti from 'canvas-confetti'
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon'
import { buildWhatsAppLink } from '@/lib/plans'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RequestSuccessModalProps {
  open: boolean
  onClose: () => void
  planNombre: string
  duracionDias: number | null
  ofertaTitulo?: string
  clientName: string
  whatsapp: string | null
  waMsgOverride?: string
}

function fireConfetti() {
  const colors = ['#1FA8B8', '#4FC3D2', '#10B981', '#F59E0B', '#ffffff']
  const end = Date.now() + 1500

  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()

  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.6 },
    colors,
    disableForReducedMotion: true,
  })
}

export function RequestSuccessModal({
  open,
  onClose,
  planNombre,
  duracionDias,
  ofertaTitulo,
  clientName,
  whatsapp,
  waMsgOverride,
}: RequestSuccessModalProps) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (open && !firedRef.current) {
      firedRef.current = true
      const t = setTimeout(fireConfetti, 100)
      return () => clearTimeout(t)
    }
    if (!open) firedRef.current = false
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const diasTxt = duracionDias ? ` por ${duracionDias} días` : ''
  const ofertaTxt = ofertaTitulo ? ` (con oferta: ${ofertaTitulo})` : ''
  const waMsg = waMsgOverride ||
    `Hola Axendora, soy ${clientName}. Acabo de solicitar el plan "${planNombre}"${diasTxt}${ofertaTxt}. ` +
    `Quisiera coordinar el inicio del servicio. ¡Gracias!`
  const waLink = whatsapp
    ? buildWhatsAppLink(whatsapp, waMsg)
    : `https://wa.me/?text=${encodeURIComponent(waMsg)}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-success-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-primary/30 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 ring-4 ring-success/20">
            <CheckCircle2 size={36} className="text-success" />
          </div>

          <h2 id="request-success-title" className="mt-5 font-serif text-2xl font-semibold">
            ¡Solicitud enviada!
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Tu solicitud para el plan{' '}
            <span className="font-medium text-foreground">{planNombre}</span>
            {duracionDias ? (
              <>
                {' '}(<span className="text-primary">{duracionDias} días</span>)
              </>
            ) : null}{' '}
            ya está en nuestro panel. El equipo de Axendora la revisará en breve.
          </p>

          {/* Oferta aplicada */}
          {ofertaTitulo && (
            <div className="mt-3 flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
              <Tag size={11} />
              Descuento aplicado: {ofertaTitulo}
            </div>
          )}

          <div className="mt-6 w-full rounded-xl border border-[#25D366]/30 bg-[#25D366]/5 p-4 text-left">
            <div className="flex items-start gap-2.5">
              <MessageCircleHeart size={16} className="mt-0.5 shrink-0 text-[#25D366]" />
              <p className="text-xs text-muted-foreground">
                ¿Quieres adelantar el contacto? Escríbenos directamente por WhatsApp con un
                mensaje ya preparado.
              </p>
            </div>
          </div>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'mt-4 w-full gap-2 bg-[#25D366] border-[#25D366] text-black hover:bg-[#25D366]/90',
            )}
          >
            <WhatsAppIcon size={18} />
            Contactar por WhatsApp
          </a>

          <div className="mt-3 flex w-full gap-2">
            <Link
              href="/cliente/solicitudes"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1')}
            >
              Ver mis solicitudes
            </Link>
            <button
              type="button"
              onClick={onClose}
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'flex-1')}
            >
              Seguir explorando
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
