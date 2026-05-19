import Link from 'next/link'
import { ArrowRight, Layers, Camera, Megaphone, Code2, Sparkles, BarChart2, type LucideIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const proyectos: {
  categoria: string
  titulo: string
  descripcion: string
  icon: LucideIcon
  color: string
}[] = [
  {
    categoria: 'Redes Sociales',
    titulo: 'Boutique Aurora',
    descripcion: '+800% engagement en 3 meses',
    icon: Camera,
    color: 'from-pink-500/20 via-primary/20 to-purple-500/20',
  },
  {
    categoria: 'Diseño Gráfico',
    titulo: 'Estudio Lumière',
    descripcion: 'Rebranding completo',
    icon: Layers,
    color: 'from-primary/25 via-cyan-500/20 to-blue-500/20',
  },
  {
    categoria: 'Campaña Meta',
    titulo: 'TechFlow Solutions',
    descripcion: 'ROI +240% en 6 semanas',
    icon: Megaphone,
    color: 'from-orange-500/20 via-warning/20 to-primary/20',
  },
  {
    categoria: 'Página Web',
    titulo: 'Café Brisa',
    descripcion: 'E-commerce + reservas',
    icon: Code2,
    color: 'from-emerald-500/20 via-success/20 to-primary/20',
  },
  {
    categoria: 'Branding',
    titulo: 'Norte Estudio',
    descripcion: 'Identidad visual completa',
    icon: Sparkles,
    color: 'from-purple-500/25 via-primary/20 to-cyan-500/20',
  },
  {
    categoria: 'Pauta Digital',
    titulo: 'Fitness Pro',
    descripcion: '+2M alcance en 30 días',
    icon: BarChart2,
    color: 'from-primary/25 via-teal-500/20 to-emerald-500/20',
  },
]

export function Portfolio() {
  return (
    <section id="portfolio" className="bg-card px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            Nuestro trabajo
          </span>
          <h2 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
            Casos de éxito
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Marcas reales que crecieron con nuestras estrategias.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proyectos.map((p) => (
            <div
              key={p.titulo}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-background"
            >
              {/* Gradient background */}
              <div className={cn('absolute inset-0 bg-gradient-to-br', p.color)} />

              {/* Pattern overlay */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Big icon background */}
              <p.icon
                aria-hidden
                size={200}
                className="absolute -bottom-10 -right-10 text-white/5 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110"
              />

              {/* Content */}
              <div className="relative flex h-full flex-col justify-between p-6">
                <div>
                  <span className="inline-block rounded-full border border-white/20 bg-black/30 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                    {p.categoria}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white">{p.titulo}</h3>
                  <p className="mt-1 text-sm text-white/70">{p.descripcion}</p>
                </div>
              </div>

              {/* Hover overlay */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="#contacto"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'h-11 gap-2 px-6 shadow-lg shadow-primary/20',
            )}
          >
            Quiero ser el próximo caso de éxito
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
