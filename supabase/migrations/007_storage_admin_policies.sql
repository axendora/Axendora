-- Migration 007: admin upload/update/delete policies for service-images bucket

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects'
      and policyname = 'admin_can_upload_service_images'
  ) then
    execute $policy$
      create policy "admin_can_upload_service_images"
        on storage.objects for insert
        with check (
          bucket_id = 'service-images'
          and exists (
            select 1 from public.profiles
            where id = auth.uid()
            and role = 'admin'
          )
        )
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects'
      and policyname = 'admin_can_update_service_images'
  ) then
    execute $policy$
      create policy "admin_can_update_service_images"
        on storage.objects for update
        using (
          bucket_id = 'service-images'
          and exists (
            select 1 from public.profiles
            where id = auth.uid()
            and role = 'admin'
          )
        )
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects'
      and policyname = 'admin_can_delete_service_images'
  ) then
    execute $policy$
      create policy "admin_can_delete_service_images"
        on storage.objects for delete
        using (
          bucket_id = 'service-images'
          and exists (
            select 1 from public.profiles
            where id = auth.uid()
            and role = 'admin'
          )
        )
    $policy$;
  end if;
end
$$;
