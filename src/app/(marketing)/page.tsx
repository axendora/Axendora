import type { Metadata } from 'next'
import { Hero } from '@/components/marketing/hero'
import { Stats } from '@/components/marketing/stats'
import { Servicios } from '@/components/marketing/servicios'
import { Proceso } from '@/components/marketing/proceso'
import { Portfolio } from '@/components/marketing/portfolio'
import { Testimonios } from '@/components/marketing/testimonios'
import { Contacto } from '@/components/marketing/contacto'

export const metadata: Metadata = {
  title: {
    absolute: 'Axendora — Agencia de Marketing Digital',
  },
  description:
    'Gestión de redes sociales, campañas en Meta, diseño gráfico y páginas web profesionales en Latinoamérica. +50 clientes activos y resultados medibles.',
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
      <Stats />
      <Servicios />
      <Proceso />
      <Portfolio />
      <Testimonios />
      <Contacto />
    </>
  )
}
