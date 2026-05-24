import {
  DollarSign, Megaphone, Palette, Globe, TrendingUp, Share2,
  Wrench, Users, Monitor, Zap, Car, BookOpen, Package, Tag,
  Briefcase, Coffee, ShoppingCart, Wifi, type LucideIcon,
} from 'lucide-react'

export const ICON_MAP: Record<string, LucideIcon> = {
  DollarSign, Megaphone, Palette, Globe, TrendingUp, Share2,
  Wrench, Users, Monitor, Zap, Car, BookOpen, Package, Tag,
  Briefcase, Coffee, ShoppingCart, Wifi,
}

export function CatIcon({ nombre, color, size = 16 }: { nombre: string; color: string; size?: number }) {
  const Icon = ICON_MAP[nombre] ?? Tag
  return <Icon size={size} style={{ color }} />
}
