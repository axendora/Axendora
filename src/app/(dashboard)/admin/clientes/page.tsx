import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { ClientesView } from './_components/clientes-view'

export default async function AdminClientesPage() {
  const supabase = await createClient()

  const { data: clientes } = await supabase
    .from('profiles')
    .select('id, user_id, nombre, email, telefono, whatsapp, empresa, sector, ciudad, pais, website, notas_internas, created_at')
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

      {!clientes?.length ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-16 text-center">
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
        <ClientesView clientes={clientes} />
      )}
    </div>
  )
}
