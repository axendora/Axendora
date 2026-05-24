-- ============================================================
-- Migración 011: duracion_dias en client_services
-- Permite separar "aprobar solicitud" de "activar campaña":
--   1. Aprobar  → crea client_service con duracion_dias, sin fechas
--   2. Activar  → setea fecha_inicio=now, fecha_fin=now+duracion_dias
-- (idempotente: seguro de correr varias veces)
-- ============================================================

alter table public.client_services
  add column if not exists duracion_dias integer;
