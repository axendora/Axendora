import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminShell } from '@/components/admin/shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

  if (profile?.role !== 'admin') redirect('/cliente')

  const { count: pendingCount } = await supabase
    .from('solicitudes')
    .select('id', { count: 'exact', head: true })
    .in('estado', ['abierta', 'en_proceso'])

  return (
    <AdminShell
      nombre={profile.nombre}
      email={profile.email ?? user.email ?? ''}
      notificationCount={pendingCount ?? 0}
    >
      {children}
    </AdminShell>
  )
}
