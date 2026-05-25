'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const OPCIONES = [
  { value: '30d',  label: 'Últimos 30 días' },
  { value: '3m',   label: 'Últimos 3 meses' },
  { value: '6m',   label: 'Últimos 6 meses' },
  { value: '1a',   label: 'Último año'       },
  { value: 'todo', label: 'Todo el historial' },
]

export function PeriodoSelector() {
  const router = useRouter()
  const params = useSearchParams()
  const actual = params.get('periodo') ?? '6m'

  function cambiar(value: string) {
    const p = new URLSearchParams(params.toString())
    p.set('periodo', value)
    router.push(`?${p.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {OPCIONES.map((op) => (
        <button
          key={op.value}
          onClick={() => cambiar(op.value)}
          className={
            actual === op.value
              ? 'rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white'
              : 'rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors'
          }
        >
          {op.label}
        </button>
      ))}
    </div>
  )
}
