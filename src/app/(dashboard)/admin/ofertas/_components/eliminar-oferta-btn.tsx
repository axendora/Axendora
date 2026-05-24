'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { eliminarOfertaAction } from '../actions'

export function EliminarOfertaBtn({ id, titulo }: { id: string; titulo: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`¿Eliminar la oferta "${titulo}"? Esta acción no se puede deshacer.`)) return
    const fd = new FormData()
    fd.set('id', id)
    startTransition(async () => {
      await eliminarOfertaAction(fd)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-50"
      title="Eliminar oferta"
    >
      <Trash2 size={13} />
    </button>
  )
}
