export function DigitalShowcase() {
  return (
    <section className="relative overflow-hidden bg-black px-4 py-28 sm:py-36">

      {/* ── 3D Perspective Grid (floor effect) ───────────────────────── */}
      <div className="pointer-events-none absolute inset-0" style={{ perspective: '800px' }}>
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[55%]"
          style={{
            transform: 'rotateX(65deg)',
            transformOrigin: 'center bottom',
            backgroundImage: `
              linear-gradient(to right, rgba(31,168,184,0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(31,168,184,0.12) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'axd-grid-scroll 4s linear infinite',
            WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
            maskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
          }}
        />
      </div>

      {/* ── Horizon glow line ────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 bottom-[45%] h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 5%, rgba(31,168,184,0.25) 30%, rgba(31,168,184,0.5) 50%, rgba(31,168,184,0.25) 70%, transparent 95%)',
        }}
      />

      {/* ── Ambient glow orbs ────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-[30%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[140px]" />
        <div className="absolute left-[20%] top-[40%] h-[250px] w-[250px] rounded-full bg-blue-600/6 blur-[100px]" />
        <div className="absolute right-[20%] top-[35%] h-[250px] w-[250px] rounded-full bg-purple-500/6 blur-[100px]" />
        <div className="absolute left-1/2 bottom-[20%] h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-primary/4 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">

        {/* ── Floating brand icons (scattered orbit) ────────────────── */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {/* eslint-disable @next/next/no-img-element */}
          <img
            src="/brands/meta.png"
            alt=""
            className="absolute left-[5%] top-[10%] h-11 w-11 object-contain opacity-50 drop-shadow-[0_0_12px_rgba(0,130,251,0.5)]"
            style={{ animation: 'axd-float 6s ease-in-out infinite' }}
          />
          <img
            src="/brands/facebook.png"
            alt=""
            className="absolute right-[8%] top-[5%] h-10 w-10 object-contain opacity-45 drop-shadow-[0_0_12px_rgba(24,119,242,0.5)]"
            style={{ animation: 'axd-float 5s ease-in-out 0.7s infinite' }}
          />
          <img
            src="/brands/instagram.png"
            alt=""
            className="absolute left-[3%] bottom-[40%] h-9 w-9 object-contain opacity-45 drop-shadow-[0_0_12px_rgba(225,48,108,0.5)]"
            style={{ animation: 'axd-float 5.5s ease-in-out 1.3s infinite' }}
          />
          <img
            src="/brands/whatsapp.png"
            alt=""
            className="absolute right-[5%] bottom-[35%] h-10 w-10 object-contain opacity-50 drop-shadow-[0_0_12px_rgba(37,211,102,0.5)]"
            style={{ animation: 'axd-float 6.5s ease-in-out 0.3s infinite' }}
          />

          {/* Extra small floating icons for depth */}
          <img
            src="/brands/instagram.png"
            alt=""
            className="absolute right-[25%] top-[8%] h-6 w-6 object-contain opacity-25 blur-[0.5px]"
            style={{ animation: 'axd-float 7s ease-in-out 2s infinite' }}
          />
          <img
            src="/brands/facebook.png"
            alt=""
            className="absolute left-[22%] bottom-[32%] h-5 w-5 object-contain opacity-20 blur-[0.5px]"
            style={{ animation: 'axd-float 8s ease-in-out 1s infinite' }}
          />
          {/* eslint-enable @next/next/no-img-element */}
        </div>

        {/* ── Central hero image ────────────────────────────────────── */}
        <div className="relative flex flex-col items-center">

          {/* Pulsing ring effects behind image */}
          <div
            className="absolute left-1/2 top-[45%] h-72 w-72 rounded-full border border-primary/20 sm:h-80 sm:w-80"
            style={{ animation: 'axd-pulse-ring 4s ease-in-out infinite' }}
          />
          <div
            className="absolute left-1/2 top-[45%] h-80 w-80 rounded-full border border-primary/10 sm:h-96 sm:w-96"
            style={{ animation: 'axd-pulse-ring 4s ease-in-out 1s infinite' }}
          />

          {/* Spinning orbital ring */}
          <div
            className="absolute left-1/2 top-[45%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.06] sm:h-[400px] sm:w-[400px]"
            style={{ animation: 'axd-spin-slow 25s linear infinite' }}
          >
            <span className="absolute -top-1 left-1/2 h-2 w-2 rounded-full bg-primary/60 shadow-[0_0_8px_rgba(31,168,184,0.6)]" />
            <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 rounded-full bg-blue-400/50" />
          </div>

          {/* Main image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brands/redes.png"
            alt="Ecosistema Meta — Marketing Digital con Instagram, Facebook y WhatsApp"
            className="relative z-10 h-56 w-56 object-contain drop-shadow-[0_0_60px_rgba(31,168,184,0.35)] sm:h-72 sm:w-72 lg:h-80 lg:w-80"
            style={{ animation: 'axd-float 5s ease-in-out infinite' }}
          />

          {/* Reflection */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brands/redes.png"
            alt=""
            aria-hidden
            className="relative -mt-6 h-24 w-56 object-contain opacity-[0.12] blur-[2px] sm:-mt-8 sm:h-28 sm:w-72 lg:h-32 lg:w-80"
            style={{
              transform: 'scaleY(-1)',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
            }}
          />
        </div>

        {/* ── Bottom text ───────────────────────────────────────────── */}
        <div className="relative mt-10 text-center sm:mt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">
            Todo lo que tu marca necesita
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl lg:text-5xl">
            <span className="bg-gradient-to-r from-white via-primary to-cyan-300 bg-clip-text text-transparent">
              Marketing · Diseño · Web
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground">
            Creamos experiencias digitales que conectan marcas con personas.
            Estrategia, creatividad y tecnología — en un solo equipo.
          </p>
        </div>
      </div>
    </section>
  )
}
