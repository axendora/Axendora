import { BarChart2 } from 'lucide-react'

export default function EstadisticasPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#14A8B6]/10">
        <BarChart2 size={28} className="text-primary" />
      </div>
      <h1 className="text-xl font-bold text-foreground">Estadísticas</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Métricas de rendimiento de tus servicios y campañas. Próximamente disponible.
      </p>
    </div>
  )
}
