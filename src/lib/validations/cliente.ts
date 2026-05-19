import { z } from 'zod'

export const registrarClienteSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72),
  telefono: z.string().max(30).optional().or(z.literal('')),
  empresa: z.string().max(120).optional().or(z.literal('')),
  sector: z.string().max(80).optional().or(z.literal('')),
  website: z
    .string()
    .max(200)
    .optional()
    .or(z.literal(''))
    .refine(
      (v) => !v || v.startsWith('http://') || v.startsWith('https://') || v.startsWith('www.'),
      'Ingresa una URL válida (ej: https://ejemplo.com)',
    ),
  ciudad: z.string().max(80).optional().or(z.literal('')),
  pais: z.string().max(80).optional().or(z.literal('')),
  notas_internas: z.string().max(1000).optional().or(z.literal('')),
})

export type RegistrarClienteInput = z.infer<typeof registrarClienteSchema>
