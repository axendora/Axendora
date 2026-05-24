// Server-only — uses next/headers via createClient. Never import from client components.
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_TIMEZONE } from '@/lib/timezone'

export async function getAgencyTimezone(): Promise<string> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('agency_settings')
      .select('timezone')
      .limit(1)
      .single()
    return data?.timezone ?? DEFAULT_TIMEZONE
  } catch {
    return DEFAULT_TIMEZONE
  }
}
