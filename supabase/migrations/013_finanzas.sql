-- ============================================================
-- 013_finanzas.sql
-- Módulo de ingresos y gastos
-- ============================================================

-- ── Categorías de ingresos ────────────────────────────────
create table public.ingreso_categorias (
  id         uuid    primary key default gen_random_uuid(),
  nombre     text    not null unique,
  icono      text    not null default 'DollarSign',
  color      text    not null default '#1FA8B8',
  sistema    boolean not null default false,
  orden      int     not null default 99,
  created_at timestamptz not null default now()
);

alter table public.ingreso_categorias enable row level security;

create policy "admin_all_ingreso_categorias" on public.ingreso_categorias
  for all to authenticated
  using   (exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin'));

-- Seed categorías de ingresos
insert into public.ingreso_categorias (nombre, icono, color, sistema, orden) values
  ('Marketing',      'Megaphone',   '#1FA8B8', true, 1),
  ('Diseño',         'Palette',     '#8B5CF6', true, 2),
  ('Web',            'Globe',       '#3B82F6', true, 3),
  ('Pautas',         'TrendingUp',  '#10B981', true, 4),
  ('Redes Sociales', 'Share2',      '#F59E0B', true, 5),
  ('Consultoría',    'Briefcase',   '#EC4899', true, 6),
  ('Otro',           'DollarSign',  '#71717A', true, 99)
on conflict (nombre) do nothing;

-- ── Categorías de gastos ──────────────────────────────────
create table public.gasto_categorias (
  id         uuid    primary key default gen_random_uuid(),
  nombre     text    not null unique,
  icono      text    not null default 'Package',
  color      text    not null default '#71717A',
  sistema    boolean not null default false,
  orden      int     not null default 99,
  created_at timestamptz not null default now()
);

alter table public.gasto_categorias enable row level security;

create policy "admin_all_gasto_categorias" on public.gasto_categorias
  for all to authenticated
  using   (exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin'));

-- Seed categorías de gastos
insert into public.gasto_categorias (nombre, icono, color, sistema, orden) values
  ('Publicidad',    'Megaphone',    '#EF4444', true, 1),
  ('Software',      'Wrench',       '#3B82F6', true, 2),
  ('Salarios',      'Users',        '#10B981', true, 3),
  ('Equipamiento',  'Monitor',      '#8B5CF6', true, 4),
  ('Servicios',     'Zap',          '#F59E0B', true, 5),
  ('Transporte',    'Car',          '#14B8A6', true, 6),
  ('Capacitación',  'BookOpen',     '#6366F1', true, 7),
  ('Alimentación',  'Coffee',       '#D97706', true, 8),
  ('Otros',         'Package',      '#71717A', true, 99)
on conflict (nombre) do nothing;

-- ── Ingresos ──────────────────────────────────────────────
create table public.ingresos (
  id                uuid           primary key default gen_random_uuid(),
  titulo            text           not null,
  descripcion       text,
  monto             numeric(12, 2) not null check (monto > 0),
  categoria_id      uuid           references public.ingreso_categorias(id) on delete set null,
  client_service_id uuid           references public.client_services(id) on delete set null,
  fecha             timestamptz    not null default now(),
  created_at        timestamptz    not null default now()
);

alter table public.ingresos enable row level security;

create policy "admin_all_ingresos" on public.ingresos
  for all to authenticated
  using   (exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin'));

-- ── Gastos ────────────────────────────────────────────────
create table public.gastos (
  id           uuid           primary key default gen_random_uuid(),
  titulo       text           not null,
  descripcion  text,
  monto        numeric(12, 2) not null check (monto > 0),
  categoria_id uuid           references public.gasto_categorias(id) on delete set null,
  fecha        timestamptz    not null default now(),
  created_at   timestamptz    not null default now()
);

alter table public.gastos enable row level security;

create policy "admin_all_gastos" on public.gastos
  for all to authenticated
  using   (exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin'));
