'use client'

import { useState, useTransition, useEffect } from 'react'
import { X, DollarSign, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { crearIngresoAction, crearGastoAction } from '../actions'
import { CatIcon } from './icon-map'
import type { IngresoCategoria, GastoCategoria } from '@/types/database.types'

const INPUT = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'

interface Props {
  tipo: 'ingreso' | 'gasto'
  categorias: (IngresoCategoria | GastoCategoria)[]
  onClose: () => void
  onSuccess: () => void
}

export function EntradaModal({ tipo, categorias, onClose, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]           = useState<string | null>(null)
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id ?? '')
  const [mostrarNueva, setMostrarNueva] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState('')

  // Default fecha = today
  const hoy = new Date().toISOString().split('T')[0]

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function onCategoriaChange(val: string) {
    if (val === '__nueva__') {
      setMostrarNueva(true)
      setCategoriaId('')
    } else {
      setMostrarNueva(false)
      setCategoriaId(val)
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null)
    if (mostrarNueva && !nuevaCategoria.trim()) {
      setError('Escribe el nombre de la nueva categoría')
      return
    }
    startTransition(async () => {
      const action = tipo === 'ingreso' ? crearIngresoAction : crearGastoAction
      const res = await action(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        onSuccess()
      }
    })
  }

  const esIngreso = tipo === 'ingreso'
  const titulo    = esIngreso ? 'Nuevo ingreso' : 'Nuevo gasto'
  const accent    = esIngreso ? 'text-success' : 'text-destructive'
  const ring      = esIngreso ? 'focus:ring-success/30' : 'focus:ring-destructive/30'
  const btnClass  = esIngreso
    ? 'bg-success border-success hover:bg-success/90'
    : 'bg-destructive border-destructive hover:bg-destructive/90'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className={cn('text-base font-semibold', accent)}>{titulo}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="space-y-4 p-6">
          {mostrarNueva && (
            <input type="hidden" name="nueva_categoria" value={nuevaCategoria} />
          )}
          {!mostrarNueva && (
            <input type="hidden" name="categoria_id" value={categoriaId} />
          )}

          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Título <span className="text-destructive">*</span>
            </label>
            <input
              name="titulo"
              type="text"
              placeholder={esIngreso ? 'ej. Plan Marketing — Cliente ABC' : 'ej. Licencia Adobe Creative'}
              className={cn(INPUT, ring)}
              required
            />
          </div>

          {/* Monto */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Monto (USD) <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                name="monto"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className={cn(INPUT, 'pl-8', ring)}
                required
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Categoría</label>
            <select
              value={mostrarNueva ? '__nueva__' : categoriaId}
              onChange={(e) => onCategoriaChange(e.target.value)}
              className={cn(INPUT, ring)}
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
              <option value="__nueva__">+ Crear nueva categoría</option>
            </select>

            {/* Inline nueva categoría */}
            {mostrarNueva && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  placeholder="Nombre de la nueva categoría"
                  className={cn(INPUT, 'flex-1', ring)}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => { setMostrarNueva(false); setCategoriaId(categorias[0]?.id ?? '') }}
                  className="rounded-lg border border-border px-2.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
              </div>
            )}

            {/* Preview categorías existentes */}
            {!mostrarNueva && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {categorias.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoriaId(c.id)}
                    className={cn(
                      'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors',
                      categoriaId === c.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/30',
                    )}
                  >
                    <CatIcon nombre={c.icono} color={c.color} size={10} />
                    {c.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fecha */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Fecha</label>
            <input
              name="fecha"
              type="date"
              defaultValue={hoy}
              className={cn(INPUT, ring)}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Descripción (opcional)</label>
            <textarea
              name="descripcion"
              rows={2}
              placeholder="Notas adicionales..."
              className={cn(INPUT, 'resize-none', ring)}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className={cn(buttonVariants({ size: 'sm' }), 'flex-1 gap-1.5', btnClass)}
            >
              <Plus size={13} />
              {isPending ? 'Guardando...' : esIngreso ? 'Registrar ingreso' : 'Registrar gasto'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
