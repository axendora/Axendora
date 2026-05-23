'use client'

import { useActionState, useState, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { ImageIcon, X, Loader2, Star } from 'lucide-react'
import { SERVICE_ICONS } from '@/lib/service-icons'
import { PLAN_CATEGORIAS } from '@/lib/plans'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PlanCategoria, TipoPrecio } from '@/types/database.types'
import type { PlanActionState } from '../../actions'

const INPUT =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30'

interface PlanFormProps {
  action: (prevState: PlanActionState, formData: FormData) => Promise<PlanActionState>
  defaultValues?: {
    id?: string
    nombre?: string
    descripcion?: string
    categoria?: PlanCategoria
    precio_usd?: number | null
    precio_cop?: number | null
    tipo_precio?: TipoPrecio
    imagen_url?: string | null
    icono?: string
    destacado?: boolean
    activo?: boolean
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

export function PlanForm({ action, defaultValues = {}, submitLabel = 'Crear plan' }: PlanFormProps) {
  const [state, formAction] = useActionState(action, null)
  const [imageUrl, setImageUrl]       = useState<string | null>(defaultValues.imagen_url ?? null)
  const [uploading, setUploading]     = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedIcon, setSelectedIcon] = useState(defaultValues.icono ?? '')
  const [categoria, setCategoria]   = useState<PlanCategoria>(defaultValues.categoria ?? 'marketing')
  const [tipoPrecio, setTipoPrecio] = useState<TipoPrecio>(defaultValues.tipo_precio ?? 'mensual')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploading(true)

    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/admin/plan-images', { method: 'POST', body })
      const json = await res.json().catch(() => ({}))

      if (!res.ok) throw new Error(json?.error || `Error ${res.status} al subir imagen`)
      setImageUrl(json.url as string)
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
      <input type="hidden" name="imagen_url"  value={imageUrl ?? ''} />
      <input type="hidden" name="icono"       value={selectedIcon} />
      <input type="hidden" name="categoria"   value={categoria} />
      <input type="hidden" name="tipo_precio" value={tipoPrecio} />

      {state?.error && (
        <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {state.error}
        </div>
      )}

      {/* ── Imagen ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Imagen del plan
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
            <img src={imageUrl} alt="Preview" className="aspect-square w-full rounded-xl object-cover border border-border" />
            <button
              type="button" onClick={removeImage} disabled={uploading}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-50"
            >
              <X size={14} />
            </button>
            <label htmlFor="imagen" className="absolute bottom-2 right-2 cursor-pointer rounded-lg bg-black/60 px-2.5 py-1 text-xs text-white hover:bg-black/80">
              Cambiar
            </label>
          </div>
        ) : uploading ? (
          <div className="flex aspect-square w-full max-w-xs flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5">
            <Loader2 className="animate-spin text-primary" size={28} />
            <span className="text-xs text-muted-foreground">Subiendo imagen...</span>
          </div>
        ) : (
          <label htmlFor="imagen" className="flex aspect-square w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors">
            <ImageIcon size={32} className="opacity-40" />
            <span className="text-xs">Haz clic para subir imagen</span>
          </label>
        )}

        <input id="imagen" type="file" accept="image/jpeg,image/png,image/webp"
          ref={fileRef} onChange={handleFileChange} disabled={uploading} className="hidden" />
      </div>

      {/* ── Nombre ─────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label htmlFor="nombre" className="text-sm font-medium">
          Nombre del plan <span className="text-error">*</span>
        </label>
        <input id="nombre" name="nombre" type="text" required
          defaultValue={defaultValues.nombre}
          placeholder="Ej. Plan Esencial Marketing"
          className={INPUT} />
      </div>

      {/* ── Descripción ────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label htmlFor="descripcion" className="text-sm font-medium">Descripción</label>
        <textarea id="descripcion" name="descripcion" rows={3}
          defaultValue={defaultValues.descripcion ?? ''}
          placeholder="Describe brevemente lo que incluye el plan..."
          className={cn(INPUT, 'resize-none')} />
      </div>

      {/* ── Categoría ──────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Categoría <span className="text-error">*</span></label>
        <div className="grid grid-cols-3 gap-2">
          {PLAN_CATEGORIAS.map(({ value, label, Icon }) => (
            <button
              key={value} type="button" onClick={() => setCategoria(value)}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 rounded-lg border py-3 transition-all',
                categoria === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/10 text-muted-foreground hover:border-primary/30',
              )}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Precios ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="precio_usd" className="text-sm font-medium">
            Precio USD <span className="ml-1.5 text-xs text-muted-foreground">($)</span>
          </label>
          <input id="precio_usd" name="precio_usd" type="number" min="0" step="0.01"
            defaultValue={defaultValues.precio_usd ?? ''}
            placeholder="Ej. 299"
            className={INPUT} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="precio_cop" className="text-sm font-medium">
            Precio COP <span className="ml-1.5 text-xs text-muted-foreground">($)</span>
          </label>
          <input id="precio_cop" name="precio_cop" type="number" min="0" step="1"
            defaultValue={defaultValues.precio_cop ?? ''}
            placeholder="Ej. 1200000"
            className={INPUT} />
        </div>
      </div>

      {/* ── Tipo de precio ─────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo de cobro</label>
        <div className="grid grid-cols-2 gap-2">
          {(['mensual', 'unico'] as const).map((t) => (
            <button
              key={t} type="button" onClick={() => setTipoPrecio(t)}
              className={cn(
                'rounded-lg border py-2.5 text-sm font-medium transition-all',
                tipoPrecio === t
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/10 text-muted-foreground hover:border-primary/30',
              )}
            >
              {t === 'mensual' ? 'Mensual recurrente' : 'Pago único'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Destacado ──────────────────────────────────────── */}
      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-muted/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Star size={16} className="text-warning" />
          <div>
            <p className="text-sm font-medium">Marcar como destacado</p>
            <p className="text-xs text-muted-foreground">Aparece como &quot;Más popular&quot; en el catálogo</p>
          </div>
        </div>
        <input type="checkbox" name="destacado" defaultChecked={defaultValues.destacado ?? false}
          className="h-4 w-4 accent-primary" />
      </label>

      {/* ── Ícono ──────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Ícono <span className="ml-1.5 text-xs text-muted-foreground">(opcional)</span>
        </label>

        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setSelectedIcon('')} title="Sin ícono" aria-label="Sin ícono"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg border transition-all',
              selectedIcon === ''
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-muted/10 text-muted-foreground hover:border-primary/30 hover:text-foreground',
            )}>
            <X size={16} />
          </button>

          {SERVICE_ICONS.map(({ name, Icon, label }) => (
            <button key={name} type="button" onClick={() => setSelectedIcon(name)} title={label} aria-label={label}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg border transition-all',
                selectedIcon === name
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/10 text-muted-foreground hover:border-primary/30 hover:text-foreground',
              )}>
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

      <SubmitButton label={submitLabel} blocked={uploading} />
    </form>
  )
}
