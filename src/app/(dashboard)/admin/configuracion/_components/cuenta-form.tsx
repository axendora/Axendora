'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { updateCuentaAction, updatePasswordAction } from '../actions'

const INPUT =
  'w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-[#52525B] focus:outline-none focus:ring-2 focus:ring-[#14A8B6]/40 focus:border-[#14A8B6] transition-colors'

interface Props {
  userId: string
  nombre: string
  email: string
}

export function CuentaForm({ userId, nombre, email }: Props) {
  return (
    <div className="space-y-6">
      <InfoSection nombre={nombre} email={email} />
      <PasswordSection />
    </div>
  )
}

function InfoSection({ nombre, email }: { nombre: string; email: string }) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateCuentaAction(formData)
      if (res.error) setError(res.error)
      else setSuccess(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#27272A] bg-[#121212] p-6 space-y-5">
      <h3 className="text-sm font-semibold text-white">Información personal</h3>

      {error && (
        <p className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2.5 text-sm text-[#EF4444]">
          {error}
        </p>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-2.5 text-sm text-[#10B981]">
          <CheckCircle size={15} />
          Nombre actualizado correctamente.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#A1A1AA]">
            Nombre completo <span className="text-[#EF4444]">*</span>
          </label>
          <input
            name="nombre"
            type="text"
            required
            placeholder="Jeramine Rojas"
            defaultValue={nombre}
            className={INPUT}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#A1A1AA]">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-sm text-[#52525B]"
          />
          <p className="text-xs text-[#52525B]">El email no se puede cambiar aquí.</p>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={isPending} className="h-9 min-w-[140px]">
          {isPending ? 'Guardando...' : 'Guardar nombre'}
        </Button>
      </div>
    </form>
  )
}

function PasswordSection() {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNueva, setShowNueva] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updatePasswordAction(formData)
      if (res.error) setError(res.error)
      else {
        setSuccess(true)
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#27272A] bg-[#121212] p-6 space-y-5">
      <h3 className="text-sm font-semibold text-white">Cambiar contraseña</h3>

      {error && (
        <p className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2.5 text-sm text-[#EF4444]">
          {error}
        </p>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-2.5 text-sm text-[#10B981]">
          <CheckCircle size={15} />
          Contraseña actualizada correctamente.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#A1A1AA]">
            Nueva contraseña <span className="text-[#EF4444]">*</span>
          </label>
          <div className="relative">
            <input
              name="nueva"
              type={showNueva ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className={cn(INPUT, 'pr-10')}
            />
            <button
              type="button"
              onClick={() => setShowNueva((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-[#52525B] hover:text-white transition-colors"
              aria-label={showNueva ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showNueva ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#A1A1AA]">
            Confirmar contraseña <span className="text-[#EF4444]">*</span>
          </label>
          <div className="relative">
            <input
              name="confirmar"
              type={showConfirmar ? 'text' : 'password'}
              required
              placeholder="Repite la contraseña"
              className={cn(INPUT, 'pr-10')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmar((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-[#52525B] hover:text-white transition-colors"
              aria-label={showConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirmar ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={isPending} className="h-9 min-w-[160px]">
          {isPending ? 'Actualizando...' : 'Cambiar contraseña'}
        </Button>
      </div>
    </form>
  )
}
