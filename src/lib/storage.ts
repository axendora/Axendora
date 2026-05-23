import { createClient as createAdminClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Crea un cliente Supabase con service role key (bypasea TODA RLS).
 * Usar SOLO desde server: route handlers y server actions.
 */
export function createStorageAdmin(): SupabaseClient {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

/**
 * Garantiza que el bucket existe. Si no existe, lo crea.
 * Idempotente: si ya existe, no hace nada.
 */
export async function ensureBucket(admin: SupabaseClient, bucketId: string): Promise<void> {
  const { data: existing } = await admin.storage.getBucket(bucketId)
  if (existing) return

  const { error } = await admin.storage.createBucket(bucketId, {
    public: true,
    fileSizeLimit: 5_242_880,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  })

  // Race condition: si otro request lo creó entre el getBucket y el createBucket, ignorar
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`No se pudo crear el bucket "${bucketId}": ${error.message}`)
  }
}

/**
 * Sube una imagen al bucket especificado y devuelve su URL pública.
 * Auto-crea el bucket si no existe. Genera path UUID.
 */
export async function uploadImageToBucket(file: File, bucketId: string): Promise<string> {
  const admin = createStorageAdmin()
  await ensureBucket(admin, bucketId)

  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await admin.storage
    .from(bucketId)
    .upload(path, file, { contentType: file.type, upsert: true })

  if (error) throw new Error(error.message)

  const { data } = admin.storage.from(bucketId).getPublicUrl(path)
  return data.publicUrl
}
