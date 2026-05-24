'use client'

import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import { cambiarEstadoFacturaAction } from '../actions'
import type { FacturaEstado } from '@/types/database.types'

const opciones: { value: FacturaEstado; label: string }[] = [
  { value: 'pendiente',  label: 'Pendiente' },
  { value: 'pagada',     label: 'Pagada' },
  { value: 'vencida',    label: 'Vencida' },
  { value: 'cancelada',  label: 'Cancelada' },
]

interface Props {
  id: string
  current: FacturaEstado
}

export function EstadoFacturaSelect({ id, current }: Props) {
  const [isPending, startTransition] = useTransition()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as FacturaEstado
    if (next === current) return
    const fd = new FormData()
    fd.set('id', id)
    fd.set('estado', next)
    startTransition(async () => {
      await cambiarEstadoFacturaAction(fd)
    })
  }

  return (
    <select
      value={current}
      onChange={onChange}
      disabled={isPending}
      className={cn(
        'rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30',
        isPending && 'opacity-60',
      )}
    >
      {opciones.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
