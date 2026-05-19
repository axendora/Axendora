import { Share2, TrendingUp, Paintbrush, Globe, BarChart3 } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

const servicios: { icon: LucideIcon; titulo: string; descripcion: string }[] = [
  {
    icon: Share2,
    titulo: 'Gestión de Redes Sociales',
    descripcion:
      'Administramos tu presencia en redes con contenido estratégico, constante y alineado con tu marca.',
  },
  {
    icon: TrendingUp,
    titulo: 'Campañas en Meta',
    descripcion:
      'Creamos y activamos campañas publicitarias en Facebook, Instagram y WhatsApp que generan resultados reales.',
  },
  {
    icon: Paintbrush,
    titulo: 'Diseño Gráfico',
    descripcion:
      'Identidad visual profesional: piezas para redes, banners, branding y material de marketing.',
  },
  {
    icon: Globe,
    titulo: 'Páginas Web Profesionales',
    descripcion:
      'Diseñamos y desarrollamos sitios web modernos, rápidos y optimizados para convertir visitantes en clientes.',
  },
  {
    icon: BarChart3,
    titulo: 'Pautas en Redes Sociales',
    descripcion:
      'Inversión publicitaria inteligente en redes sociales para maximizar tu alcance y retorno.',
  },
]

export function Servicios() {
  return (
    <section id="servicios" className="px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            Lo que hacemos
          </span>
          <h2 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
            Nuestros servicios
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Soluciones digitales completas para hacer crecer tu negocio en el mundo online.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((s) => (
            <div
              key={s.titulo}
              className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <s.icon size={22} className="text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{s.titulo}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {s.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
