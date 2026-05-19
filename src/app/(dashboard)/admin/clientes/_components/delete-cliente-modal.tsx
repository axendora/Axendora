'use client'

import { useState, useTransition, useEffect } from 'react'
import { X, Trash2, Loader2, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { eliminarClienteAction } from '../actions'

interface Props {
  cliente: { user_id: string; nombre: string; email: string } | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteClienteModal({ cliente, open, onClose, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (open) { setMounted(true); setError(null) }
    else {
      const t = setTimeout(() => setMounted(false), 200)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!mounted || !cliente) return null

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await eliminarClienteAction(cliente!.user_id)
      if (result.ok) { onSuccess(); onClose() }
      else setError(result.error)
    })
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-200',
        'bg-black/70',
        open ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={cn(
        'w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl transition-all duration-200',
        open ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4',
      )}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-semibold text-error">Eliminar cliente</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
            <TriangleAlert size={18} className="mt-0.5 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-medium">Esta acción es irreversible</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Se eliminarán la cuenta de acceso, el perfil y todos los datos asociados a este cliente.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
            <p className="text-sm font-semibold">{cliente.nombre}</p>
            <p className="text-xs text-muted-foreground">{cliente.email}</p>
          </div>

          {error && (
            <p className="rounded-xl border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">{error}</p>
          )}

          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={isPending}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg bg-error px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90',
                isPending && 'opacity-60 cursor-not-allowed',
              )}>
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {isPending ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
            <button onClick={onClose}
              className={cn(buttonVariants({ variant: 'outline' }), 'flex-1')}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
