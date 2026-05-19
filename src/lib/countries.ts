export interface CountryCode {
  code: string   // "+57"
  digits: string // "57"
  flag: string
  label: string
}

export interface Country {
  value: string
  flag: string
  label: string
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+57',  digits: '57',  flag: '🇨🇴', label: 'Colombia' },
  { code: '+58',  digits: '58',  flag: '🇻🇪', label: 'Venezuela' },
  { code: '+52',  digits: '52',  flag: '🇲🇽', label: 'México' },
  { code: '+54',  digits: '54',  flag: '🇦🇷', label: 'Argentina' },
  { code: '+56',  digits: '56',  flag: '🇨🇱', label: 'Chile' },
  { code: '+51',  digits: '51',  flag: '🇵🇪', label: 'Perú' },
  { code: '+593', digits: '593', flag: '🇪🇨', label: 'Ecuador' },
  { code: '+507', digits: '507', flag: '🇵🇦', label: 'Panamá' },
  { code: '+1',   digits: '1',   flag: '🇺🇸', label: 'EE.UU.' },
  { code: '+55',  digits: '55',  flag: '🇧🇷', label: 'Brasil' },
  { code: '+34',  digits: '34',  flag: '🇪🇸', label: 'España' },
]

export const COUNTRIES: Country[] = [
  { value: 'Colombia',           flag: '🇨🇴', label: 'Colombia' },
  { value: 'Venezuela',          flag: '🇻🇪', label: 'Venezuela' },
  { value: 'México',             flag: '🇲🇽', label: 'México' },
  { value: 'Argentina',          flag: '🇦🇷', label: 'Argentina' },
  { value: 'Chile',              flag: '🇨🇱', label: 'Chile' },
  { value: 'Perú',               flag: '🇵🇪', label: 'Perú' },
  { value: 'Ecuador',            flag: '🇪🇨', label: 'Ecuador' },
  { value: 'Panamá',             flag: '🇵🇦', label: 'Panamá' },
  { value: 'República Dominicana', flag: '🇩🇴', label: 'República Dominicana' },
  { value: 'Estados Unidos',     flag: '🇺🇸', label: 'Estados Unidos' },
  { value: 'Brasil',             flag: '🇧🇷', label: 'Brasil' },
  { value: 'España',             flag: '🇪🇸', label: 'España' },
]

/** Builds a wa.me URL from a stored whatsapp value like "+573001234567" */
export function waLink(whatsapp: string, message?: string): string {
  const digits = whatsapp.replace(/\D/g, '')
  const base = `https://wa.me/${digits}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
