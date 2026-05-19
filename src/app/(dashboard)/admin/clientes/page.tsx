import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, ChevronRight, UserPlus, Building2, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

export default async function AdminClientesPage() {
  const supabase = await createClient()

  const { data: clientes } = await supabase
    .from('profiles')
    .select('id, user_id, nombre, email, telefono, empresa, ciudad, created_at')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {clientes?.length ?? 0} cliente{clientes?.length !== 1 ? 's' : ''} registrado{clientes?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/clientes/nuevo"
          className={cn(buttonVariants({ size: 'sm' }), 'shrink-0 gap-1.5')}
        >
          <UserPlus size={15} />
          Registrar cliente
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {!clientes?.length ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Users size={24} className="text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium">Sin clientes registrados</p>
              <p className="mt-1 text-xs text-muted-foreground">Registra el primero para empezar a gestionar cuentas.</p>
            </div>
            <Link
              href="/admin/clientes/nuevo"
              className={cn(buttonVariants({ size: 'sm' }), 'mt-1 gap-1.5')}
            >
              <UserPlus size={14} />
              Registrar primer cliente
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {clientes.map((cliente) => (
              <Link
                key={cliente.id}
                href={`/admin/clientes/${cliente.user_id}`}
                className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/30"
              >
                {/* Avatar + nombre */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {cliente.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{cliente.nombre}</p>
                    <p className="text-xs text-muted-foreground truncate">{cliente.email}</p>
                  </div>
                </div>

                {/* Info empresa / teléfono — solo visible en pantallas medianas */}
                <div className="hidden min-w-0 flex-1 md:block">
                  {cliente.empresa && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 size={11} className="shrink-0" />
                      <span className="truncate">{cliente.empresa}</span>
                    </div>
                  )}
                  {cliente.telefono && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone size={11} className="shrink-0" />
                      <span>{cliente.telefono}</span>
                    </div>
                  )}
                </div>

                {/* Fecha + flecha */}
                <div className="flex shrink-0 items-center gap-3">
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
