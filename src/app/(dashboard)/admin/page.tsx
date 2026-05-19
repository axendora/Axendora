import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre, role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/cliente')

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="font-serif text-4xl font-semibold">
        Panel de administración
      </h1>
      <p className="text-muted-foreground">El panel admin está en construcción.</p>
      <p className="text-xs text-muted-foreground">Fase 5 del roadmap</p>
    </main>
  )
}
