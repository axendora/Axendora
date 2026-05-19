'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Props {
  data: { name: string; value: number; color: string }[]
}

export function SolicitudesEstadoChart({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        Sin datos disponibles
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
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#0A0A0A',
            border: '1px solid #27272A',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value) => {
            const n = typeof value === 'number' ? value : 0
            return [`${n} (${Math.round((n / total) * 100)}%)`, '']
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: '12px', color: '#A1A1AA' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
