'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import { Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const schema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Introduce un email válido'),
  empresa: z.string().optional(),
  servicio: z.string().min(1, 'Selecciona un servicio'),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
})

type FormData = z.infer<typeof schema>

const serviciosOpciones = [
  'Gestión de Redes Sociales',
  'Campañas en Meta',
  'Diseño Gráfico',
  'Páginas Web Profesionales',
  'Pautas en Redes Sociales',
  'Otro',
]

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'

export function Contacto() {
  const [enviado, setEnviado] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: standardSchemaResolver(schema) })

  async function onSubmit(_data: FormData) {
    await new Promise((r) => setTimeout(r, 600))
    setEnviado(true)
  }

  return (
    <section id="contacto" className="px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            Hablemos
          </span>
          <h2 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
            Contacto
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Cuéntanos sobre tu proyecto y te responderemos en menos de 24 horas.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-start">
          <div className="space-y-8">
            <div>
              <h3 className="mb-3 text-lg font-semibold">¿Por qué elegirnos?</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  'Estrategias personalizadas para cada negocio',
                  'Resultados medibles con métricas reales',
                  'Equipo especializado en el mercado latinoamericano',
                  'Comunicación directa y transparente',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle size={16} className="mt-0.5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">Contacto directo</h3>
              <p className="text-sm text-muted-foreground">axendora@gmail.com</p>
            </div>
          </div>

          {enviado ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/10 p-12 text-center">
              <Send size={36} className="mb-4 text-primary" />
              <p className="text-lg font-semibold">¡Mensaje recibido!</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Te responderemos a la brevedad.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5 rounded-xl border border-border bg-card p-8"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="nombre" className="text-sm font-medium">
                    Nombre completo <span className="text-error">*</span>
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    className={cn(inputClass, errors.nombre && 'border-error focus:ring-error/50')}
                    {...register('nombre')}
                  />
                  {errors.nombre && (
                    <p className="text-xs text-error">{errors.nombre.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-error">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className={cn(inputClass, errors.email && 'border-error focus:ring-error/50')}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-error">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="empresa" className="text-sm font-medium">
                  Empresa{' '}
                  <span className="text-xs text-muted-foreground">(opcional)</span>
                </label>
                <input
                  id="empresa"
                  type="text"
                  placeholder="Nombre de tu empresa"
                  className={inputClass}
                  {...register('empresa')}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="servicio" className="text-sm font-medium">
                  Servicio de interés <span className="text-error">*</span>
                </label>
                <select
                  id="servicio"
                  className={cn(inputClass, errors.servicio && 'border-error focus:ring-error/50')}
                  {...register('servicio')}
                >
                  <option value="">Selecciona un servicio</option>
                  {serviciosOpciones.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.servicio && (
                  <p className="text-xs text-error">{errors.servicio.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="mensaje" className="text-sm font-medium">
                  Mensaje <span className="text-error">*</span>
                </label>
                <textarea
                  id="mensaje"
                  rows={4}
                  placeholder="Cuéntanos sobre tu proyecto..."
                  className={cn(
                    inputClass,
                    'resize-none',
                    errors.mensaje && 'border-error focus:ring-error/50',
                  )}
                  {...register('mensaje')}
                />
                {errors.mensaje && (
                  <p className="text-xs text-error">{errors.mensaje.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="h-10 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                <Send size={15} />
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
