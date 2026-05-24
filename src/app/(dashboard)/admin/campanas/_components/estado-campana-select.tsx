'use client'

import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import { cambiarEstadoCampanaAction } from '../actions'
import type { ServiceEstado } from '@/types/database.types'

const opciones: { value: ServiceEstado; label: string }[] = [
  { value: 'activo',     label: 'Activo' },
  { value: 'pausado',    label: 'Pausado' },
  { value: 'finalizado', label: 'Finalizado' },
]

interface Props {
  id: string
  current: ServiceEstado
}

export function EstadoCampanaSelect({ id, current }: Props) {
  const [isPending, startTransition] = useTransition()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as ServiceEstado
    if (next === current) return
    const fd = new FormData()
    fd.set('id', id)
    fd.set('estado', next)
    startTransition(async () => {
      await cambiarEstadoCampanaAction(fd)
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
