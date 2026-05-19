# Next.js Conventions — Axendora

Usa esta skill cuando crees rutas, componentes, layouts, route handlers o middleware en Next.js 15 App Router.

---

## Reglas generales

- **App Router** siempre. Nada de `pages/`.
- **Server Components por defecto.** Solo añadir `'use client'` cuando sea estrictamente necesario (hooks, eventos, browser APIs).
- **TypeScript estricto.** Si el linter pide un tipo, dárselo. Nada de `any` sin comentario justificando.
- **Route Groups** para organizar sin afectar URL: `(marketing)`, `(auth)`, `(dashboard)`.

---

## Estructura de una ruta típica

```
app/(dashboard)/cliente/servicios/
├── layout.tsx       → layout específico de la sección (opcional)
├── page.tsx         → server component, fetch inicial de datos
├── loading.tsx      → skeleton mientras carga
├── error.tsx        → fallback de error
└── _components/     → componentes locales (el _ los excluye del routing)
    ├── ServiciosList.tsx
    └── ServicioCard.tsx
```

---

## Patrón: Server Component con datos + Client Component interactivo

```tsx
// app/(dashboard)/cliente/servicios/page.tsx (Server)
import { createClient } from '@/lib/supabase/server'
import { ServiciosList } from './_components/ServiciosList'

export default async function ServiciosPage() {
  const supabase = await createClient()
  const { data: servicios } = await supabase
    .from('contrataciones')
    .select('*, servicios(*)')
    .order('created_at', { ascending: false })

  return <ServiciosList servicios={servicios ?? []} />
}
```

```tsx
// _components/ServiciosList.tsx (Client si hay interacción)
'use client'
import { useState } from 'react'

export function ServiciosList({ servicios }: { servicios: Contratacion[] }) {
  // ...
}
```

---

## Middleware (protección por rol)

```ts
// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user, profile } = await updateSession(request)
  const path = request.nextUrl.pathname

  // Rutas que requieren auth
  if (path.startsWith('/cliente') || path.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rutas admin
  if (path.startsWith('/admin') && profile?.role !== 'admin') {
    return NextResponse.redirect(new URL('/cliente/inicio', request.url))
  }

  // Si ya hay sesión y va a login/registro, mandar a su dashboard
  if (user && (path === '/login' || path === '/registro')) {
    const dest = profile?.role === 'admin' ? '/admin' : '/cliente/inicio'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

---

## Server Actions vs Route Handlers

- **Server Actions** (`'use server'`): para mutaciones desde formularios. Más simples.
- **Route Handlers** (`app/api/*/route.ts`): cuando necesitas un endpoint público, webhooks (Meta, Resend), o terceros consumiendo.

Ejemplo Server Action:
```ts
// app/(dashboard)/cliente/servicios/_actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { solicitudSchema } from '@/lib/validations/solicitud'

export async function crearSolicitud(formData: FormData) {
  const parsed = solicitudSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.format() }

  const supabase = await createClient()
  const { error } = await supabase.from('solicitudes').insert(parsed.data)
  if (error) return { error: error.message }

  revalidatePath('/cliente/servicios')
  return { success: true }
}
```

---

## Metadata y SEO

Cada página pública debe exportar metadata:

```ts
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Servicios | Axendora',
  description: 'Gestión de redes, campañas Meta, diseño y desarrollo web.',
  openGraph: {
    title: 'Axendora — Innovación, estrategia y diseño',
    images: ['/og-image.png'],
  },
}
```

Y en `app/layout.tsx`:
```ts
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  title: { default: 'Axendora', template: '%s | Axendora' },
  description: 'Agencia de marketing digital — innovación, estrategia y diseño.',
}
```

---

## Imágenes

- Usar `next/image` siempre.
- El logo está en `public/logo_letras_blancas.png`.
- Para imágenes de Supabase Storage, agregar el dominio en `next.config.ts`:

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '*.supabase.co' },
  ],
}
```

---

## Cache y revalidación

- `revalidatePath('/ruta')` después de cada mutación que afecte una vista.
- Para datos que cambian seguido (estadísticas), considerar `export const revalidate = 60` o fetch dinámico.
