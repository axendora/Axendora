import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ClienteDashboardPage() {
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

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="font-serif text-4xl font-semibold">
        Bienvenido, {profile?.nombre ?? 'Cliente'}
      </h1>
      <p className="text-muted-foreground">Tu panel de cliente está en construcción.</p>
      <p className="text-xs text-muted-foreground">Fase 4 del roadmap</p>
    </main>
  )
}
