import { cn } from '@/lib/utils'

const plataformas = [
  {
    nombre: 'Meta',
    descripcion: 'Campañas de alto impacto a escala global con el ecosistema completo.',
    imagen: '/brands/meta.png',
    stat: '+4B usuarios alcanzables',
    glowColor: '#0082FB',
    glowClass: 'bg-blue-500',
    borderHover: 'hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(0,130,251,0.25)]',
    delay: '0s',
    size: 'w-20 h-20',
  },
  {
    nombre: 'Facebook',
    descripcion: 'Gestión de página, anuncios segmentados y comunidades activas.',
    imagen: '/brands/facebook.png',
    stat: '+3B usuarios activos',
    glowColor: '#1877F2',
    glowClass: 'bg-[#1877F2]',
    borderHover: 'hover:border-[#1877F2]/50 hover:shadow-[0_0_40px_rgba(24,119,242,0.25)]',
    delay: '0.35s',
    size: 'w-[72px] h-[72px]',
  },
  {
    nombre: 'Instagram',
    descripcion: 'Contenido visual, Reels, Stories y pautas que convierten.',
    imagen: '/brands/instagram.png',
    stat: '+2B usuarios activos',
    glowColor: '#E1306C',
    glowClass: 'bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600',
    borderHover: 'hover:border-pink-500/50 hover:shadow-[0_0_40px_rgba(225,48,108,0.25)]',
    delay: '0.7s',
    size: 'w-[72px] h-[72px]',
  },
  {
    nombre: 'WhatsApp',
    descripcion: 'Marketing conversacional, catálogos y atención directa al cliente.',
    imagen: '/brands/whatsapp.png',
    stat: '+2B chats diarios',
    glowColor: '#25D366',
    glowClass: 'bg-[#25D366]',
    borderHover: 'hover:border-[#25D366]/50 hover:shadow-[0_0_40px_rgba(37,211,102,0.25)]',
    delay: '1.05s',
    size: 'w-[72px] h-[72px]',
  },
]

export function MetaPlataformas() {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24">

      {/* ── Atmospheric background glows ──────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-[140px]" />
        <div className="absolute left-1/4 top-1/3 h-[350px] w-[350px] rounded-full bg-primary/6 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/3 h-[350px] w-[350px] rounded-full bg-pink-600/5 blur-[100px]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="mb-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-400">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brands/meta.png" alt="" className="h-4 w-auto" aria-hidden />
            Partner Meta
          </span>
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Dominamos las plataformas
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-primary to-cyan-400 bg-clip-text text-transparent">
              donde está tu audiencia
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Gestionamos todo el ecosistema Meta para que tus campañas lleguen a las personas correctas, en el momento exacto, con el mensaje que convierte.
          </p>
        </div>

        {/* ── Cards ───────────────────────────────────────────────────── */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plataformas.map((p) => (
            <div
              key={p.nombre}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all duration-500',
                'hover:-translate-y-2 hover:scale-[1.02]',
                p.borderHover,
              )}
            >
              {/* Spinning ring decoration (very subtle, top-right corner) */}
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full border border-white/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ animation: 'axd-spin-slow 6s linear infinite' }}
              />
              <div
                className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full border border-white/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ animation: 'axd-spin-slow 4s linear infinite reverse' }}
              />

              {/* Glow orb behind icon */}
              <div
                className={cn(
                  'absolute left-1/2 top-10 h-24 w-24 -translate-x-1/2 rounded-full blur-2xl',
                  p.glowClass,
                )}
                style={{ animation: `axd-glow-pulse 3s ease-in-out ${p.delay} infinite` }}
              />

              {/* Floating icon */}
              <div className="relative flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imagen}
                  alt={p.nombre}
                  className={cn('relative z-10 object-contain drop-shadow-2xl', p.size)}
                  style={{ animation: `axd-float 4s ease-in-out ${p.delay} infinite` }}
                />
              </div>

              {/* Platform info */}
              <div className="mt-7 text-center">
                <p className="text-base font-bold text-foreground">{p.nombre}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {p.descripcion}
                </p>
              </div>

              {/* Stat badge */}
              <div className="mt-5 flex justify-center">
                <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                  {p.stat}
                </span>
              </div>

              {/* Bottom gradient glow on hover */}
              <div
                className={cn(
                  'pointer-events-none absolute inset-x-0 bottom-0 h-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                  p.glowClass,
                )}
              />
            </div>
          ))}
        </div>

        {/* ── Stats bottom bar ─────────────────────────────────────────── */}
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
          {[
            { label: 'Plataformas gestionadas', value: '4 de Meta' },
            { label: 'Usuarios alcanzables', value: '+7 Billones' },
            { label: 'Objetivo', value: '100% Resultados' },
          ].map((s) => (
            <div key={s.label} className="bg-card px-8 py-6 text-center">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
