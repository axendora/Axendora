-- ============================================================
-- 012_facturas.sql
-- Módulo de facturación: tabla facturas + RLS
-- ============================================================

-- Tipos
create type public.factura_estado as enum (
  'pendiente',
  'pagada',
  'vencida',
  'cancelada'
);

create type public.moneda_tipo as enum ('USD', 'COP');

-- Función updated_at (idempotente)
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Tabla
create table public.facturas (
  id                 uuid            primary key default gen_random_uuid(),
  client_id          uuid            not null references auth.users(id) on delete cascade,
  client_service_id  uuid            references public.client_services(id) on delete set null,
  numero             text            not null unique,
  concepto           text            not null,
  monto              numeric(12, 2)  not null check (monto > 0),
  moneda             moneda_tipo     not null default 'USD',
  estado             factura_estado  not null default 'pendiente',
  fecha_emision      date            not null default current_date,
  fecha_vencimiento  date,
  fecha_pago         date,
  notas              text,
  created_at         timestamptz     not null default now(),
  updated_at         timestamptz     not null default now()
);

-- Trigger updated_at
create trigger facturas_updated_at
  before update on public.facturas
  for each row execute procedure public.handle_updated_at();

-- RLS
alter table public.facturas enable row level security;

-- Admin: acceso total
create policy "admin_all_facturas" on public.facturas
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- Cliente: solo ve sus propias facturas
create policy "client_read_own_facturas" on public.facturas
  for select to authenticated
  using (client_id = auth.uid());
