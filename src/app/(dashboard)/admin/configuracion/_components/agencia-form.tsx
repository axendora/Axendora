'use client'

import { useState, useTransition } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { updateAgenciaAction } from '../actions'
import type { AgencySettings } from '@/types/database.types'

const INPUT =
  'w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-[#52525B] focus:outline-none focus:ring-2 focus:ring-[#14A8B6]/40 focus:border-[#14A8B6] transition-colors'

interface Props {
  settings: AgencySettings | null
}

export function AgenciaForm({ settings }: Props) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateAgenciaAction(formData)
      if (res.error) setError(res.error)
      else setSuccess(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2.5 text-sm text-[#EF4444]">
          {error}
        </p>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-2.5 text-sm text-[#10B981]">
          <CheckCircle size={15} />
          Configuración guardada correctamente.
        </div>
      )}

      {/* Info básica */}
      <div className="rounded-xl border border-[#27272A] bg-[#121212] p-6 space-y-5">
        <h3 className="text-sm font-semibold text-white">Información de la agencia</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre de la agencia" required>
            <input
              name="nombre_agencia"
              type="text"
              required
              placeholder="Axendora"
              defaultValue={settings?.nombre_agencia ?? 'Axendora'}
              className={INPUT}
            />
          </Field>
          <Field label="Slogan">
            <input
              name="slogan"
              type="text"
              placeholder="Tu agencia de marketing digital"
              defaultValue={settings?.slogan ?? ''}
              className={INPUT}
            />
          </Field>
          <Field label="Email de contacto">
            <input
              name="email_contacto"
              type="email"
              placeholder="axendora@gmail.com"
              defaultValue={settings?.email_contacto ?? ''}
              className={INPUT}
            />
          </Field>
          <Field label="Teléfono">
            <input
              name="telefono"
              type="tel"
              placeholder="+57 300 000 0000"
              defaultValue={settings?.telefono ?? ''}
              className={INPUT}
            />
          </Field>
          <Field label="WhatsApp">
            <input
              name="whatsapp"
              type="tel"
              placeholder="+57 300 000 0000"
              defaultValue={settings?.whatsapp ?? ''}
              className={INPUT}
            />
          </Field>
          <Field label="Sitio web">
            <input
              name="website"
              type="url"
              placeholder="https://axendora.com"
              defaultValue={settings?.website ?? ''}
              className={INPUT}
            />
          </Field>
        </div>
      </div>

      {/* Redes sociales */}
      <div className="rounded-xl border border-[#27272A] bg-[#121212] p-6 space-y-5">
        <h3 className="text-sm font-semibold text-white">Redes sociales</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram">
            <div className="flex items-center rounded-lg border border-[#27272A] bg-[#0A0A0A] focus-within:ring-2 focus-within:ring-[#14A8B6]/40 focus-within:border-[#14A8B6] transition-colors overflow-hidden">
              <span className="shrink-0 px-3 text-sm text-[#52525B] border-r border-[#27272A]">@</span>
              <input
                name="instagram"
                type="text"
                placeholder="axendora"
                defaultValue={settings?.instagram ?? ''}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-[#52525B] focus:outline-none"
              />
            </div>
          </Field>
          <Field label="Facebook">
            <div className="flex items-center rounded-lg border border-[#27272A] bg-[#0A0A0A] focus-within:ring-2 focus-within:ring-[#14A8B6]/40 focus-within:border-[#14A8B6] transition-colors overflow-hidden">
              <span className="shrink-0 px-3 text-sm text-[#52525B] border-r border-[#27272A]">fb.com/</span>
              <input
                name="facebook"
                type="text"
                placeholder="axendora"
                defaultValue={settings?.facebook ?? ''}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-[#52525B] focus:outline-none"
              />
            </div>
          </Field>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="h-9 min-w-[140px]">
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[#A1A1AA]">
        {label}
        {required && <span className="ml-0.5 text-[#EF4444]">*</span>}
      </label>
      {children}
    </div>
  )
}
