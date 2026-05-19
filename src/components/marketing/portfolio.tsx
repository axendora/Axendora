import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const placeholders = [
  'Redes Sociales',
  'Diseño Gráfico',
  'Campaña Meta',
  'Página Web',
  'Branding',
  'Pauta Digital',
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
            Portfolio
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Casos de éxito y proyectos realizados para nuestros clientes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {placeholders.map((etiqueta, i) => (
            <div
              key={i}
              className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-border bg-background"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="text-center">
                <span className="block text-xs font-medium uppercase tracking-widest text-primary">
                  {etiqueta}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  Próximamente
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="#contacto"
            className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-6')}
          >
            ¿Quieres trabajar con nosotros?
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
