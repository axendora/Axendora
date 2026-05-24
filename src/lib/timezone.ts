// Pure timezone utilities — safe for client AND server components.
// For server-only getAgencyTimezone(), import from '@/lib/timezone.server'

export type TimezoneOption = {
  value: string
  label: string
  flag: string
  offset: string
}

export const TIMEZONES: TimezoneOption[] = [
  { value: 'America/Caracas',                   label: 'Venezuela',        flag: '🇻🇪', offset: 'UTC−4'   },
  { value: 'America/Bogota',                    label: 'Colombia',         flag: '🇨🇴', offset: 'UTC−5'   },
  { value: 'America/Lima',                      label: 'Perú',             flag: '🇵🇪', offset: 'UTC−5'   },
  { value: 'America/Panama',                    label: 'Panamá',           flag: '🇵🇦', offset: 'UTC−5'   },
  { value: 'America/Guayaquil',                 label: 'Ecuador',          flag: '🇪🇨', offset: 'UTC−5'   },
  { value: 'America/Santiago',                  label: 'Chile',            flag: '🇨🇱', offset: 'UTC−4/−3'},
  { value: 'America/Argentina/Buenos_Aires',    label: 'Argentina',        flag: '🇦🇷', offset: 'UTC−3'   },
  { value: 'America/Sao_Paulo',                 label: 'Brasil',           flag: '🇧🇷', offset: 'UTC−3'   },
  { value: 'America/Mexico_City',               label: 'México',           flag: '🇲🇽', offset: 'UTC−6/−5'},
  { value: 'America/New_York',                  label: 'EE.UU. Este',      flag: '🇺🇸', offset: 'UTC−5/−4'},
  { value: 'America/Chicago',                   label: 'EE.UU. Central',   flag: '🇺🇸', offset: 'UTC−6/−5'},
  { value: 'Europe/Madrid',                     label: 'España',           flag: '🇪🇸', offset: 'UTC+1/+2'},
  { value: 'UTC',                               label: 'UTC Universal',    flag: '🌐',  offset: 'UTC+0'   },
]

export const DEFAULT_TIMEZONE = 'America/Caracas'

export function formatDate(
  dateInput: string | Date,
  timezone: string = DEFAULT_TIMEZONE,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  },
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es', { ...options, timeZone: timezone }).format(date)
}

export function formatDateTime(
  dateInput: string | Date,
  timezone: string = DEFAULT_TIMEZONE,
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  }).format(date)
}

export function formatMonthYear(
  dateInput: string | Date,
  timezone: string = DEFAULT_TIMEZONE,
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es', {
    month: 'long',
    year: 'numeric',
    timeZone: timezone,
  }).format(date)
}

export function formatShortMonth(
  dateInput: string | Date,
  timezone: string = DEFAULT_TIMEZONE,
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es', {
    month: 'short',
    year: '2-digit',
    timeZone: timezone,
  }).format(date)
}

export function formatRelative(
  dateInput: string | Date,
  timezone: string = DEFAULT_TIMEZONE,
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return '—'

  const nowInTz = new Date(
    new Date().toLocaleString('en-US', { timeZone: timezone }),
  )
  const diff = nowInTz.getTime() - date.getTime()
  const mins = Math.floor(diff / 60_000)

  if (mins < 1)  return 'ahora mismo'
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7)  return `hace ${days}d`
  return formatDate(date, timezone)
}

export function toLocalDateKey(
  dateInput: string | Date,
  timezone: string = DEFAULT_TIMEZONE,
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone,
  }).formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function toLocalMonthKey(
  dateInput: string | Date,
  timezone: string = DEFAULT_TIMEZONE,
): string {
  return toLocalDateKey(dateInput, timezone).slice(0, 7)
}
