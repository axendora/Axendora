import { z } from 'zod'

export const solicitudSchema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  tipo: z.enum(['soporte', 'consulta', 'cambio', 'otro'] as const, {
    message: 'Selecciona un tipo válido',
  }),
  prioridad: z.enum(['baja', 'media', 'alta'] as const, {
    message: 'Selecciona una prioridad',
  }),
  descripcion: z.string().min(20, 'Describe el problema con al menos 20 caracteres'),
})

export type SolicitudFormData = z.infer<typeof solicitudSchema>
