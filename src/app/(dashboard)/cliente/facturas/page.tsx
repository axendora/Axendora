import { DollarSign } from 'lucide-react'

export default function FacturasPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#14A8B6]/10">
        <DollarSign size={28} className="text-[#14A8B6]" />
      </div>
      <h1 className="text-xl font-bold text-white">Facturas</h1>
      <p className="mt-2 max-w-sm text-sm text-[#71717A]">
        Historial de pagos y facturas de tus servicios contratados. Próximamente disponible.
      </p>
    </div>
  )
}
