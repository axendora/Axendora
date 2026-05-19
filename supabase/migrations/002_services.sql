-- ============================================================
-- Migración 002: services + client_services + solicitudes
-- ============================================================

-- Catálogo de servicios de Axendora
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  descripcion text,
  icono       text,
  activo      boolean not null default true,
  created_at  timestamptz default now() not null
);

-- Servicios contratados por cada cliente
create table if not exists public.client_services (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references auth.users(id) on delete cascade not null,
  service_id   uuid references public.services(id) on delete restrict not null,
  estado       text not null default 'en_configuracion'
               check (estado in ('en_configuracion', 'activo', 'pausado', 'finalizado')),
  fecha_inicio date,
  fecha_fin    date,
  notas        text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- Solicitudes / tickets del cliente
create table if not exists public.solicitudes (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references auth.users(id) on delete cascade not null,
  titulo      text not null,
  descripcion text not null,
  tipo        text not null check (tipo in ('soporte', 'consulta', 'cambio', 'otro')),
  estado      text not null default 'abierta'
              check (estado in ('abierta', 'en_proceso', 'resuelta', 'cerrada')),
  prioridad   text not null default 'media'
              check (prioridad in ('baja', 'media', 'alta')),
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- RLS
alter table public.services enable row level security;
alter table public.client_services enable row level security;
alter table public.solicitudes enable row level security;

-- Catálogo: cualquier usuario autenticado puede leerlo
create policy "services_select_auth"
  on public.services for select
  using (auth.uid() is not null and activo = true);

-- Servicios del cliente: solo el propietario
create policy "client_services_select_own"
  on public.client_services for select
  using (auth.uid() = client_id);

-- Solicitudes: el cliente puede crear y leer las suyas
create policy "solicitudes_select_own"
  on public.solicitudes for select
  using (auth.uid() = client_id);

create policy "solicitudes_insert_own"
  on public.solicitudes for insert
  with check (auth.uid() = client_id);

-- Triggers updated_at (reutiliza la función de migración 001)
create trigger client_services_updated_at
  before update on public.client_services
  for each row execute procedure public.set_updated_at();

create trigger solicitudes_updated_at
  before update on public.solicitudes
  for each row execute procedure public.set_updated_at();

-- Seed: catálogo inicial de servicios
insert into public.services (nombre, descripcion, icono) values
  ('Gestión de Redes Sociales', 'Administración estratégica de tus redes con contenido constante y alineado con tu marca.', 'Share2'),
  ('Campañas en Meta', 'Creación y activación de campañas en Facebook, Instagram y WhatsApp.', 'TrendingUp'),
  ('Diseño Gráfico', 'Identidad visual profesional: piezas para redes, banners y branding.', 'Paintbrush'),
  ('Páginas Web Profesionales', 'Diseño y desarrollo de sitios web modernos y optimizados.', 'Globe'),
  ('Pautas en Redes Sociales', 'Inversión publicitaria inteligente para maximizar tu alcance.', 'BarChart3');
