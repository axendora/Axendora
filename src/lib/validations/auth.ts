import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Introduce un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registroSchema = z
  .object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Introduce un email válido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export const recuperarSchema = z.object({
  email: z.string().email('Introduce un email válido'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegistroFormData = z.infer<typeof registroSchema>
export type RecuperarFormData = z.infer<typeof recuperarSchema>
