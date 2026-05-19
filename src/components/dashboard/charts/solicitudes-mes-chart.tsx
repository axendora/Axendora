'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Props {
  data: { mes: string; total: number }[]
}

export function SolicitudesMesChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 11, fill: '#A1A1AA' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#A1A1AA' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0A0A0A',
            border: '1px solid #27272A',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          cursor={{ fill: '#27272A' }}
        />
        <Bar dataKey="total" name="Solicitudes" fill="#1FA8B8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
