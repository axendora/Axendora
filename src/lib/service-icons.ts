import {
  Share2, TrendingUp, Paintbrush, Globe, BarChart3,
  Megaphone, Camera, Video, Users, Target, Zap,
  Search, Mail, Smartphone, Monitor, Lightbulb, Rocket,
  Heart, Star, Package,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const SERVICE_ICONS: { name: string; Icon: LucideIcon; label: string }[] = [
  { name: 'share-2',      Icon: Share2,      label: 'Redes Sociales' },
  { name: 'trending-up',  Icon: TrendingUp,  label: 'Campañas' },
  { name: 'paintbrush',   Icon: Paintbrush,  label: 'Diseño' },
  { name: 'globe',        Icon: Globe,       label: 'Web' },
  { name: 'bar-chart-3',  Icon: BarChart3,   label: 'Analíticas' },
  { name: 'megaphone',    Icon: Megaphone,   label: 'Marketing' },
  { name: 'camera',       Icon: Camera,      label: 'Foto' },
  { name: 'video',        Icon: Video,       label: 'Video' },
  { name: 'users',        Icon: Users,       label: 'Comunidad' },
  { name: 'target',       Icon: Target,      label: 'Objetivo' },
  { name: 'zap',          Icon: Zap,         label: 'Impulso' },
  { name: 'search',       Icon: Search,      label: 'SEO' },
  { name: 'mail',         Icon: Mail,        label: 'Email' },
  { name: 'smartphone',   Icon: Smartphone,  label: 'Mobile' },
  { name: 'monitor',      Icon: Monitor,     label: 'Desktop' },
  { name: 'lightbulb',    Icon: Lightbulb,   label: 'Estrategia' },
  { name: 'rocket',       Icon: Rocket,      label: 'Lanzamiento' },
  { name: 'heart',        Icon: Heart,       label: 'Branding' },
  { name: 'star',         Icon: Star,        label: 'Premium' },
  { name: 'package',      Icon: Package,     label: 'Producto' },
]

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  SERVICE_ICONS.map(({ name, Icon }) => [name, Icon]),
)

export function getServiceIcon(name: string | null | undefined): LucideIcon | null {
  if (!name) return null
  return ICON_MAP[name] ?? null
}
