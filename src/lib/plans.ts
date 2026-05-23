import type { PlanCategoria, TipoPrecio } from '@/types/database.types'
import { Megaphone, Paintbrush, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const PLAN_CATEGORIAS: { value: PlanCategoria; label: string; Icon: LucideIcon }[] = [
  { value: 'marketing', label: 'Marketing',    Icon: Megaphone  },
  { value: 'diseno',    label: 'Diseño',       Icon: Paintbrush },
  { value: 'web',       label: 'Páginas Web',  Icon: Globe      },
]

export function getCategoriaLabel(value: PlanCategoria): string {
  return PLAN_CATEGORIAS.find((c) => c.value === value)?.label ?? value
}

export function getCategoriaIcon(value: PlanCategoria): LucideIcon | null {
  return PLAN_CATEGORIAS.find((c) => c.value === value)?.Icon ?? null
}

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0,
})

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
})

export function formatUSD(value: number | null | undefined): string | null {
  if (value == null) return null
  return USD.format(value)
}

export function formatCOP(value: number | null | undefined): string | null {
  if (value == null) return null
  return COP.format(value)
}

export function tipoPrecioLabel(tipo: TipoPrecio): string {
  return tipo === 'mensual' ? '/mes' : 'único'
}

export function buildWhatsAppLink(numero: string, mensaje: string): string {
  const clean = numero.replace(/\D/g, '')
  return `https://wa.me/${clean}?text=${encodeURIComponent(mensaje)}`
}
