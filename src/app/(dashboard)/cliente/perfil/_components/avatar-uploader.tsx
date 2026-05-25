'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Props {
  userId: string
  currentUrl: string | null
  nombre: string
}

const ACCEPT = 'image/png,image/jpeg,image/webp'
const MAX_BYTES = 2 * 1024 * 1024 // 2 MB

export function AvatarUploader({ userId, currentUrl, nombre }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Solo se permiten archivos PNG, JPG o WebP.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('El archivo supera el límite de 2 MB.')
      return
    }

    // Preview inmediato
    setPreview(URL.createObjectURL(file))
    setLoading(true)

    try {
      const supabase = createClient()
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
      const path = `${userId}/avatar.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadErr) throw uploadErr

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      // Cache-bust con timestamp
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`

      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userId)

      if (dbErr) throw dbErr

      setPreview(publicUrl)
    } catch {
      setError('No se pudo subir la foto. Intenta nuevamente.')
    } finally {
      setLoading(false)
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const initials = nombre.trim().slice(0, 2).toUpperCase() || '?'

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="group relative h-28 w-28 overflow-hidden rounded-full border-2 border-border bg-primary/10 transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
        aria-label="Cambiar foto de perfil"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Foto de perfil"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary">
            {nombre ? initials : <User size={40} className="text-primary/60" />}
          </span>
        )}

        {/* Overlay */}
        <span className={cn(
          'absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity',
          loading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}>
          {loading
            ? <Loader2 size={24} className="animate-spin text-white" />
            : <Camera size={24} className="text-white" />}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleFile}
        aria-hidden="true"
      />

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Haz clic para cambiar tu foto
        </p>
        <p className="text-[11px] text-muted-foreground/60">
          PNG, JPG o WebP · máx. 2 MB · recomendado 500×500 px
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
