import { Users, TrendingUp, Award, Globe2 } from 'lucide-react'

const stats = [
  { icon: Users,       valor: '+50',    label: 'Clientes activos',     descripcion: 'Marcas que confían en nosotros' },
  { icon: TrendingUp,  valor: '+200',   label: 'Campañas exitosas',    descripcion: 'Ejecutadas en Meta este año' },
  { icon: Globe2,      valor: '+2M',    label: 'Personas alcanzadas',  descripcion: 'A través de nuestras estrategias' },
  { icon: Award,       valor: '4.9/5',  label: 'Satisfacción',         descripcion: 'Promedio de nuestros clientes' },
]

export function Stats() {
  return (
    <section id="stats" className="relative px-4 py-20">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:bg-card/80"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Hover gradient */}
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/0 to-primary/0 transition-all duration-500 group-hover:from-primary/5 group-hover:to-transparent"
              />

              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5 transition-colors group-hover:bg-primary/20">
                <s.icon size={18} className="text-primary" />
              </div>

              <p className="font-serif text-4xl font-semibold leading-none">
                {s.valor}
              </p>

              <p className="mt-2 text-sm font-medium">{s.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
