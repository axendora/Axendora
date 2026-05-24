'use client'

import { useState, useTransition } from 'react'
import { Play, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { activarCampanaAction } from '../actions'

interface ActivarCampanaButtonProps {
  id: string
  defaultDuracion: number | null
  compact?: boolean
}

export function ActivarCampanaButton({
  id,
  defaultDuracion,
  compact = false,
}: ActivarCampanaButtonProps) {
  const [open, setOpen]       = useState(false)
  const [duracion, setDuracion] = useState(
    defaultDuracion ? String(defaultDuracion) : '',
  )
  const [error, setError]     = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await activarCampanaAction(formData)
      if (res?.error) setError(res.error)
      else setOpen(false)
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          buttonVariants({ size: compact ? 'sm' : 'default' }),
          'gap-1.5 bg-[#10B981] border-[#10B981] hover:bg-[#10B981]/90',
          compact && 'h-7 px-2.5 text-xs',
        )}
      >
        <Play size={compact ? 11 : 14} />
        Iniciar campaña
      </button>
    )
  }

  const finEstimado =
    duracion && !isNaN(parseInt(duracion))
      ? new Date(Date.now() + parseInt(duracion) * 86_400_000).toLocaleDateString('es', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : null

  return (
    <form action={handleSubmit} className="space-y-2.5 rounded-lg border border-[#10B981]/30 bg-[#10B981]/5 p-3">
      <input type="hidden" name="id" value={id} />

      <div className="space-y-1">
        <label className="text-[10px] font-medium uppercase tracking-wide text-[#10B981]">
          Duración (días)
        </label>
        <input
          name="duracion_dias"
          type="number"
          min="1"
          max="3650"
          value={duracion}
          onChange={(e) => setDuracion(e.target.value)}
          placeholder="30"
          autoFocus
          required
          className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/40"
        />
        {finEstimado && (
          <p className="text-[11px] text-muted-foreground">
            Termina el <span className="text-foreground">{finEstimado}</span>
          </p>
        )}
      </div>

      {error && <p className="text-[11px] text-[#EF4444]">{error}</p>}

      <div className="flex gap-1.5">
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            buttonVariants({ size: 'sm' }),
            'h-7 flex-1 gap-1 bg-[#10B981] border-[#10B981] text-xs hover:bg-[#10B981]/90',
          )}
        >
          {isPending ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
          {isPending ? 'Iniciando...' : 'Confirmar e iniciar'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={isPending}
          className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'h-7 px-2 text-xs')}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
