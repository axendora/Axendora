-- ============================================================
-- Migración 009: tabla plans + solicitudes.plan_id + storage
-- ============================================================

-- ── plans (catálogo de planes vendibles) ────────────────────────────────────
create table if not exists public.plans (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  descripcion     text,
  categoria       text not null check (categoria in ('marketing', 'diseno', 'web')),
  precio_usd      numeric(12, 2),
  precio_cop      numeric(14, 2),
  tipo_precio     text not null default 'mensual' check (tipo_precio in ('mensual', 'unico')),
  imagen_url      text,
  icono           text,
  destacado       boolean not null default false,
  activo          boolean not null default true,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

create index if not exists plans_categoria_idx on public.plans (categoria);
create index if not exists plans_activo_idx    on public.plans (activo);

-- updated_at trigger (reusa función ya definida en 001_profiles.sql)
drop trigger if exists plans_updated_at on public.plans;
create trigger plans_updated_at
  before update on public.plans
  for each row execute procedure public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.plans enable row level security;

-- Cualquier autenticado ve los planes activos; admin ve todos
drop policy if exists "plans_select_active_or_admin" on public.plans;
create policy "plans_select_active_or_admin"
  on public.plans for select
  using (activo = true or is_admin());

-- Admin total
drop policy if exists "plans_admin_all" on public.plans;
create policy "plans_admin_all"
  on public.plans for all
  using (is_admin()) with check (is_admin());

-- ── solicitudes: extender tipo + agregar plan_id ────────────────────────────
alter table public.solicitudes drop constraint if exists solicitudes_tipo_check;
alter table public.solicitudes add constraint solicitudes_tipo_check
  check (tipo in ('soporte', 'consulta', 'cambio', 'plan', 'otro'));

alter table public.solicitudes
  add column if not exists plan_id uuid references public.plans(id) on delete set null;

-- ── función para que el cliente obtenga el WhatsApp del admin ───────────────
-- SECURITY DEFINER: bypasea la RLS de profiles que solo deja ver el propio.
create or replace function public.get_admin_whatsapp()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select whatsapp
  from public.profiles
  where role = 'admin'
    and whatsapp is not null
    and whatsapp <> ''
  order by created_at asc
  limit 1
$$;

grant execute on function public.get_admin_whatsapp() to authenticated;

-- ── Storage bucket para imágenes de planes ──────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'plan-images',
  'plan-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects'
      and policyname = 'plan_images_public_read'
  ) then
    execute $policy$
      create policy "plan_images_public_read"
        on storage.objects for select
        using (bucket_id = 'plan-images')
    $policy$;
  end if;
end
$$;
