'use client'

import { useTransition, useState, useRef } from 'react'
import { ImageIcon, X } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const INPUT =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30'

interface ServicioFormProps {
  action: (formData: FormData) => Promise<void>
  defaultValues?: {
    id?: string
    nombre?: string
    descripcion?: string
    icono?: string
    activo?: boolean
    imagen_url?: string | null
    duracion_dias?: number | null
  }
  submitLabel?: string
}

export function ServicioForm({ action, defaultValues = {}, submitLabel = 'Crear servicio' }: ServicioFormProps) {
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string | null>(defaultValues.imagen_url ?? null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  function removeImage() {
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleSubmit(formData: FormData) {
    if (!preview) formData.delete('imagen')
    startTransition(async () => {
      await action(formData)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-5" encType="multipart/form-data">
      {defaultValues.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      {/* Imagen */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Imagen del servicio
          <span className="ml-1.5 text-xs text-muted-foreground">(1080×1080 recomendado)</span>
        </label>

        {preview ? (
          <div className="relative w-full max-w-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="aspect-square w-full rounded-xl object-cover border border-border"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            >
              <X size={14} />
            </button>
            <label
              htmlFor="imagen"
              className="absolute bottom-2 right-2 cursor-pointer rounded-lg bg-black/60 px-2.5 py-1 text-xs text-white hover:bg-black/80 transition-colors"
            >
              Cambiar
            </label>
          </div>
        ) : (
          <label
            htmlFor="imagen"
            className="flex aspect-square w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <ImageIcon size={32} className="opacity-40" />
            <span className="text-xs">Haz clic para subir imagen</span>
          </label>
        )}

        <input
          id="imagen"
          name="imagen"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          ref={fileRef}
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* Nombre */}
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
          className={INPUT}
        />
      </div>

      {/* Descripción */}
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
          className={cn(INPUT, 'resize-none')}
        />
      </div>

      {/* Duración + Ícono */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="duracion_dias" className="text-sm font-medium">
            Duración por defecto
            <span className="ml-1.5 text-xs text-muted-foreground">(días, opcional)</span>
          </label>
          <input
            id="duracion_dias"
            name="duracion_dias"
            type="number"
            min="1"
            max="365"
            defaultValue={defaultValues.duracion_dias ?? ''}
            placeholder="Ej. 30"
            className={INPUT}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="icono" className="text-sm font-medium">
            Ícono Lucide
            <span className="ml-1.5 text-xs text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="icono"
            name="icono"
            type="text"
            defaultValue={defaultValues.icono ?? ''}
            placeholder="share-2, paintbrush..."
            className={INPUT}
          />
        </div>
      </div>

      {/* Estado (solo en edición) */}
      {defaultValues.id !== undefined && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Estado</label>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="radio" name="activo" value="true"
                defaultChecked={defaultValues.activo !== false} className="text-primary" />
              <span className="text-sm">Activo</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="radio" name="activo" value="false"
                defaultChecked={defaultValues.activo === false} className="text-primary" />
              <span className="text-sm">Inactivo</span>
            </label>
          </div>
        </div>
      )}

      <button type="submit" disabled={isPending} className={cn(buttonVariants(), 'gap-2')}>
        {isPending ? 'Guardando...' : submitLabel}
      </button>
    </form>
  )
}
