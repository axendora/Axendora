import { createClient } from '@/lib/supabase/server'
import { ConfigTabs } from './_components/config-tabs'
import type { AgencySettings } from '@/types/database.types'

export default async function AdminConfiguracionPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: settingsRow },
    { data: profile },
  ] = await Promise.all([
    supabase.from('agency_settings').select('*').limit(1).single(),
    user
      ? supabase
          .from('profiles')
          .select('nombre, email, user_id')
          .eq('user_id', user.id)
          .single()
      : Promise.resolve({ data: null }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Configuración</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Gestiona la información de la agencia, tu cuenta y preferencias del sistema.
        </p>
      </div>

      <ConfigTabs
        settings={settingsRow as AgencySettings | null}
        settingsId={(settingsRow as AgencySettings | null)?.id ?? null}
        userId={profile?.user_id ?? ''}
        nombre={profile?.nombre ?? ''}
        email={profile?.email ?? user?.email ?? ''}
      />
    </div>
  )
}
