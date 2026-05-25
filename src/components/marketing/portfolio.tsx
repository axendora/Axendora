import Link from 'next/link'
import { ArrowRight, Share2, PenTool, Target, Globe, Palette, TrendingUp, type LucideIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const proyectos: {
  categoria: string
  titulo: string
  descripcion: string
  icon: LucideIcon
  imagen: string
  color: string
}[] = [
  {
    categoria: 'Redes Sociales',
    titulo: 'Boutique Aurora',
    descripcion: '+800% engagement en 3 meses',
    icon: Share2,
    imagen:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80&auto=format&fit=crop',
    color: 'from-pink-500/40 to-purple-600/40',
  },
  {
    categoria: 'Diseño Gráfico',
    titulo: 'Estudio Lumière',
    descripcion: 'Rebranding completo',
    icon: PenTool,
    imagen:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80&auto=format&fit=crop',
    color: 'from-cyan-500/40 to-blue-600/40',
  },
  {
    categoria: 'Campaña Meta',
    titulo: 'TechFlow Solutions',
    descripcion: 'ROI +240% en 6 semanas',
    icon: Target,
    imagen:
      'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&q=80&auto=format&fit=crop',
    color: 'from-orange-500/40 to-rose-600/40',
  },
  {
    categoria: 'Página Web',
    titulo: 'Café Brisa',
    descripcion: 'E-commerce + reservas online',
    icon: Globe,
    imagen:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop',
    color: 'from-emerald-500/40 to-teal-600/40',
  },
  {
    categoria: 'Branding',
    titulo: 'Norte Estudio',
    descripcion: 'Identidad visual completa',
    icon: Palette,
    imagen:
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80&auto=format&fit=crop',
    color: 'from-purple-500/40 to-violet-600/40',
  },
  {
    categoria: 'Pauta Digital',
    titulo: 'Fitness Pro',
    descripcion: '+2M alcance en 30 días',
    icon: TrendingUp,
    imagen:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&auto=format&fit=crop',
    color: 'from-primary/40 to-cyan-600/40',
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
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border"
            >
              {/* Real image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.imagen}
                alt={p.titulo}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Permanent dark gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

              {/* Color accent overlay (subtle, themed per card) */}
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', p.color)} />

              {/* Content */}
              <div className="relative flex h-full flex-col justify-between p-6">
                {/* Category badge */}
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                    <p.icon size={10} aria-hidden />
                    {p.categoria}
                  </span>
                </div>

                {/* Title + metric */}
                <div>
                  <h3 className="text-xl font-semibold text-white drop-shadow">{p.titulo}</h3>
                  <p className="mt-1 text-sm font-medium text-white/80">{p.descripcion}</p>
                </div>
              </div>

              {/* Hover shine overlay */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
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
