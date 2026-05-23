import { Megaphone } from 'lucide-react'

export default function AdminCampanasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Campañas</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">Campañas activas en Meta y redes sociales.</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-[#27272A] bg-[#121212] py-24">
        <Megaphone size={40} className="mb-4 text-[#27272A]" />
        <p className="text-base font-medium text-[#71717A]">Próximamente</p>
        <p className="mt-1 text-sm text-[#71717A]/60">Esta sección estará disponible pronto.</p>
      </div>
    </div>
  )
}
