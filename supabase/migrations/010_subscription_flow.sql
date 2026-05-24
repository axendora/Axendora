-- ============================================================
-- Migración 010: flujo solicitud → activación
-- (idempotente: seguro de correr varias veces)
-- ============================================================

-- 1. plans: duración por defecto para activación
alter table public.plans
  add column if not exists duracion_dias integer;

-- 2. solicitudes: nuevos estados aprobada/rechazada + motivo
alter table public.solicitudes drop constraint if exists solicitudes_estado_check;
alter table public.solicitudes add constraint solicitudes_estado_check
  check (estado in ('abierta', 'en_proceso', 'resuelta', 'cerrada', 'aprobada', 'rechazada'));

alter table public.solicitudes
  add column if not exists motivo_rechazo text;

-- 3. client_services: soporte para plan_id directo (suscripciones basadas en plan)
alter table public.client_services
  add column if not exists plan_id uuid references public.plans(id) on delete set null;

alter table public.client_services
  alter column service_id drop not null;

alter table public.client_services
  drop constraint if exists client_services_has_subject;
alter table public.client_services
  add constraint client_services_has_subject
  check (service_id is not null or plan_id is not null);
