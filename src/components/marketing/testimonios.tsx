import { Quote, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const testimonios = [
  {
    quote:
      'Axendora transformó nuestras redes sociales. En 3 meses pasamos de 2K a 18K seguidores genuinos y nuestras ventas online se duplicaron.',
    nombre: 'María González',
    rol: 'CEO',
    empresa: 'Boutique Aurora',
    color: 'from-primary to-cyan-400',
  },
  {
    quote:
      'La gestión de nuestras campañas en Meta ha sido excelente. El ROI mejoró un 240% y por fin entendemos qué funciona y qué no.',
    nombre: 'Carlos Mendoza',
    rol: 'Director de Marketing',
    empresa: 'TechFlow Solutions',
    color: 'from-purple-500 to-primary',
  },
  {
    quote:
      'Profesionales, responsables y creativos. Nuestra nueva página web nos hizo ver completamente diferente ante nuestros clientes.',
    nombre: 'Laura Pérez',
    rol: 'Fundadora',
    empresa: 'Estudio Lumière',
    color: 'from-cyan-400 to-blue-500',
  },
]

export function Testimonios() {
  return (
    <section id="testimonios" className="relative px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            Testimonios
          </span>
          <h2 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Marcas reales, resultados reales.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonios.map((t) => (
            <div
              key={t.nombre}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10"
            >
              <Quote
                size={28}
                className="mb-4 text-primary/40 transition-colors group-hover:text-primary/60"
              />

              <p className="flex-1 text-sm leading-relaxed text-foreground/90">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-6 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className="fill-warning text-warning" />
                ))}
              </div>

              <div className="mt-5 flex items-center gap-3 border-t border-border pt-5">
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white',
                    t.color,
                  )}
                >
                  {t.nombre.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{t.nombre}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.rol} · {t.empresa}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
