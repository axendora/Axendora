'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface ThemeLogoProps {
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export function ThemeLogo({ className, width = 120, height = 36, priority }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // In light mode: invert(1) turns white letters black, hue-rotate(180deg) brings teal back
  const filterStyle =
    mounted && resolvedTheme === 'light'
      ? { filter: 'invert(1) hue-rotate(180deg)' }
      : undefined

  return (
    <Image
      src="/logo_letras_blancas.png"
      alt="Axendora"
      width={width}
      height={height}
      className={className}
      style={filterStyle}
      priority={priority}
    />
  )
}
