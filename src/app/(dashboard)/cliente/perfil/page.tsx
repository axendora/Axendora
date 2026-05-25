import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PerfilForm } from './_components/perfil-form'
import { AvatarUploader } from './_components/avatar-uploader'
import { AparienciaForm } from '@/app/(dashboard)/admin/configuracion/_components/apariencia-form'
import { CalendarDays } from 'lucide-react'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  type ProfileData = {
    nombre: string
    email: string
    empresa: string | null
    whatsapp: string | null
    avatar_url: string | null
    created_at: string
  }

  // Intentar con avatar_url; si migración 019 no se ejecutó, degradar sin ella
  const res1 = await supabase
    .from('profiles')
    .select('nombre, email, empresa, whatsapp, avatar_url, created_at')
    .eq('user_id', user.id)
    .single()

  let profile: ProfileData | null = null
  if (!res1.error && res1.data) {
    profile = res1.data as unknown as ProfileData
  } else {
    const res2 = await supabase
      .from('profiles')
      .select('nombre, email, empresa, whatsapp, created_at')
      .eq('user_id', user.id)
      .single()
    if (res2.data) {
      profile = { ...(res2.data as Omit<ProfileData, 'avatar_url'>), avatar_url: null }
    }
  }

  const nombre    = profile?.nombre    ?? ''
  const empresa   = profile?.empresa   ?? ''
  const whatsapp  = profile?.whatsapp  ?? null
  const avatarUrl = profile?.avatar_url ?? null
  const email     = profile?.email ?? user.email ?? ''

  const miembroDesde = profile?.created_at
    ? new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(new Date(profile.created_at))
    : null

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Mi Perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona tu información personal y preferencias de la interfaz.
        </p>
      </div>

      {/* Avatar + info básica */}
      <div className="flex flex-col items-center gap-6 rounded-xl border border-border bg-card p-8 sm:flex-row sm:items-start">
        <AvatarUploader
          userId={user.id}
          currentUrl={avatarUrl}
          nombre={nombre}
        />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xl font-semibold text-foreground">{nombre || 'Sin nombre'}</p>
          {empresa && (
            <p className="mt-0.5 text-sm font-medium text-primary">{empresa}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">{email}</p>
          {miembroDesde && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
              <CalendarDays size={11} />
              Cliente desde {miembroDesde}
            </div>
          )}
        </div>
      </div>

      {/* Formulario de info */}
      <PerfilForm
        userId={user.id}
        initialNombre={nombre}
        initialEmpresa={empresa}
        initialWhatsapp={whatsapp}
        email={email}
      />

      {/* Tema */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Apariencia</h2>
          <p className="text-xs text-muted-foreground">Elige el tema visual de tu panel.</p>
        </div>
        <AparienciaForm />
      </div>
    </div>
  )
}
