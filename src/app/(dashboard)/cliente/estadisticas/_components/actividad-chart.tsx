'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export interface MesData {
  mes: string
  solicitudes: number
}

interface Props {
  data: MesData[]
}

export function ActividadChart({ data }: Props) {
  if (!data.length || data.every((d) => d.solicitudes === 0)) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Sin actividad registrada
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
          labelStyle={{ color: 'hsl(var(--foreground))', fontSize: 12 }}
          itemStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
        />
        <Bar dataKey="solicitudes" name="Solicitudes" fill="#1FA8B8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
