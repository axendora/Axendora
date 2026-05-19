'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { registroSchema, type RegistroFormData } from '@/lib/validations/auth'

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [registrado, setRegistrado] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormData>({ resolver: standardSchemaResolver(registroSchema) })

  async function onSubmit(data: RegistroFormData) {
    setServerError('')
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { nombre: data.nombre },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/login`,
      },
    })

    if (error) {
      setServerError(
        error.message === 'User already registered'
          ? 'Ya existe una cuenta con ese email.'
          : 'Ocurrió un error. Intenta nuevamente.',
      )
      return
    }

    setRegistrado(true)
  }

  if (registrado) {
    return (
      <div className="w-full max-w-md rounded-xl border border-primary/30 bg-primary/10 p-10 text-center">
        <CheckCircle size={40} className="mx-auto mb-4 text-primary" />
        <h2 className="font-serif text-2xl font-semibold">¡Revisa tu email!</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Te enviamos un link de confirmación. Haz clic en él para activar tu cuenta.
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
        <h1 className="font-serif text-3xl font-semibold">Crear cuenta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Únete a Axendora y gestiona tus servicios
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
          <label htmlFor="nombre" className="text-sm font-medium">
            Nombre completo
          </label>
          <input
            id="nombre"
            type="text"
            placeholder="Tu nombre"
            autoComplete="name"
            className={cn(inputClass, errors.nombre && 'border-error focus:ring-error/50')}
            {...register('nombre')}
          />
          {errors.nombre && (
            <p className="text-xs text-error">{errors.nombre.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            className={cn(inputClass, errors.email && 'border-error focus:ring-error/50')}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-error">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              className={cn(
                inputClass,
                'pr-10',
                errors.password && 'border-error focus:ring-error/50',
              )}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-error">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            className={cn(
              inputClass,
              errors.confirmPassword && 'border-error focus:ring-error/50',
            )}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          <UserPlus size={15} />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
