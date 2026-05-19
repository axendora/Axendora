# CLAUDE.md — Axendora CRM

> Archivo de contexto principal para Claude Code. Lee este documento al inicio de cada sesión antes de tomar cualquier decisión técnica.

---

## 🏢 Sobre el proyecto

**Axendora** es una agencia de marketing digital. Este repositorio contiene su sitio web público + CRM interno para clientes y administradores.

- **Propietario:** Jeramine Rojas
- **Email corporativo:** axendora@gmail.com
- **Cuenta GitHub para commits:** `axendora`
- **Repo local:** `C:\Users\kirito\Documents\Axendora\web-crm-axendora`

### Servicios que ofrece Axendora
1. Gestión de redes sociales
2. Creación y activación de campañas publicitarias en Meta (Facebook, Instagram, WhatsApp)
3. Diseño gráfico
4. Creación de páginas web personalizadas y profesionales
5. Pautas en redes sociales

---

## 🎨 Identidad visual

### Paleta de colores (basada en el logo)

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#1FA8B8` | Botones, CTAs, acentos, links |
| `primary-dark` | `#167585` | Hover de primary |
| `primary-light` | `#4FC3D2` | Estados activos suaves |
| `background` | `#000000` | Fondo principal (dark mode por defecto) |
| `surface` | `#0A0A0A` | Cards, paneles |
| `surface-elevated` | `#1A1A1A` | Modales, dropdowns |
| `border` | `#27272A` | Bordes sutiles |
| `text-primary` | `#FFFFFF` | Texto principal |
| `text-secondary` | `#A1A1AA` | Texto secundario, descripciones |
| `success` | `#10B981` | Estados positivos |
| `warning` | `#F59E0B` | Avisos |
| `error` | `#EF4444` | Errores |

### Tipografía
- **Headings:** Inter o Geist (sans-serif moderno)
- **Body:** Inter
- **Slogan/decorativo:** Considerar una serif elegante (ej. Cormorant) para acentos específicos como en el logo

