'use client'

import { useTransition } from 'react'
import { Ban } from 'lucide-react'
import { eliminarFacturaAction } from '../actions'

export function EliminarFacturaBtn({ id, numero }: { id: string; numero: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`¿Eliminar la factura ${numero}? Esta acción no se puede deshacer.`)) return
    const fd = new FormData()
    fd.set('id', id)
    startTransition(async () => {
      await eliminarFacturaAction(fd)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-50"
      title="Eliminar factura"
    >
      <Ban size={13} />
    </button>
  )
}
