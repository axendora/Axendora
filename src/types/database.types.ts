export type Role = 'client' | 'admin'
export type ServiceEstado = 'en_configuracion' | 'activo' | 'pausado' | 'finalizado'
export type SolicitudEstado = 'abierta' | 'en_proceso' | 'resuelta' | 'cerrada' | 'aprobada' | 'rechazada'
export type SolicitudTipo = 'soporte' | 'consulta' | 'cambio' | 'plan' | 'otro'
export type SolicitudPrioridad = 'baja' | 'media' | 'alta'
export type PlanCategoria = 'marketing' | 'diseno' | 'web'
export type TipoPrecio = 'mensual' | 'unico'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          nombre: string
          email: string
          role: Role
          telefono: string | null
          empresa: string | null
          sector: string | null
          website: string | null
          ciudad: string | null
          pais: string | null
          whatsapp: string | null
          notas_internas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nombre: string
          email: string
          role?: Role
          telefono?: string | null
          whatsapp?: string | null
          empresa?: string | null
          sector?: string | null
          website?: string | null
          ciudad?: string | null
          pais?: string | null
          notas_internas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          nombre?: string
          email?: string
          role?: Role
          telefono?: string | null
          whatsapp?: string | null
          empresa?: string | null
          sector?: string | null
          website?: string | null
          ciudad?: string | null
          pais?: string | null
          notas_internas?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          icono: string | null
          imagen_url: string | null
          duracion_dias: number | null
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          icono?: string | null
          imagen_url?: string | null
          duracion_dias?: number | null
          activo?: boolean
          created_at?: string
        }
        Update: {
          nombre?: string
          descripcion?: string | null
          icono?: string | null
          imagen_url?: string | null
          duracion_dias?: number | null
          activo?: boolean
        }
        Relationships: []
      }
      client_services: {
        Row: {
          id: string
          client_id: string
          service_id: string | null
          plan_id: string | null
          estado: ServiceEstado
          fecha_inicio: string | null
          fecha_fin: string | null
          duracion_dias: number | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          service_id?: string | null
          plan_id?: string | null
          estado?: ServiceEstado
          fecha_inicio?: string | null
          fecha_fin?: string | null
          duracion_dias?: number | null
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          service_id?: string | null
          plan_id?: string | null
          estado?: ServiceEstado
          fecha_inicio?: string | null
          fecha_fin?: string | null
          duracion_dias?: number | null
          notas?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      solicitudes: {
        Row: {
          id: string
          client_id: string
          titulo: string
          descripcion: string
          tipo: SolicitudTipo
          estado: SolicitudEstado
          prioridad: SolicitudPrioridad
          plan_id: string | null
          motivo_rechazo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          titulo: string
          descripcion: string
          tipo: SolicitudTipo
          estado?: SolicitudEstado
          prioridad?: SolicitudPrioridad
          plan_id?: string | null
          motivo_rechazo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          titulo?: string
          descripcion?: string
          tipo?: SolicitudTipo
          estado?: SolicitudEstado
          prioridad?: SolicitudPrioridad
          plan_id?: string | null
          motivo_rechazo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          categoria: PlanCategoria
          precio_usd: number | null
          precio_cop: number | null
          tipo_precio: TipoPrecio
          imagen_url: string | null
          icono: string | null
          duracion_dias: number | null
          destacado: boolean
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          categoria: PlanCategoria
          precio_usd?: number | null
          precio_cop?: number | null
          tipo_precio?: TipoPrecio
          imagen_url?: string | null
          icono?: string | null
          duracion_dias?: number | null
          destacado?: boolean
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          nombre?: string
          descripcion?: string | null
          categoria?: PlanCategoria
          precio_usd?: number | null
          precio_cop?: number | null
          tipo_precio?: TipoPrecio
          imagen_url?: string | null
          icono?: string | null
          duracion_dias?: number | null
          destacado?: boolean
          activo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