### Tono visual
- Dark mode como experiencia principal
- Diseño minimalista, espacioso, moderno
- Acentos en teal (#1FA8B8) para guiar la atención
- Bordes sutiles, sombras suaves, sin recargar

---

## 🛠️ Stack técnico (no cambiar sin consultar)

- **Framework:** Next.js 15 (App Router) + TypeScript estricto
- **Estilos:** Tailwind CSS v4 + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **Estado servidor:** TanStack Query
- **Estado UI:** Zustand (solo cuando sea necesario)
- **Formularios:** React Hook Form + Zod
- **Gráficas:** Recharts
- **Iconos:** lucide-react
- **Email transaccional:** Resend
- **Hosting:** Vercel
- **Package manager:** pnpm (preferido) o npm

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── (marketing)/      → Sitio público (landing, servicios, contacto)
│   ├── (auth)/           → Login, registro, recuperar contraseña
│   ├── (dashboard)/
│   │   ├── cliente/      → Panel del cliente
│   │   └── admin/        → Panel del administrador
│   └── api/              → Route handlers
├── components/
│   ├── ui/               → Componentes shadcn
│   ├── marketing/        → Específicos del landing
│   ├── dashboard/        → Específicos de paneles
│   └── shared/           → Compartidos (Navbar, Footer, etc)
├── lib/
│   ├── supabase/         → Clientes server/browser/middleware
│   ├── validations/      → Schemas Zod
│   └── utils.ts
├── hooks/
├── types/                → Tipos TypeScript globales
└── middleware.ts         → Protección de rutas por rol
```

---

## 👥 Roles y permisos

- **`guest`** — Visitante no autenticado. Solo accede al sitio público.
- **`client`** — Cliente registrado. Accede a `/cliente/*`. Ve solo sus datos.
- **`admin`** — Administrador. Accede a `/admin/*`. Ve y gestiona todo.

El rol se almacena en `profiles.role` en Supabase y se valida tanto en middleware como en RLS policies.

---

## 🔒 Reglas de seguridad

1. **Nunca** exponer la `SUPABASE_SERVICE_ROLE_KEY` al cliente. Solo en route handlers/server.
2. Todas las tablas de Supabase deben tener **RLS habilitado** con policies explícitas.
3. Validar inputs con Zod tanto en cliente como en servidor.
4. Sanitizar archivos subidos (tipo, tamaño máximo).
5. Usar `cookies()` de Next.js para sesiones, nunca localStorage para tokens.

---

## 🚀 Convenciones de Git

### Configuración local (ejecutar una vez)
```bash
git config user.name "Jeramine Rojas"
git config user.email "axendora@gmail.com"
```

### Antes de hacer push, SIEMPRE preguntar a Jeramine:
> "¿Confirmas que quieres hacer push a la cuenta **axendora** en GitHub? El commit incluye: [resumen]"

Jeramine maneja varias cuentas de GitHub, así que confirmar antes de cada push es obligatorio.

### Formato de commits (Conventional Commits)
```
feat: agregar formulario de registro de clientes
fix: corregir validación de email en login
style: ajustar paleta del dashboard
refactor: extraer hook useClientStats
docs: actualizar README con instrucciones de deploy
chore: actualizar dependencias
```

### Branches
- `main` — Producción (deploy automático en Vercel)
- `develop` — Integración
- `feature/nombre-corto` — Nuevas features
- `fix/nombre-corto` — Correcciones

---

## ✅ Reglas de trabajo con Claude Code

1. **Antes de cualquier cambio grande**, explicar el plan y esperar confirmación.
2. **Antes de instalar dependencias nuevas**, justificar por qué y preguntar.
3. **Antes de hacer commit/push**, mostrar resumen de cambios y confirmar cuenta GitHub.
4. **Nunca** crear archivos `.env` con valores reales. Solo `.env.example` con placeholders.
5. **Siempre** usar TypeScript estricto. Nada de `any` sin justificación.
6. **Siempre** validar formularios con Zod.
7. **Siempre** que se cree una tabla en Supabase, crear también su migración SQL y las RLS policies correspondientes.
8. **Responsive first**: cada vista del dashboard debe funcionar perfectamente en móvil, tablet y escritorio.
9. **Accesibilidad**: usar componentes shadcn (basados en Radix), `aria-*` cuando aplique, contraste mínimo AA.
10. **Idioma:** Toda la UI en español (es-ES neutral o es-LA según preferencia del usuario). Código y commits en inglés.

---

## 📦 Variables de entorno

Ver `.env.example` para la lista completa. Las principales:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # solo server
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=
```

---

## 📚 Skills disponibles

Las skills viven en `.claude/skills/`. Leerlas cuando aplique al contexto de la tarea:

- `supabase-patterns/` — Patrones para queries, RLS, auth
- `nextjs-conventions/` — Convenciones del App Router, Server Components, etc.
- `ui-design-system/` — Tokens de diseño, componentes base
- `git-workflow/` — Flujo de commits y push

---

## 🗺️ Roadmap

- [ ] **Fase 1:** Setup base (Next.js, Tailwind, shadcn, Supabase, deploy Vercel)
- [ ] **Fase 2:** Landing pública (hero, servicios, portfolio, contacto, SEO)
- [ ] **Fase 3:** Auth + roles (registro, login, middleware, RLS)
- [ ] **Fase 4:** Panel cliente (dashboard, servicios, solicitudes)
- [ ] **Fase 5:** Panel admin (gestión, reportes, planes, ofertas)
- [ ] **Fase 6:** Estadísticas con gráficas
- [ ] **Fase 7:** Notificaciones + emails
- [ ] **Fase 8:** Optimización + dominio en producción

---

_Última actualización: mayo 2026 — Inicio del proyecto._
