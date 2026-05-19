'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
})

type FormData = z.infer<typeof schema>

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'

interface PerfilFormProps {
  userId: string
  initialNombre: string
  email: string
}

export function PerfilForm({ userId, initialNombre, email }: PerfilFormProps) {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { nombre: initialNombre },
  })

  async function onSubmit(data: FormData) {
    setServerError('')
    setSuccess(false)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ nombre: data.nombre })
      .eq('user_id', userId)

    if (error) {
      setServerError('No se pudo actualizar el perfil. Intenta nuevamente.')
      return
    }

    setSuccess(true)
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5 rounded-xl border border-border bg-card p-6"
    >
      <h2 className="text-sm font-semibold">Editar información</h2>

      {serverError && (
        <p className="rounded-lg border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">
          {serverError}
        </p>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircle size={15} />
          Perfil actualizado correctamente.
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="nombre" className="text-sm font-medium">
          Nombre completo
        </label>
        <input
          id="nombre"
          type="text"
          placeholder="Tu nombre"
          className={cn(inputClass, errors.nombre && 'border-error focus:ring-error/50')}
          {...register('nombre')}
        />
        {errors.nombre && <p className="text-xs text-error">{errors.nombre.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full cursor-not-allowed rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">
          El email no se puede cambiar desde aquí.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" size="sm" className="h-9" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}
