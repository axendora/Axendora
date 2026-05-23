'use client'

import { useActionState, useState, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { ImageIcon, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SERVICE_ICONS } from '@/lib/service-icons'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ServiceActionState } from '../../actions'

const INPUT =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30'

interface ServicioFormProps {
  action: (prevState: ServiceActionState, formData: FormData) => Promise<ServiceActionState>
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

function SubmitButton({ label, blocked }: { label: string; blocked: boolean }) {
  const { pending } = useFormStatus()
  const disabled = pending || blocked
  return (
    <button type="submit" disabled={disabled} className={cn(buttonVariants(), 'gap-2')}>
      {pending ? 'Guardando...' : label}
    </button>
  )
}

export function ServicioForm({ action, defaultValues = {}, submitLabel = 'Crear servicio' }: ServicioFormProps) {
  const [state, formAction] = useActionState(action, null)
  const [imageUrl, setImageUrl]       = useState<string | null>(defaultValues.imagen_url ?? null)
  const [uploading, setUploading]     = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedIcon, setSelectedIcon] = useState(defaultValues.icono ?? '')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploading(true)

    try {
      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `${crypto.randomUUID()}.${ext}`

      const { error } = await supabase.storage
        .from('service-images')
        .upload(path, file, { contentType: file.type, upsert: true })

      if (error) throw new Error(error.message)

      const { data } = supabase.storage.from('service-images').getPublicUrl(path)
      setImageUrl(data.publicUrl)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir imagen')
      setImageUrl(null)
      if (fileRef.current) fileRef.current.value = ''
    } finally {
      setUploading(false)
    }
  }

  function removeImage() {
    setImageUrl(null)
    setUploadError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <form action={formAction} className="space-y-5">
      {defaultValues.id && <input type="hidden" name="id" value={defaultValues.id} />}
      <input type="hidden" name="imagen_url" value={imageUrl ?? ''} />
      <input type="hidden" name="icono"      value={selectedIcon} />

      {state?.error && (
        <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {state.error}
        </div>
      )}

      {/* ── Imagen ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Imagen del servicio
          <span className="ml-1.5 text-xs text-muted-foreground">(1080×1080 recomendado)</span>
        </label>

        {uploadError && (
          <div className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
            {uploadError}
          </div>
        )}

        {imageUrl ? (
          <div className="relative w-full max-w-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Preview"
              className="aspect-square w-full rounded-xl object-cover border border-border"
            />
            <button
              type="button"
              onClick={removeImage}
              disabled={uploading}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 disabled:opacity-50"
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
        ) : uploading ? (
          <div className="flex aspect-square w-full max-w-xs flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5">
            <Loader2 className="animate-spin text-primary" size={28} />
            <span className="text-xs text-muted-foreground">Subiendo imagen...</span>
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
          type="file"
          accept="image/jpeg,image/png,image/webp"
          ref={fileRef}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </div>

      {/* ── Nombre ─────────────────────────────────────────── */}
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

      {/* ── Descripción ────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label htmlFor="descripcion" className="text-sm font-medium">Descripción</label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          defaultValue={defaultValues.descripcion ?? ''}
          placeholder="Describe en qué consiste el servicio..."
          className={cn(INPUT, 'resize-none')}
        />
      </div>

      {/* ── Duración ───────────────────────────────────────── */}
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

      {/* ── Ícono (minimalista, solo iconos) ───────────────── */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Ícono
          <span className="ml-1.5 text-xs text-muted-foreground">(opcional)</span>
        </label>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedIcon('')}
            title="Sin ícono"
            aria-label="Sin ícono"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg border transition-all',
              selectedIcon === ''
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-muted/10 text-muted-foreground hover:border-primary/30 hover:text-foreground',
            )}
          >
            <X size={16} />
          </button>

          {SERVICE_ICONS.map(({ name, Icon, label }) => (
            <button
              key={name}
              type="button"
              onClick={() => setSelectedIcon(name)}
              title={label}
              aria-label={label}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg border transition-all',
                selectedIcon === name
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/10 text-muted-foreground hover:border-primary/30 hover:text-foreground',
              )}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Estado (solo edición) ──────────────────────────── */}
      {defaultValues.id !== undefined && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Estado</label>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="activo"
                value="true"
                defaultChecked={defaultValues.activo !== false}
                className="text-primary"
              />
              <span className="text-sm">Activo</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
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

      <SubmitButton label={submitLabel} blocked={uploading} />
    </form>
  )
}
