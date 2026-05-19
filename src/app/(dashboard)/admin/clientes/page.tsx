import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, ChevronRight } from 'lucide-react'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

export default async function AdminClientesPage() {
  const supabase = await createClient()

  const { data: clientes } = await supabase
    .from('profiles')
    .select('id, user_id, nombre, email, created_at')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Clientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {clientes?.length ?? 0} cliente{clientes?.length !== 1 ? 's' : ''} registrado{clientes?.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {!clientes?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users size={32} className="mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No hay clientes registrados aún.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {clientes.map((cliente) => (
              <Link
                key={cliente.id}
                href={`/admin/clientes/${cliente.user_id}`}
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                    {cliente.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{cliente.nombre}</p>
                    <p className="text-xs text-muted-foreground">{cliente.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="hidden text-xs text-muted-foreground sm:block">
                    Desde {formatDate(cliente.created_at)}
                  </p>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
