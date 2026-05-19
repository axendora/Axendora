'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { solicitudSchema, type SolicitudFormData } from '@/lib/validations/solicitud'

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'

export default function NuevaSolicitudPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SolicitudFormData>({ resolver: standardSchemaResolver(solicitudSchema) })

  async function onSubmit(data: SolicitudFormData) {
    setServerError('')
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('solicitudes').insert({
      client_id: user.id,
      titulo: data.titulo,
      tipo: data.tipo,
      prioridad: data.prioridad,
      descripcion: data.descripcion,
    })

    if (error) {
      setServerError('No se pudo crear la solicitud. Intenta nuevamente.')
      return
    }

    router.push('/cliente/solicitudes')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/cliente/solicitudes"
          className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'h-9 w-9 shrink-0')}
          aria-label="Volver"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-semibold">Nueva solicitud</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Describe tu consulta y te responderemos a la brevedad.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5 rounded-xl border border-border bg-card p-6"
      >
        {serverError && (
          <p className="rounded-lg border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">
            {serverError}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="titulo" className="text-sm font-medium">
            Título <span className="text-error">*</span>
          </label>
          <input
            id="titulo"
            type="text"
            placeholder="Ej: Necesito cambiar el texto de mi anuncio"
            className={cn(inputClass, errors.titulo && 'border-error focus:ring-error/50')}
            {...register('titulo')}
          />
          {errors.titulo && <p className="text-xs text-error">{errors.titulo.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="tipo" className="text-sm font-medium">
              Tipo <span className="text-error">*</span>
            </label>
            <select
              id="tipo"
              className={cn(inputClass, errors.tipo && 'border-error focus:ring-error/50')}
              {...register('tipo')}
            >
              <option value="">Selecciona...</option>
              <option value="soporte">Soporte técnico</option>
              <option value="consulta">Consulta</option>
              <option value="cambio">Solicitud de cambio</option>
              <option value="otro">Otro</option>
            </select>
            {errors.tipo && <p className="text-xs text-error">{errors.tipo.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="prioridad" className="text-sm font-medium">
              Prioridad <span className="text-error">*</span>
            </label>
            <select
              id="prioridad"
              className={cn(inputClass, errors.prioridad && 'border-error focus:ring-error/50')}
              {...register('prioridad')}
            >
              <option value="">Selecciona...</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
            {errors.prioridad && <p className="text-xs text-error">{errors.prioridad.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="descripcion" className="text-sm font-medium">
            Descripción <span className="text-error">*</span>
          </label>
          <textarea
            id="descripcion"
            rows={5}
            placeholder="Describe detalladamente tu solicitud..."
            className={cn(inputClass, 'resize-none', errors.descripcion && 'border-error focus:ring-error/50')}
            {...register('descripcion')}
          />
          {errors.descripcion && (
            <p className="text-xs text-error">{errors.descripcion.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/cliente/solicitudes"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-9')}
          >
            Cancelar
          </Link>
          <Button type="submit" size="sm" className="h-9 gap-2" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
            <Send size={14} />
          </Button>
        </div>
      </form>
    </div>
  )
}
