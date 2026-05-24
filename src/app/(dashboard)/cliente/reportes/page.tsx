import { FileText } from 'lucide-react'

export default function ReportesPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#14A8B6]/10">
        <FileText size={28} className="text-primary" />
      </div>
      <h1 className="text-xl font-bold text-foreground">Reportes</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Informes detallados sobre el desempeño de tus estrategias. Próximamente disponible.
      </p>
    </div>
  )
}
