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
  data: { mes: string; total: number }[]
}

export function SolicitudesTrendChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <defs>
          <linearGradient id="gradSolicitudes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14A8B6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#14A8B6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
        <XAxis
          dataKey="mes"
          tick={{ fill: '#71717A', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#71717A', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #27272A',
            borderRadius: '8px',
            color: '#fff',
            fontSize: 13,
          }}
          labelStyle={{ color: '#A1A1AA', marginBottom: 4 }}
          itemStyle={{ color: '#14A8B6' }}
          cursor={{ stroke: '#27272A' }}
        />
        <Area
          type="monotone"
          dataKey="total"
          name="Solicitudes"
          stroke="#14A8B6"
          strokeWidth={2}
          fill="url(#gradSolicitudes)"
          dot={{ fill: '#14A8B6', strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: '#14A8B6', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
