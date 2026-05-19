-- ============================================================
-- Migración 003: Políticas RLS para el panel de administración
-- Usa SECURITY DEFINER para evitar referencia circular en profiles
-- ============================================================

-- Función helper: devuelve true si el usuario actual es admin
-- SECURITY DEFINER = se ejecuta como el dueño de la función (postgres),
-- saltando RLS al consultar profiles internamente.
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  )
$$ language sql security definer stable;

-- ── PROFILES ──────────────────────────────────────────────────
-- Admin puede leer todos los perfiles
create policy "admin_select_profiles"
  on public.profiles for select
  using (is_admin());

-- Admin puede actualizar cualquier perfil (incluyendo el campo role)
create policy "admin_update_profiles"
  on public.profiles for update
  using (is_admin())
  with check (is_admin());

-- ── CLIENT_SERVICES ───────────────────────────────────────────
create policy "admin_select_client_services"
  on public.client_services for select
  using (is_admin());

create policy "admin_insert_client_services"
  on public.client_services for insert
  with check (is_admin());

create policy "admin_update_client_services"
  on public.client_services for update
  using (is_admin())
  with check (is_admin());

-- ── SOLICITUDES ───────────────────────────────────────────────
create policy "admin_select_solicitudes"
  on public.solicitudes for select
  using (is_admin());

create policy "admin_update_solicitudes"
  on public.solicitudes for update
  using (is_admin())
  with check (is_admin());

-- ── SERVICES (catálogo) ────────────────────────────────────────
-- Admin ve todos los servicios (activos e inactivos) y puede modificarlos
create policy "admin_all_services"
  on public.services for all
  using (is_admin())
  with check (is_admin());
