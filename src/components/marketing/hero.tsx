import Link from 'next/link'
import {
  ArrowRight,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Eye,
  Users,
  Play,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center overflow-hidden px-4 pt-20"
    >
      {/* Mesh gradient background */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-mesh" />

      {/* Animated blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-20 top-1/4 h-[500px] w-[500px] animate-blob rounded-full bg-primary/20 blur-[120px]" />
        <div className="animation-delay-2000 absolute right-0 top-1/3 h-[400px] w-[400px] animate-blob rounded-full bg-cyan-500/15 blur-[100px]" />
        <div className="animation-delay-4000 absolute bottom-0 left-1/3 h-[350px] w-[350px] animate-blob rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: text */}
        <div className="text-center lg:text-left">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-primary" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <Sparkles size={12} />
            Agencia de Marketing Digital
          </span>

          <h1 className="font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Haz crecer tu marca con{' '}
            <span className="text-gradient-primary">estrategia</span>{' '}
            <br className="hidden sm:block" />
            <span className="relative inline-block">
              <span className="relative z-10">e impacto</span>
              <svg
                aria-hidden
                viewBox="0 0 200 14"
                className="absolute -bottom-1 left-0 z-0 w-full text-primary/60"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 10 Q 50 2, 100 8 T 198 6"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
            Gestionamos tus redes sociales, diseñamos campañas que convierten y
            creamos la presencia digital que tu negocio merece.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href="#servicios"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'group h-12 px-7 text-base shadow-lg shadow-primary/30',
              )}
            >
              Ver nuestros servicios
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="#contacto"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-12 gap-2 border-border/80 px-7 text-base backdrop-blur-sm',
              )}
            >
              <Play size={14} className="fill-primary text-primary" />
              Hablar con nosotros
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 lg:justify-start">
            <div className="flex items-center -space-x-2">
              {['from-primary to-cyan-400', 'from-purple-500 to-primary', 'from-cyan-400 to-blue-500', 'from-primary to-teal-600'].map((g, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br text-xs font-bold text-white',
                    g,
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">+50 clientes activos</p>
              <p className="text-xs text-muted-foreground">
                ⭐⭐⭐⭐⭐ 4.9/5 promedio
              </p>
            </div>
          </div>
        </div>

        {/* Right: floating mockup cards */}
        <div className="relative h-[500px] lg:h-[600px]">
          {/* Background glow specific to cards */}
          <div
            aria-hidden
            className="absolute inset-x-10 top-10 bottom-10 animate-glow-pulse rounded-3xl bg-primary/20 blur-3xl"
          />

          {/* Card 1: Analytics (back) */}
          <div className="animate-float-delayed absolute right-2 top-4 w-64 rotate-[6deg] rounded-2xl border border-border bg-card/90 p-5 shadow-2xl backdrop-blur-md sm:right-8 sm:w-72">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-success/15 p-1.5">
                  <TrendingUp size={14} className="text-success" />
                </div>
                <span className="text-xs font-medium">Alcance del mes</span>
              </div>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                +247%
              </span>
            </div>
            <p className="font-serif text-3xl font-semibold">128.4K</p>
            <p className="text-xs text-muted-foreground">vs 36.9K mes anterior</p>

            <div className="mt-4 flex h-16 items-end gap-1.5">
              {[40, 55, 35, 70, 60, 85, 75, 95, 88, 100].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-gradient-to-t from-primary/40 to-primary"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Card 2: Social post mockup (middle) */}
          <div className="animate-float absolute left-0 top-32 w-64 -rotate-[4deg] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:left-4 sm:w-[280px]">
            <div className="flex items-center gap-2 border-b border-border p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-cyan-400 text-xs font-bold text-white">
                A
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">axendora.agency</p>
                <p className="text-[10px] text-muted-foreground">Hace 2h</p>
              </div>
              <span className="text-muted-foreground">•••</span>
            </div>
            <div className="relative aspect-square bg-gradient-to-br from-primary/30 via-cyan-500/20 to-purple-500/30">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-2xl bg-background/40 px-4 py-2 backdrop-blur-md">
                  <p className="font-serif text-2xl font-semibold tracking-tight text-white">
                    Tu marca,
                    <br />
                    en grande
                  </p>
                </div>
              </div>
              <div className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-sm">
                <span className="text-[10px] font-medium text-white">Ad</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Heart size={16} className="fill-error text-error" />
              <MessageCircle size={16} className="text-foreground" />
              <Share2 size={16} className="text-foreground" />
              <span className="ml-auto text-xs text-muted-foreground">
                1,284 likes
              </span>
            </div>
          </div>

          {/* Card 3: Campaign success (front) */}
          <div className="animate-float absolute bottom-4 right-4 w-60 rotate-[3deg] rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-card p-5 shadow-2xl backdrop-blur-md sm:right-2 sm:w-72">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-primary/20 p-1.5">
                <Sparkles size={14} className="text-primary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Campaña activa
              </span>
            </div>
            <p className="mb-4 text-sm font-semibold">Black Friday 2026</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/60 bg-background/40 p-2.5">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Eye size={11} />
                  <span className="text-[10px] uppercase tracking-wider">
                    Vistas
                  </span>
                </div>
                <p className="mt-1 text-lg font-semibold">42.8K</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/40 p-2.5">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users size={11} />
                  <span className="text-[10px] uppercase tracking-wider">
                    Leads
                  </span>
                </div>
                <p className="mt-1 text-lg font-semibold">1,203</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Conversión</span>
              <span className="font-semibold text-success">+18.2%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-primary to-cyan-400" />
            </div>
          </div>

          {/* Decorative floating dot */}
          <div
            aria-hidden
            className="absolute right-1/4 top-1/2 h-2 w-2 animate-ping rounded-full bg-primary"
          />
        </div>
      </div>

      {/* Scroll hint */}
      <a
        href="#stats"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground sm:flex"
        aria-label="Desplázate"
      >
        <span className="uppercase tracking-widest">Scroll</span>
        <div className="h-8 w-px animate-pulse bg-gradient-to-b from-muted-foreground to-transparent" />
      </a>
    </section>
  )
}
