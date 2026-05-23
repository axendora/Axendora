import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClienteShell } from '@/components/cliente/shell'

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre, email, role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role === 'admin') redirect('/admin')

  const { count: notifCount } = await supabase
    .from('solicitudes')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', user.id)
    .in('estado', ['abierta', 'en_proceso'])

  return (
    <ClienteShell
      nombre={profile?.nombre ?? 'Usuario'}
      email={profile?.email ?? user.email ?? ''}
      notificationCount={notifCount ?? 0}
    >
      {children}
    </ClienteShell>
  )
}
