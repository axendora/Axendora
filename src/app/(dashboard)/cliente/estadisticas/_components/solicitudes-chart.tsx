'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Props {
  abierta: number
  en_proceso: number
  resuelta: number
  cerrada: number
  aprobada: number
  rechazada: number
}

const COLORS: Record<string, string> = {
  Pendiente:   '#1FA8B8',
  'En proceso': '#F59E0B',
  Resuelta:    '#10B981',
  Cerrada:     '#52525B',
  Aprobada:    '#10B981',
  Rechazada:   '#EF4444',
}

export function SolicitudesChart(props: Props) {
  const data = [
    { name: 'Pendiente',   value: props.abierta },
    { name: 'En proceso',  value: props.en_proceso },
    { name: 'Aprobada',    value: props.aprobada },
    { name: 'Resuelta',    value: props.resuelta },
    { name: 'Rechazada',   value: props.rechazada },
    { name: 'Cerrada',     value: props.cerrada },
  ].filter((d) => d.value > 0)

  const total = data.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Sin solicitudes aún
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] ?? '#71717A'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
          formatter={(v) => [`${v}`, '']}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
