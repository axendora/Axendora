import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PerfilForm } from './_components/perfil-form'

export default async function PerfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre, email, created_at')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Mi Perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona tu información personal.
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-xl font-semibold text-primary">
          {profile?.nombre?.charAt(0).toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="font-semibold">{profile?.nombre}</p>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
        </div>
      </div>

      <PerfilForm
        userId={user.id}
        initialNombre={profile?.nombre ?? ''}
        email={profile?.email ?? user.email ?? ''}
      />
    </div>
  )
}
