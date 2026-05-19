import type { Metadata } from 'next'
import { Hero } from '@/components/marketing/hero'
import { Servicios } from '@/components/marketing/servicios'
import { Portfolio } from '@/components/marketing/portfolio'
import { Contacto } from '@/components/marketing/contacto'

export const metadata: Metadata = {
  title: {
    absolute: 'Axendora — Agencia de Marketing Digital',
  },
  description:
    'Gestión de redes sociales, campañas en Meta, diseño gráfico y páginas web profesionales en Latinoamérica.',
  openGraph: {
    title: 'Axendora — Agencia de Marketing Digital',
    description:
      'Gestión de redes sociales, campañas en Meta, diseño gráfico y páginas web profesionales.',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Servicios />
      <Portfolio />
      <Contacto />
    </>
  )
}
