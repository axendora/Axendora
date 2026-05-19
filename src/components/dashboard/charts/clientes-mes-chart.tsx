'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Props {
  data: { mes: string; clientes: number }[]
}

export function ClientesMesChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorClientes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1FA8B8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1FA8B8" stopOpacity={0} />
          </linearGradient>
        </defs>
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
        />
        <Area
          type="monotone"
          dataKey="clientes"
          name="Clientes nuevos"
          stroke="#1FA8B8"
          strokeWidth={2}
          fill="url(#colorClientes)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
