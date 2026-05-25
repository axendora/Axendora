import Image from 'next/image'
import {
  Share2,
  TrendingUp,
  Paintbrush,
  Globe,
  BarChart3,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'

const servicios: {
  icon: LucideIcon
  titulo: string
  descripcion: string
  tags: string[]
  destacado?: boolean
}[] = [
  {
    icon: Share2,
    titulo: 'Gestión de Redes Sociales',
    descripcion:
      'Administramos tu presencia en redes con contenido estratégico y constante alineado con tu marca.',
    tags: ['Instagram', 'Facebook', 'WhatsApp'],
    destacado: true,
  },
  {
    icon: TrendingUp,
    titulo: 'Campañas en Meta',
    descripcion:
      'Creamos y activamos campañas publicitarias en Facebook, Instagram y WhatsApp que convierten.',
    tags: ['Facebook Ads', 'IG Ads', 'WhatsApp'],
  },
  {
    icon: Paintbrush,
    titulo: 'Diseño Gráfico',
    descripcion:
      'Identidad visual profesional: piezas para redes, banners, branding y material de marketing.',
    tags: ['Branding', 'Diseño UI', 'Banners'],
  },
  {
    icon: Globe,
    titulo: 'Páginas Web Profesionales',
    descripcion:
      'Diseñamos y desarrollamos sitios web modernos, rápidos y optimizados para convertir.',
    tags: ['Next.js', 'Diseño', 'SEO'],
  },
  {
    icon: BarChart3,
    titulo: 'Pautas en Redes Sociales',
    descripcion:
      'Inversión publicitaria inteligente en redes sociales para maximizar tu alcance y retorno.',
    tags: ['Anuncios', 'ROI', 'Métricas'],
  },
]

export function Servicios() {
  return (
    <section id="servicios" className="relative px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 grid items-end gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              Lo que hacemos
            </span>
            <h2 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
              Soluciones digitales <br className="hidden sm:block" />
              <span className="text-gradient-primary">de principio a fin</span>
            </h2>
          </div>
          <p className="text-muted-foreground lg:text-right">
            Cinco servicios diseñados para hacer crecer tu negocio en el mundo
            online — desde la estrategia hasta la última publicación.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Servicio destacado con imagen real */}
          {servicios
            .filter((s) => s.destacado)
            .map((s) => (
              <div
                key={s.titulo}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card lg:row-span-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-[280px]">
                  <Image
                    src="/brands/redes.png"
                    alt="Gestión de redes sociales — Meta, Instagram, Facebook, WhatsApp"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  <div className="absolute right-4 top-4 rounded-full bg-primary/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground backdrop-blur-sm">
                    Más solicitado
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                    <s.icon size={22} className="text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{s.titulo}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {s.descripcion}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

          {/* Resto de servicios */}
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
            {servicios
              .filter((s) => !s.destacado)
              .map((s) => (
                <div
                  key={s.titulo}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40"
                >
                  <ArrowUpRight
                    size={18}
                    className="absolute right-5 top-5 text-muted-foreground/50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  />

                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5 transition-colors group-hover:bg-primary/20">
                    <s.icon size={20} className="text-primary" />
                  </div>

                  <h3 className="mb-2 text-base font-semibold">{s.titulo}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {s.descripcion}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  )
}
