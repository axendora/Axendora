'use client'

import { useState, useTransition, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { COUNTRY_CODES, COUNTRIES } from '@/lib/countries'
import { editarClienteAction } from '../actions'

const INPUT =
  'w-full rounded-lg border border-border bg-surface-elevated py-2 px-3 text-sm transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20'
const SELECT =
  'rounded-lg border border-border bg-surface-elevated py-2 px-3 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20'

export interface ClienteEditable {
  user_id: string
  nombre: string
  email: string
  telefono: string | null
  whatsapp: string | null
  empresa: string | null
  sector: string | null
  website: string | null
  ciudad: string | null
  pais: string | null
  notas_internas: string | null
}

interface Props {
  cliente: ClienteEditable | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

function splitWhatsapp(wa: string | null): { codigo: string; numero: string } {
  if (!wa) return { codigo: '+57', numero: '' }
  const match = COUNTRY_CODES.find((c) => wa.startsWith(c.code))
  if (match) return { codigo: match.code, numero: wa.slice(match.code.length) }
  return { codigo: '+57', numero: wa.replace(/^\+/, '') }
}

export function EditClienteModal({ cliente, open, onClose, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (open) setMounted(true)
    else {
      const t = setTimeout(() => setMounted(false), 200)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!mounted || !cliente) return null

  const { codigo: waCodigo, numero: waNumero } = splitWhatsapp(cliente.whatsapp)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await editarClienteAction(formData)
      if (result.ok) { onSuccess(); onClose() }
      else setError(result.error)
    })
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-10 backdrop-blur-sm transition-all duration-200',
        'bg-black/70',
        open ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={cn(
        'w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl transition-all duration-200',
        open ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4',
      )}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-semibold">Editar cliente</h2>
            <p className="text-xs text-muted-foreground">{cliente.email}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <input type="hidden" name="user_id" value={cliente.user_id} />

          {error && (
            <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-2.5 text-sm text-error">{error}</div>
          )}

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nombre completo <span className="text-error">*</span></label>
            <input name="nombre" defaultValue={cliente.nombre} required className={INPUT} />
          </div>

          {/* Teléfono + WhatsApp */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Teléfono (llamadas)</label>
              <input name="telefono" defaultValue={cliente.telefono ?? ''} placeholder="+57 300 000 0000" className={INPUT} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">WhatsApp</label>
              <div className="flex gap-1.5">
                <select name="whatsapp_codigo" defaultValue={waCodigo} className={cn(SELECT, 'w-28 shrink-0')}>
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <input name="whatsapp_numero" defaultValue={waNumero} placeholder="300 000 0000" className={INPUT} />
              </div>
            </div>
          </div>

          {/* Empresa + Sector */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Empresa</label>
              <input name="empresa" defaultValue={cliente.empresa ?? ''} className={INPUT} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Sector</label>
              <input name="sector" defaultValue={cliente.sector ?? ''} className={INPUT} />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Sitio web</label>
            <input name="website" defaultValue={cliente.website ?? ''} placeholder="https://ejemplo.com" className={INPUT} />
          </div>

          {/* Ciudad + País */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Ciudad</label>
              <input name="ciudad" defaultValue={cliente.ciudad ?? ''} className={INPUT} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">País</label>
              <select name="pais" defaultValue={cliente.pais ?? 'Colombia'} className={cn(SELECT, 'w-full')}>
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.flag} {c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notas internas */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notas internas</label>
            <textarea name="notas_internas" defaultValue={cliente.notas_internas ?? ''} rows={2}
              className={cn(INPUT, 'resize-none')} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={isPending}
              className={cn(buttonVariants(), 'flex-1 gap-2', isPending && 'opacity-70')}>
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={onClose}
              className={cn(buttonVariants({ variant: 'outline' }), 'flex-1')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
