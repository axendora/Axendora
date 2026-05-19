export type Role = 'client' | 'admin'
export type ServiceEstado = 'en_configuracion' | 'activo' | 'pausado' | 'finalizado'
export type SolicitudEstado = 'abierta' | 'en_proceso' | 'resuelta' | 'cerrada'
export type SolicitudTipo = 'soporte' | 'consulta' | 'cambio' | 'otro'
export type SolicitudPrioridad = 'baja' | 'media' | 'alta'

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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nombre: string
          email: string
          role?: Role
          created_at?: string
          updated_at?: string
        }
        Update: {
          nombre?: string
          email?: string
          role?: Role
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
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          icono?: string | null
          activo?: boolean
          created_at?: string
        }
        Update: {
          nombre?: string
          descripcion?: string | null
          icono?: string | null
          activo?: boolean
        }
        Relationships: []
      }
      client_services: {
        Row: {
          id: string
          client_id: string
          service_id: string
          estado: ServiceEstado
          fecha_inicio: string | null
          fecha_fin: string | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          service_id: string
          estado?: ServiceEstado
          fecha_inicio?: string | null
          fecha_fin?: string | null
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          estado?: ServiceEstado
          fecha_inicio?: string | null
          fecha_fin?: string | null
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
          created_at?: string
          updated_at?: string
        }
        Update: {
          titulo?: string
          descripcion?: string
          tipo?: SolicitudTipo
          estado?: SolicitudEstado
          prioridad?: SolicitudPrioridad
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
