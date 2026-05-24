'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: number | string
  iconNode: React.ReactNode
  href: string
  index: number
  change?: number
  suffix?: string
}

export function KpiCard({ label, value, iconNode, href, index, change, suffix }: KpiCardProps) {
  const trend =
    change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'flat') : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
    >
      <Link
        href={href}
        className="group block rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-[#14A8B6]/40 hover:shadow-lg hover:shadow-[#14A8B6]/5"
      >
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="rounded-lg bg-[#14A8B6]/10 p-2">
            {iconNode}
          </div>
        </div>

        <p className="mt-4 font-[family-name:var(--font-orbitron)] text-4xl font-bold tracking-tight text-foreground">
          {value}
          {suffix && <span className="text-2xl text-muted-foreground">{suffix}</span>}
        </p>

        {trend && (
          <div
            className={cn(
              'mt-2 flex items-center gap-1 text-xs font-medium',
              trend === 'up'
                ? 'text-[#10B981]'
                : trend === 'down'
                  ? 'text-[#EF4444]'
                  : 'text-muted-foreground',
            )}
          >
            {trend === 'up' && <TrendingUp size={13} />}
            {trend === 'down' && <TrendingDown size={13} />}
            {trend === 'flat' && <Minus size={13} />}
            {Math.abs(change!)}% vs mes anterior
          </div>
        )}
        {!trend && <p className="mt-2 text-xs text-muted-foreground">Actualizado ahora</p>}
      </Link>
    </motion.div>
  )
}
