import { Megaphone } from 'lucide-react'

export default function CampanasPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#14A8B6]/10">
        <Megaphone size={28} className="text-[#14A8B6]" />
      </div>
      <h1 className="text-xl font-bold text-white">Campañas</h1>
      <p className="mt-2 max-w-sm text-sm text-[#71717A]">
        Aquí verás el estado y los resultados de tus campañas publicitarias. Próximamente disponible.
      </p>
    </div>
  )
}
