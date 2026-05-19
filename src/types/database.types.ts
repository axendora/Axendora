export type Role = 'client' | 'admin'

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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
