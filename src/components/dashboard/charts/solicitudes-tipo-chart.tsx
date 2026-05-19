'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface Props {
  data: { tipo: string; total: number }[]
}

const COLORS = ['#1FA8B8', '#4FC3D2', '#167585', '#0E5261']

export function SolicitudesTipoChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#A1A1AA' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="tipo"
          tick={{ fontSize: 11, fill: '#A1A1AA' }}
          axisLine={false}
          tickLine={false}
          width={65}
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
        <Bar dataKey="total" name="Solicitudes" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
