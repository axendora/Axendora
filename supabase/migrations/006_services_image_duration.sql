-- Migration 006: service images + duration, client_services with time precision

-- ── services catalog ───────────────────────────────────────────────────────────
alter table public.services
  add column if not exists imagen_url    text,
  add column if not exists duracion_dias integer;

-- ── client_services: date → timestamptz (keeps hour precision) ────────────────
alter table public.client_services
  alter column fecha_inicio type timestamptz using fecha_inicio::timestamptz,
  alter column fecha_fin    type timestamptz using fecha_fin::timestamptz;

-- ── Storage bucket for service images (public read) ───────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'service-images',
  'service-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public read policy (anyone can view service images)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects'
      and policyname = 'service_images_public_read'
  ) then
    execute $policy$
      create policy "service_images_public_read"
        on storage.objects for select
        using (bucket_id = 'service-images')
    $policy$;
  end if;
end
$$;
