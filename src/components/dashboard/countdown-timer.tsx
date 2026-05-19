'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  fechaFin: string | null
  className?: string
}

function computeDiff(end: number) {
  return end - Date.now()
}

function formatDiff(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hrs  = Math.floor((totalSec % 86400) / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return days > 0
    ? `${days}d ${pad(hrs)}:${pad(mins)}:${pad(secs)}`
    : `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
}

export function CountdownTimer({ fechaFin, className }: Props) {
  const [diff, setDiff] = useState<number | null>(null)

  useEffect(() => {
    if (!fechaFin) return
    const end = new Date(fechaFin).getTime()
    setDiff(computeDiff(end))
    const id = setInterval(() => setDiff(computeDiff(end)), 1000)
    return () => clearInterval(id)
  }, [fechaFin])

  if (!fechaFin || diff === null) return null

  if (diff <= 0) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs font-medium text-error', className)}>
        <Clock size={11} />
        Vencido
      </span>
    )
  }

  const days = Math.floor(diff / 86400000)
  const color = days > 5 ? 'text-success' : days >= 1 ? 'text-warning' : 'text-error'

  return (
    <span className={cn('inline-flex items-center gap-1 font-mono text-xs font-semibold tabular-nums', color, className)}>
      <Clock size={11} />
      {formatDiff(diff)}
    </span>
  )
}
