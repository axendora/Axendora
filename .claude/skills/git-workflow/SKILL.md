# Git Workflow — Axendora

Usa esta skill cada vez que vayas a hacer `git add`, `commit`, `push`, crear ramas, o configurar Git para el proyecto.

---

## ⚠️ REGLA CRÍTICA — Confirmar cuenta antes de push

Jeramine maneja **varias cuentas de GitHub**. Antes de **cualquier** `git push`, preguntar explícitamente:

> "Voy a hacer push a la cuenta **`axendora`** (axendora@gmail.com). Resumen de commits: [lista]. ¿Confirmas?"

Solo proceder cuando Jeramine responda afirmativamente. Si responde con otra cuenta, ajustar antes de hacer push.

---

## Configuración inicial (una sola vez)

Ejecutar en la raíz del repo:

```bash
git config user.name "Jeramine Rojas"
git config user.email "axendora@gmail.com"
```

Verificar:
```bash
git config user.name
git config user.email
git remote -v
```

Si el remote apunta a otra cuenta, ajustar la URL para usar la cuenta correcta (con SSH o credential helper).

---

## Convenciones de commits (Conventional Commits)

Formato: `<tipo>(<scope opcional>): <descripción corta>`

| Tipo | Cuándo usar |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `style` | Cambios de formato/diseño visual (no de código) |
| `refactor` | Reescritura sin cambiar comportamiento |
| `docs` | Cambios en documentación |
| `chore` | Tareas de mantenimiento, deps, configs |
| `perf` | Mejoras de rendimiento |
| `test` | Tests |
| `ci` | Configuración de CI/CD |

Ejemplos:
```
feat(auth): agregar registro de clientes con Supabase
feat(dashboard): implementar panel de estadísticas del cliente
fix(middleware): corregir redirect en ruta de admin
style(landing): ajustar paleta del hero al teal de marca
chore: configurar Tailwind v4 y shadcn
docs: actualizar CLAUDE.md con stack final
```

**Descripción en imperativo, en inglés o español consistente.** Para Axendora preferimos español en commits funcionales y inglés en chores/configs.

---

## Flujo estándar de trabajo

1. Verificar rama actual: `git status` y `git branch`.
2. Si estás en `main`, crear rama: `git checkout -b feature/nombre-corto`.
3. Hacer cambios.
4. `git add <archivos específicos>` (evitar `git add .` salvo casos claros).
5. `git status` para revisar qué está staged.
6. `git commit -m "tipo: descripción"`.
7. **Antes de push:** preguntar a Jeramine + confirmar cuenta.
8. `git push -u origin feature/nombre-corto` (primera vez) o `git push` (subsiguientes).

---

## Branches

- `main` — Producción. Deploy automático en Vercel. **Nunca commitear directo.**
- `develop` — Integración (opcional al inicio del proyecto).
- `feature/<nombre>` — Nueva funcionalidad.
- `fix/<nombre>` — Corrección.
- `chore/<nombre>` — Mantenimiento.

---

## `.gitignore` mínimo para este proyecto

```
# dependencies
node_modules/
.pnp
.pnp.js

# next.js
.next/
out/
build/

# env files
.env
.env.local
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
.idea/

# OS
.DS_Store
Thumbs.db

# logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Supabase
supabase/.branches
supabase/.temp

# Claude
.claude/settings.local.json
```

---

## Antes de hacer push, lista de verificación

- [ ] `npm run lint` (o `pnpm lint`) pasa.
- [ ] `npm run build` compila sin errores.
- [ ] No hay `console.log` olvidados en código de producción.
- [ ] No hay credenciales hardcodeadas (revisar `.env*`).
- [ ] El commit message sigue Conventional Commits.
- [ ] Confirmé con Jeramine la cuenta GitHub a usar.

---

## Pull Requests

Cuando se trabaje en ramas separadas:
1. Push de la rama.
2. Abrir PR desde la UI de GitHub apuntando a `main` (o `develop`).
3. Descripción: qué cambió, por qué, cómo probarlo, screenshots si es UI.
4. Esperar revisión de Jeramine antes de mergear.

---

## Si algo sale mal

- Deshacer último commit (sin perder cambios): `git reset --soft HEAD~1`
- Deshacer staged: `git reset HEAD <archivo>`
- Descartar cambios locales en un archivo: `git checkout -- <archivo>` (¡cuidado, irreversible!)
- Ver diferencia: `git diff` o `git diff --staged`

**Cuando tengas dudas, preguntar antes que ejecutar.**
