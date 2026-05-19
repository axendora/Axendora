'use client'

import { useTransition } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ServicioFormProps {
  action: (formData: FormData) => Promise<void>
  defaultValues?: {
    id?: string
    nombre?: string
    descripcion?: string
    icono?: string
    activo?: boolean
  }
  submitLabel?: string
}

export function ServicioForm({ action, defaultValues = {}, submitLabel = 'Crear servicio' }: ServicioFormProps) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await action(formData)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {defaultValues.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      <div className="space-y-1.5">
        <label htmlFor="nombre" className="text-sm font-medium">
          Nombre del servicio <span className="text-error">*</span>
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          defaultValue={defaultValues.nombre}
          placeholder="Ej. Gestión de Redes Sociales"
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="descripcion" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          defaultValue={defaultValues.descripcion ?? ''}
          placeholder="Describe en qué consiste el servicio..."
          className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="icono" className="text-sm font-medium">
          Icono{' '}
          <span className="text-xs text-muted-foreground">(nombre de icono Lucide)</span>
        </label>
        <input
          id="icono"
          name="icono"
          type="text"
          defaultValue={defaultValues.icono ?? ''}
          placeholder="Ej. share-2, trending-up, paintbrush"
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {defaultValues.id !== undefined && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Estado</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="activo"
                value="true"
                defaultChecked={defaultValues.activo !== false}
                className="text-primary"
              />
              <span className="text-sm">Activo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="activo"
                value="false"
                defaultChecked={defaultValues.activo === false}
                className="text-primary"
              />
              <span className="text-sm">Inactivo</span>
            </label>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={cn(buttonVariants())}
      >
        {isPending ? 'Guardando...' : submitLabel}
      </button>
    </form>
  )
}
