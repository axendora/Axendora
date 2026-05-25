'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const COUNTRY_CODES = [
  { code: '+57', flag: '🇨🇴', label: 'Colombia'  },
  { code: '+58', flag: '🇻🇪', label: 'Venezuela' },
  { code: '+52', flag: '🇲🇽', label: 'México'    },
  { code: '+1',  flag: '🇺🇸', label: 'EE.UU.'    },
  { code: '+54', flag: '🇦🇷', label: 'Argentina' },
  { code: '+56', flag: '🇨🇱', label: 'Chile'     },
  { code: '+34', flag: '🇪🇸', label: 'España'    },
]

function parsePhone(full: string | null | undefined): { code: string; num: string } {
  if (!full) return { code: '+57', num: '' }
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length)
  for (const c of sorted) {
    if (full.startsWith(c.code)) return { code: c.code, num: full.slice(c.code.length) }
  }
  return { code: '+57', num: full }
}

const INPUT =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors'

interface Props {
  userId: string
  initialNombre: string
  initialEmpresa: string
  initialWhatsapp: string | null
  email: string
}

export function PerfilForm({ userId, initialNombre, initialEmpresa, initialWhatsapp, email }: Props) {
  const router = useRouter()
  const waDefault = parsePhone(initialWhatsapp)

  const [nombre,   setNombre]   = useState(initialNombre)
  const [empresa,  setEmpresa]  = useState(initialEmpresa)
  const [waCode,   setWaCode]   = useState(waDefault.code)
  const [waNum,    setWaNum]    = useState(waDefault.num)
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.')
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const whatsapp = waNum.trim()
      ? `${waCode}${waNum.replace(/\s/g, '')}`
      : null

    const { error: dbErr } = await supabase
      .from('profiles')
      .update({
        nombre:  nombre.trim(),
        empresa: empresa.trim() || null,
        whatsapp,
      })
      .eq('user_id', userId)

    setSaving(false)
    if (dbErr) {
      setError('No se pudo guardar. Intenta nuevamente.')
      return
    }
    setSuccess(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold">Información personal</h2>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircle size={15} />
          Perfil actualizado correctamente.
        </div>
      )}

      {/* Nombre */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Nombre completo <span className="text-destructive">*</span></label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => { setNombre(e.target.value); setSuccess(false) }}
          placeholder="Tu nombre completo"
          className={INPUT}
          required
        />
      </div>

      {/* Empresa */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Nombre de empresa
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">(opcional)</span>
        </label>
        <input
          type="text"
          value={empresa}
          onChange={(e) => { setEmpresa(e.target.value); setSuccess(false) }}
          placeholder="Tu empresa o negocio"
          className={INPUT}
        />
      </div>

      {/* WhatsApp */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          WhatsApp
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">(opcional)</span>
        </label>
        <div className="flex overflow-hidden rounded-lg border border-border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40 transition-colors">
          <select
            value={waCode}
            onChange={(e) => { setWaCode(e.target.value); setSuccess(false) }}
            className="shrink-0 cursor-pointer border-r border-border bg-transparent px-2 py-2 text-sm text-foreground focus:outline-none"
            aria-label="Código de país"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code} className="bg-card">
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <input
            type="tel"
            value={waNum}
            onChange={(e) => { setWaNum(e.target.value); setSuccess(false) }}
            placeholder="300 000 0000"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Se usará para que Axendora te contacte directamente.
        </p>
      </div>

      {/* Email (read-only) */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full cursor-not-allowed rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">El email no se puede cambiar desde aquí.</p>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" size="sm" className="h-9 min-w-[130px]" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}
