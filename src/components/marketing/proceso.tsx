import { Search, Target, Rocket, BarChart3 } from 'lucide-react'

const pasos = [
  {
    numero: '01',
    icon: Search,
    titulo: 'Análisis',
    descripcion:
      'Estudiamos tu marca, competencia y audiencia para identificar oportunidades.',
  },
  {
    numero: '02',
    icon: Target,
    titulo: 'Estrategia',
    descripcion:
      'Diseñamos un plan personalizado con objetivos claros y KPIs medibles.',
  },
  {
    numero: '03',
    icon: Rocket,
    titulo: 'Ejecución',
    descripcion:
      'Creamos el contenido, lanzamos las campañas y gestionamos cada detalle.',
  },
  {
    numero: '04',
    icon: BarChart3,
    titulo: 'Optimización',
    descripcion:
      'Medimos resultados constantemente y ajustamos para maximizar el retorno.',
  },
]

export function Proceso() {
  return (
    <section id="proceso" className="relative overflow-hidden bg-card px-4 py-24">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />

      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            Nuestro método
          </span>
          <h2 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
            Un proceso probado que funciona
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Desde el primer contacto hasta los resultados: así trabajamos contigo.
          </p>
        </div>

        <div className="relative grid gap-6 lg:grid-cols-4">
          {/* Línea conectora desktop */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />

          {pasos.map((p) => (
            <div
              key={p.numero}
              className="relative flex flex-col items-center text-center"
            >
              {/* Número grande de fondo */}
              <span
                aria-hidden
                className="absolute -top-2 left-1/2 -z-10 -translate-x-1/2 font-serif text-7xl font-bold text-primary/5"
              >
                {p.numero}
              </span>

              {/* Icono */}
              <div className="relative z-10 mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-border bg-background shadow-lg">
                <div className="absolute inset-0 rounded-2xl bg-primary/5" />
                <p.icon size={26} className="relative z-10 text-primary" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {p.numero.slice(1)}
                </span>
              </div>

              <h3 className="text-lg font-semibold">{p.titulo}</h3>
              <p className="mt-2 max-w-[220px] text-sm text-muted-foreground">
                {p.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
