
-- ============================================================
-- Migración 004: Campos CRM adicionales en profiles
-- Añade información de empresa, contacto y notas internas
-- ============================================================

alter table public.profiles
  add column if not exists telefono        text,
  add column if not exists empresa         text,
  add column if not exists sector          text,
  add column if not exists website         text,
  add column if not exists ciudad          text,
  add column if not exists pais            text default 'Venezuela',
  add column if not exists notas_internas  text;

-- Los clientes pueden leer y actualizar su propio perfil (excepto notas_internas y role)
-- El admin ya tiene acceso completo via is_admin() SECURITY DEFINER (migración 003)

-- Policy: cliente puede leer su propio perfil
create policy "client_select_own_profile"
  on public.profiles for select
  using (auth.uid() = user_id);

-- Policy: cliente puede actualizar sus propios campos (no role, no notas_internas)
create policy "client_update_own_profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
