-- Migration 008: drop admin RLS policies on service-images storage.
-- Uploads now go through /api/admin/service-images using the service role key,
-- which bypasses RLS. Keeping the admin policies caused recurring
-- "new row violates row-level security policy" errors because the
-- subquery against public.profiles was blocked by profiles' own RLS.
-- Public read policy from migration 006 stays in place.

drop policy if exists "admin_can_upload_service_images" on storage.objects;
drop policy if exists "admin_can_update_service_images" on storage.objects;
drop policy if exists "admin_can_delete_service_images" on storage.objects;
