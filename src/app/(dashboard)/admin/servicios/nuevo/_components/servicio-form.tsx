'use client'

import { useActionState, useState, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import {
  ImageIcon, X,
  Share2, TrendingUp, Paintbrush, Globe, BarChart3,
  Megaphone, Camera, Video, Users, Target, Zap,
  Search, Mail, Smartphone, Monitor, Lightbulb, Rocket,
  Heart, Star, Package,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ServiceActionState } from '../../actions'

const INPUT =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30'

const SERVICE_ICONS: { name: string; Icon: LucideIcon; label: string }[] = [
  { name: 'share-2',      Icon: Share2,      label: 'Redes Sociales' },
  { name: 'trending-up',  Icon: TrendingUp,  label: 'Campañas' },
  { name: 'paintbrush',   Icon: Paintbrush,  label: 'Diseño' },
  { name: 'globe',        Icon: Globe,       label: 'Web' },
  { name: 'bar-chart-3',  Icon: BarChart3,   label: 'Analíticas' },
  { name: 'megaphone',    Icon: Megaphone,   label: 'Marketing' },
  { name: 'camera',       Icon: Camera,      label: 'Foto' },
  { name: 'video',        Icon: Video,       label: 'Video' },
  { name: 'users',        Icon: Users,       label: 'Comunidad' },
  { name: 'target',       Icon: Target,      label: 'Objetivo' },
  { name: 'zap',          Icon: Zap,         label: 'Impulso' },
  { name: 'search',       Icon: Search,      label: 'SEO' },
  { name: 'mail',         Icon: Mail,        label: 'Email' },
  { name: 'smartphone',   Icon: Smartphone,  label: 'Mobile' },
  { name: 'monitor',      Icon: Monitor,     label: 'Desktop' },
  { name: 'lightbulb',    Icon: Lightbulb,   label: 'Estrategia' },
  { name: 'rocket',       Icon: Rocket,      label: 'Lanzamiento' },
  { name: 'heart',        Icon: Heart,       label: 'Branding' },
  { name: 'star',         Icon: Star,        label: 'Premium' },
  { name: 'package',      Icon: Package,     label: 'Producto' },
]

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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={cn(buttonVariants(), 'gap-2')}>
      {pending ? 'Guardando...' : label}
    </button>
  )
}

export function ServicioForm({ action, defaultValues = {}, submitLabel = 'Crear servicio' }: ServicioFormProps) {
  const [state, formAction]  = useActionState(action, null)
  const [preview, setPreview]         = useState<string | null>(defaultValues.imagen_url ?? null)
  const [imageRemoved, setImageRemoved] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState(defaultValues.icono ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageRemoved(false)
    setPreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setPreview(null)
    setImageRemoved(true)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <form action={formAction} className="space-y-5" encType="multipart/form-data">
      {defaultValues.id && <input type="hidden" name="id" value={defaultValues.id} />}
      {imageRemoved && <input type="hidden" name="imagen_removed" value="1" />}

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

      {/* ── Ícono ──────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Ícono del servicio
          <span className="ml-1.5 text-xs text-muted-foreground">(opcional)</span>
        </label>

        <input type="hidden" name="icono" value={selectedIcon} />

        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-7 lg:grid-cols-10">
          {/* Sin ícono */}
          <button
            type="button"
            onClick={() => setSelectedIcon('')}
            title="Sin ícono"
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-colors',
              selectedIcon === ''
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/30 hover:bg-primary/5',
            )}
          >
            <X size={16} />
            <span className="text-[10px] leading-tight">Ninguno</span>
          </button>

          {SERVICE_ICONS.map(({ name, Icon, label }) => (
            <button
              key={name}
              type="button"
              onClick={() => setSelectedIcon(name)}
              title={label}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-colors',
                selectedIcon === name
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/30 hover:bg-primary/5',
              )}
            >
              <Icon size={16} />
              <span className="text-[10px] leading-tight">{label}</span>
            </button>
          ))}
        </div>

        {selectedIcon && (
          <p className="text-xs text-muted-foreground">
            Seleccionado:{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-primary">{selectedIcon}</code>
          </p>
        )}
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

      <SubmitButton label={submitLabel} />
    </form>
  )
}
