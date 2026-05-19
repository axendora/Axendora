import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/shell'
import type { NavLink } from '@/components/dashboard/sidebar'

const adminNavLinks: NavLink[] = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { href: '/admin/clientes', label: 'Clientes', icon: 'users', exact: false },
  { href: '/admin/solicitudes', label: 'Solicitudes', icon: 'message-square', exact: false },
  { href: '/admin/servicios', label: 'Catálogo', icon: 'package', exact: false },
  { href: '/admin/reportes', label: 'Reportes', icon: 'bar-chart', exact: false },
]

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

  return (
    <DashboardShell
      nombre={profile.nombre}
      email={profile.email ?? user.email ?? ''}
      navLinks={adminNavLinks}
      rootHref="/admin"
      title="Panel Admin"
    >
      {children}
    </DashboardShell>
  )
}
