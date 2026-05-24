'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Percent, DollarSign, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import type { TipoDescuento, MonedaTipo } from '@/types/database.types'
import type { OfertaActionState } from '../actions'

const INPUT =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30'

const TIPOS = [
  { value: 'porcentaje' as TipoDescuento, label: 'Porcentaje (%)', Icon: Percent },
  { value: 'monto_fijo' as TipoDescuento, label: 'Monto fijo',     Icon: DollarSign },
]

interface OfertaFormProps {
  action: (state: OfertaActionState, formData: FormData) => Promise<OfertaActionState>
  defaultValues?: {
    id?: string
    titulo?: string
    descripcion?: string
    tipo_descuento?: TipoDescuento
    valor_descuento?: number
    moneda?: MonedaTipo
    codigo_promo?: string
    plan_id?: string | null
    fecha_inicio?: string
    fecha_fin?: string | null
    activo?: boolean
  }
  planes: { id: string; nombre: string }[]
  submitLabel?: string
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={cn(buttonVariants(), 'gap-2')}>
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Guardando...
        </>
      ) : label}
    </button>
  )
}

export function OfertaForm({ action, defaultValues = {}, planes, submitLabel = 'Crear oferta' }: OfertaFormProps) {
  const [state, formAction] = useActionState(action, null)
  const [tipoDescuento, setTipoDescuento] = useState<TipoDescuento>(defaultValues.tipo_descuento ?? 'porcentaje')
  const [moneda, setMoneda]               = useState<MonedaTipo>(defaultValues.moneda ?? 'USD')
  const [tieneVencimiento, setVencimiento] = useState(!!defaultValues.fecha_fin)

  const isEdit = !!defaultValues.id

  return (
    <form action={formAction} className="space-y-5">
      {isEdit && <input type="hidden" name="id" value={defaultValues.id} />}
      <input type="hidden" name="tipo_descuento" value={tipoDescuento} />
      <input type="hidden" name="moneda" value={moneda} />

      {state?.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Título */}
      <div className="space-y-1.5">
        <label htmlFor="titulo" className="text-sm font-medium">
          Título <span className="text-destructive">*</span>
        </label>
        <input
          id="titulo"
          name="titulo"
          type="text"
          required
          defaultValue={defaultValues.titulo}
          placeholder="Ej. Oferta de Lanzamiento"
          className={INPUT}
        />
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <label htmlFor="descripcion" className="text-sm font-medium">
          Descripción{' '}
          <span className="text-xs text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={2}
          defaultValue={defaultValues.descripcion ?? ''}
          placeholder="Describe brevemente la oferta..."
          className={cn(INPUT, 'resize-none')}
        />
      </div>

      {/* Tipo de descuento */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Tipo de descuento <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TIPOS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTipoDescuento(value)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all',
                tipoDescuento === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/10 text-muted-foreground hover:border-primary/30',
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Valor + moneda */}
      <div className={cn('grid gap-3', tipoDescuento === 'monto_fijo' ? 'sm:grid-cols-2' : '')}>
        <div className="space-y-1.5">
          <label htmlFor="valor_descuento" className="text-sm font-medium">
            {tipoDescuento === 'porcentaje' ? 'Porcentaje (%)' : 'Valor del descuento'}{' '}
            <span className="text-destructive">*</span>
          </label>
          <input
            id="valor_descuento"
            name="valor_descuento"
            type="number"
            min="0"
            max={tipoDescuento === 'porcentaje' ? 100 : undefined}
            step={tipoDescuento === 'porcentaje' ? '1' : '0.01'}
            required
            defaultValue={defaultValues.valor_descuento ?? ''}
            placeholder={tipoDescuento === 'porcentaje' ? 'Ej. 20' : 'Ej. 50'}
            className={INPUT}
          />
        </div>

        {tipoDescuento === 'monto_fijo' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Moneda</label>
            <div className="grid grid-cols-2 gap-2">
              {(['USD', 'COP'] as MonedaTipo[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMoneda(m)}
                  className={cn(
                    'rounded-lg border py-2.5 text-sm font-medium transition-all',
                    moneda === m
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted/10 text-muted-foreground hover:border-primary/30',
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fechas */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="fecha_inicio" className="text-sm font-medium">
            Fecha de inicio <span className="text-destructive">*</span>
          </label>
          <input
            id="fecha_inicio"
            name="fecha_inicio"
            type="date"
            required
            defaultValue={defaultValues.fecha_inicio ?? new Date().toISOString().slice(0, 10)}
            className={INPUT}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-muted/10 px-4 py-3">
          <input
            type="checkbox"
            checked={tieneVencimiento}
            onChange={(e) => setVencimiento(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          <div>
            <p className="text-sm font-medium">Establecer fecha de vencimiento</p>
            <p className="text-xs text-muted-foreground">La oferta se marcará como vencida pasada esa fecha</p>
          </div>
        </label>

        {tieneVencimiento && (
          <div className="space-y-1.5">
            <label htmlFor="fecha_fin" className="text-sm font-medium">Fecha de vencimiento</label>
            <input
              id="fecha_fin"
              name="fecha_fin"
              type="date"
              defaultValue={defaultValues.fecha_fin ?? ''}
              className={INPUT}
            />
          </div>
        )}
      </div>

      {/* Código promo */}
      <div className="space-y-1.5">
        <label htmlFor="codigo_promo" className="text-sm font-medium">
          Código promocional{' '}
          <span className="text-xs text-muted-foreground">(opcional)</span>
        </label>
        <input
          id="codigo_promo"
          name="codigo_promo"
          type="text"
          defaultValue={defaultValues.codigo_promo ?? ''}
          placeholder="Ej. VERANO2026"
          className={INPUT}
          style={{ textTransform: 'uppercase' }}
        />
        <p className="text-xs text-muted-foreground">Se guardará en mayúsculas automáticamente.</p>
      </div>

      {/* Plan asociado */}
      {planes.length > 0 && (
        <div className="space-y-1.5">
          <label htmlFor="plan_id" className="text-sm font-medium">
            Plan asociado{' '}
            <span className="text-xs text-muted-foreground">(opcional)</span>
          </label>
          <select
            id="plan_id"
            name="plan_id"
            defaultValue={defaultValues.plan_id ?? ''}
            className={INPUT}
          >
            <option value="">Aplica a todos los planes</option>
            {planes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Estado — solo en edición */}
      {isEdit && (
        <div className="space-y-2">
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
              <span className="text-sm">Activa</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="activo"
                value="false"
                defaultChecked={defaultValues.activo === false}
                className="text-primary"
              />
              <span className="text-sm">Inactiva</span>
            </label>
          </div>
        </div>
      )}

      <div className="pt-2">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  )
}
