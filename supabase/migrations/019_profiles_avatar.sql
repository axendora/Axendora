-- Agregar campo avatar_url a profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Bucket público para avatares de usuarios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,  -- 2 MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Cualquiera puede leer avatares (bucket público)
CREATE POLICY "avatars_public_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Cada usuario sólo puede subir/actualizar/borrar su propia carpeta
CREATE POLICY "avatars_user_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_user_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_user_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
