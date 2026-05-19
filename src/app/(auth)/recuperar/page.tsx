'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { recuperarSchema, type RecuperarFormData } from '@/lib/validations/auth'

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'

export default function RecuperarPage() {
  const [serverError, setServerError] = useState('')
  const [enviado, setEnviado] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarFormData>({ resolver: standardSchemaResolver(recuperarSchema) })

  async function onSubmit(data: RecuperarFormData) {
    setServerError('')
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/actualizar-password`,
    })

    if (error) {
      setServerError('Ocurrió un error. Intenta nuevamente.')
      return
    }

    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="w-full max-w-md rounded-xl border border-primary/30 bg-primary/10 p-10 text-center">
        <CheckCircle size={40} className="mx-auto mb-4 text-primary" />
        <h2 className="font-serif text-2xl font-semibold">Revisa tu email</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Si existe una cuenta con ese email, recibirás un link para restablecer tu contraseña.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-primary hover:underline"
        >
          Volver al login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-semibold">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Te enviaremos un link para restablecer tu contraseña
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5 rounded-xl border border-border bg-card p-8"
      >
        {serverError && (
          <p className="rounded-lg border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">
            {serverError}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email de tu cuenta
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              className={cn(
                inputClass,
                'pl-9',
                errors.email && 'border-error focus:ring-error/50',
              )}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-error">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar link de recuperación'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-primary hover:underline"
        >
          <ArrowLeft size={14} />
          Volver al login
        </Link>
      </p>
    </div>
  )
}
