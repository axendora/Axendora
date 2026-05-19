import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/shell'
import { LayoutDashboard, Package, MessageSquare, User } from 'lucide-react'
import type { NavLink } from '@/components/dashboard/sidebar'

const clienteNavLinks: NavLink[] = [
  { href: '/cliente', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/cliente/servicios', label: 'Mis Servicios', icon: Package, exact: false },
  { href: '/cliente/solicitudes', label: 'Solicitudes', icon: MessageSquare, exact: false },
  { href: '/cliente/perfil', label: 'Mi Perfil', icon: User, exact: false },
]

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
    <DashboardShell
      nombre={profile?.nombre ?? 'Usuario'}
      email={profile?.email ?? user.email ?? ''}
      navLinks={clienteNavLinks}
      rootHref="/cliente"
      title="Panel de cliente"
    >
      {children}
    </DashboardShell>
  )
}
