import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 pt-16 text-center"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <div className="h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary">
        <Sparkles size={12} />
        Agencia de Marketing Digital
      </span>

      <h1 className="max-w-4xl font-serif text-5xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
        Haz crecer tu marca con{' '}
        <span className="text-primary">estrategia e impacto</span>
      </h1>

      <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
        Gestionamos tus redes sociales, diseñamos campañas que convierten y
        creamos la presencia digital que tu negocio merece.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="#servicios"
          className={cn(buttonVariants({ size: 'lg' }), 'h-12 px-8 text-base')}
        >
          Ver nuestros servicios
          <ArrowRight size={16} />
        </Link>
        <Link
          href="#contacto"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'h-12 px-8 text-base',
          )}
        >
          Hablar con nosotros
        </Link>
      </div>
    </section>
  )
}
