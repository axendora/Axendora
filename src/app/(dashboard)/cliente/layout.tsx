import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/shell'

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre, email')
    .eq('user_id', user.id)
    .single()

  return (
    <DashboardShell nombre={profile?.nombre ?? 'Usuario'} email={profile?.email ?? user.email ?? ''}>
      {children}
    </DashboardShell>
  )
}
