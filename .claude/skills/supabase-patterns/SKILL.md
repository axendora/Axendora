# Supabase Patterns — Axendora

Usa esta skill cuando trabajes con Supabase: clientes, queries, autenticación, RLS, migraciones o storage.

---

## Clientes de Supabase (tres tipos)

### 1. Cliente para Server Components / Route Handlers
`src/lib/supabase/server.ts`

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — ignorar
          }
        },
      },
    }
  )
}
```

### 2. Cliente para Browser / Client Components
`src/lib/supabase/client.ts`

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 3. Cliente para Middleware
`src/lib/supabase/middleware.ts` — Manejo de refresh de sesión.

### 4. Cliente admin (service role) — SOLO server
`src/lib/supabase/admin.ts` — Usar `SUPABASE_SERVICE_ROLE_KEY`. Nunca exponer al cliente.

---

## Reglas de queries

- **Server Components**: usar el cliente server. No exponer credenciales.
- **Mutations desde cliente**: pasar por route handlers (`app/api/...`) o Server Actions.
- **Listas grandes**: paginar con `.range(start, end)`.
- **Joins**: usar foreign key syntax: `.select('*, profiles(nombre, avatar_url)')`.
- **Manejo de errores**: siempre destructurar `{ data, error }` y manejar `error` explícitamente.

---

## Row Level Security (RLS)

**Toda tabla debe tener RLS habilitado.** Plantillas comunes:

### Tabla con datos del propio usuario
```sql
alter table public.profiles enable row level security;

create policy "Usuarios pueden ver su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuarios pueden actualizar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);
```

### Tabla donde admin ve todo y cliente solo lo suyo
```sql
create policy "Clientes ven solo sus contrataciones"
  on public.contrataciones for select
  using (
    cliente_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Solo admin puede insertar contrataciones"
  on public.contrataciones for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### Función helper para chequear rol admin
```sql
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
```

---

## Migraciones

- Carpeta: `supabase/migrations/`
- Nombre: `YYYYMMDDHHMMSS_descripcion.sql`
- Cada migración debe incluir: creación de tabla, índices, RLS habilitado, policies, triggers (si aplica).
- Para `updated_at` automático:

```sql
create trigger set_updated_at
  before update on public.<tabla>
  for each row
  execute function public.handle_updated_at();
```

---

## Autenticación

### Trigger para crear profile al registrarse
```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, nombre, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', new.email),
    'client'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### Verificar rol en Server Component
```ts
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')

const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (profile?.role !== 'admin') redirect('/cliente/inicio')
```

---

## Storage

- Buckets sugeridos: `reportes` (privado), `avatares` (público), `assets-clientes` (privado).
- Para buckets privados, generar signed URLs con `.createSignedUrl(path, expiresIn)`.
- Limitar tamaño y tipo en el frontend Y validar también en el servidor.

---

## Realtime

Usar solo cuando aporte valor real (ej. notificaciones, chat). Para datos que cambian poco, preferir TanStack Query con revalidación.

```ts
useEffect(() => {
  const channel = supabase
    .channel('notificaciones')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notificaciones', filter: `user_id=eq.${userId}` },
      (payload) => { /* ... */ }
    )
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [userId])
```
