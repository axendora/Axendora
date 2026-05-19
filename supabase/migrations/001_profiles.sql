-- ============================================================
-- Migración 001: tabla profiles + RLS + trigger auto-creación
-- ============================================================

create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null unique,
  nombre       text not null,
  email        text not null,
  role         text not null default 'client'
               check (role in ('client', 'admin')),
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- Habilitar RLS
alter table public.profiles enable row level security;

-- Usuarios pueden leer su propio perfil
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = user_id);

-- Usuarios pueden actualizar su propio perfil (sin cambiar el rol)
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and role = (select role from public.profiles where user_id = auth.uid())
  );

-- Función que actualiza updated_at automáticamente
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Función que crea el perfil al registrar un usuario
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, nombre, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
