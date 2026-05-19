-- ============================================================
-- Migración 005: Separar campo whatsapp de telefono en profiles
-- ============================================================

alter table public.profiles
  add column if not exists whatsapp text;
