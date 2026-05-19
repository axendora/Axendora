# UI Design System — Axendora

Usa esta skill cuando crees cualquier componente visual, ajustes estilos, o decidas tipografía/espaciado.

---

## Filosofía

**Dark, minimalista, premium, con teal como acento.** El logo de Axendora marca el tono: fondo negro profundo, tipografía blanca clara, triángulo teal vibrante como punto focal.

- **Más espacio que adornos.** Padding generoso, jerarquía clara.
- **Una sola decisión por pantalla.** El CTA principal siempre evidente.
- **Sin gradientes recargados.** Si hay gradient, sutil y de marca (negro → teal).
- **Bordes en lugar de sombras** cuando estamos en fondo oscuro.

---

## Tokens de color (Tailwind v4 / CSS vars)

En `src/app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 0%;
    --foreground: 0 0% 100%;
    --card: 0 0% 4%;
    --card-foreground: 0 0% 100%;
    --popover: 0 0% 10%;
    --popover-foreground: 0 0% 100%;
    --primary: 188 71% 42%;            /* #1FA8B8 */
    --primary-foreground: 0 0% 0%;
    --secondary: 0 0% 10%;
    --secondary-foreground: 0 0% 100%;
    --muted: 0 0% 15%;
    --muted-foreground: 240 5% 65%;    /* #A1A1AA */
    --accent: 188 71% 42%;
    --accent-foreground: 0 0% 0%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 240 4% 16%;              /* #27272A */
    --input: 240 4% 16%;
    --ring: 188 71% 42%;
    --radius: 0.75rem;
  }
}
```

---

## Tipografía

```ts
// app/layout.tsx
import { Inter, Cormorant_Garamond } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
})
```

- **Inter** para UI, body, headings funcionales.
- **Cormorant Garamond** solo para slogan/acentos decorativos (replicando el estilo del subtítulo del logo).
- Escala: `text-xs` 12px → `text-sm` 14px → `text-base` 16px → `text-lg` 18px → `text-xl` 20px → `text-2xl` 24px → `text-3xl` 30px → `text-4xl` 36px → `text-5xl` 48px → `text-6xl` 60px.

---

## Componentes base (shadcn/ui)

Instalar progresivamente solo los que se usen:

```
button, input, label, textarea, select, checkbox, radio-group,
card, dialog, sheet, dropdown-menu, tabs, table, toast,
form, avatar, badge, separator, skeleton, alert, tooltip,
navigation-menu, sidebar
```

Comando: `pnpm dlx shadcn@latest add button card input ...`

---

## Patrones recurrentes

### Card de servicio (landing)
```tsx
<div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40">
  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />
  <div className="relative">
    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="mb-2 text-xl font-semibold">{titulo}</h3>
    <p className="text-muted-foreground">{descripcion}</p>
  </div>
</div>
```

### Botón CTA principal
```tsx
<Button size="lg" className="bg-primary text-black hover:bg-primary/90">
  Solicitar propuesta
</Button>
```

### Stat card (dashboard)
```tsx
<Card className="border-border bg-card">
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
    <Icon className="h-4 w-4 text-primary" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{valor}</div>
    <p className="text-xs text-muted-foreground">{cambio}</p>
  </CardContent>
</Card>
```

---

## Layout del dashboard

- **Sidebar fija a la izquierda** en desktop (colapsable).
- **Bottom nav o sheet menu** en mobile.
- Header con búsqueda + avatar + notificaciones.
- Breadcrumbs en cada sección.

Usar el componente `sidebar` de shadcn (`pnpm dlx shadcn@latest add sidebar`).

---

## Responsive

Breakpoints Tailwind por defecto:
- `sm:` 640px — móvil grande
- `md:` 768px — tablet
- `lg:` 1024px — laptop
- `xl:` 1280px — desktop
- `2xl:` 1536px — pantallas grandes

**Mobile first.** Empezar siempre por la versión móvil y escalar hacia arriba.

---

## Iconografía

- **lucide-react** exclusivamente.
- Tamaño estándar `h-4 w-4` (16px) en UI, `h-5 w-5` en botones, `h-6 w-6` en cards, `h-8 w-8`+ en hero.
- Color: heredar de `text-*` del contenedor.

---

## Microinteracciones

- Transiciones cortas: `transition-all duration-200` o `300`.
- Hover sutil: cambios de border, fondo `bg-primary/5`, scale máximo `1.02`.
- Loading: skeletons de shadcn, no spinners gigantes.
- Estados vacíos: ilustración mínima o icono grande + texto + CTA.

---

## Accesibilidad mínima

- Contraste AA siempre (el teal `#1FA8B8` sobre negro pasa AA para texto grande).
- Estados de foco visibles (anillo `ring-primary`).
- Etiquetas en todos los inputs.
- `aria-label` en botones solo con icono.
- Navegación por teclado completa.
