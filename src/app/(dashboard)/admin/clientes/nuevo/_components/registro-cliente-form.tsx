'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import {
  User, Mail, Lock, Phone, Building2, Globe, MapPin, FileText,
  CheckCircle2, ArrowLeft, UserPlus, Copy, Check, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { registrarClienteAction, type RegistrarClienteResult } from '../actions'

// ── Subcomponents ─────────────────────────────────────────────────────────────

function Field({
  label, name, type = 'text', placeholder, icon: Icon, required, hint,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  required?: boolean
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <div className="relative">
        <Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        buttonVariants({ size: 'lg' }),
        'w-full gap-2 font-semibold transition-all',
        pending && 'opacity-70',
      )}
    >
      <UserPlus size={18} />
      {pending ? 'Registrando cliente...' : 'Registrar cliente'}
    </button>
  )
}

// ── Success card ───────────────────────────────────────────────────────────────

function SuccessCard({ cliente }: { cliente: NonNullable<Extract<RegistrarClienteResult, { ok: true }>['cliente']> }) {
  const [copied, setCopied] = useState(false)

  function copyId() {
    navigator.clipboard.writeText(cliente.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fields = [
    { label: 'Email', value: cliente.email, icon: Mail },
    { label: 'Teléfono', value: cliente.telefono, icon: Phone },
    { label: 'Empresa', value: cliente.empresa, icon: Building2 },
    { label: 'Sector', value: cliente.sector, icon: FileText },
    { label: 'Sitio web', value: cliente.website, icon: Globe },
    { label: 'Ciudad', value: cliente.ciudad, icon: MapPin },
    { label: 'País', value: cliente.pais, icon: MapPin },
  ].filter((f) => f.value)

  return (
    <div className="mx-auto max-w-xl">
      {/* Banner de éxito */}
      <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl border border-success/30 bg-success/5 px-6 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 size={36} className="text-success" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-success">Cliente registrado</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold">{cliente.nombre}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{cliente.email}</p>
        </div>
      </div>

      {/* Tarjeta de datos */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Header de la tarjeta */}
        <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-base font-bold text-primary">
            {cliente.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold">{cliente.nombre}</p>
            {cliente.empresa && (
              <p className="text-xs text-muted-foreground">{cliente.empresa}</p>
            )}
          </div>
          <button
            onClick={copyId}
            title="Copiar ID"
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
            {copied ? 'Copiado' : 'Copiar ID'}
          </button>
        </div>

        {/* Grid de datos */}
        {fields.length > 0 && (
          <div className="grid gap-px bg-border sm:grid-cols-2">
            {fields.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3 bg-card px-5 py-3.5">
                <Icon size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-0.5 truncate text-sm font-medium">
                    {label === 'Sitio web' ? (
                      <a
                        href={value!.startsWith('http') ? value! : `https://${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {value}
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      value
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notas internas */}
        {cliente.notas_internas && (
          <div className="border-t border-border px-5 py-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Notas internas</p>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{cliente.notas_internas}</p>
          </div>
        )}
      </div>

      {/* Acciones post-registro */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/admin/clientes/${cliente.id}`}
          className={cn(buttonVariants(), 'flex-1 gap-2 justify-center')}
        >
          Ver perfil completo
        </Link>
        <Link
          href="/admin/clientes/nuevo"
          className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 gap-2 justify-center')}
        >
          <UserPlus size={16} />
          Registrar otro cliente
        </Link>
      </div>
    </div>
  )
}

// ── Main form ──────────────────────────────────────────────────────────────────

export function RegistroClienteForm() {
  const [state, action] = useActionState<RegistrarClienteResult | null, FormData>(
    registrarClienteAction,
    null,
  )

  if (state?.ok) {
    return <SuccessCard cliente={state.cliente} />
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form action={action} className="space-y-8">
        {state && !state.ok && (
          <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            {state.error}
          </div>
        )}

        {/* Sección 1: Datos de acceso */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">1</div>
              <h2 className="text-sm font-semibold">Datos de acceso</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground pl-9.5">Credenciales con las que el cliente iniciará sesión.</p>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Nombre completo" name="nombre" placeholder="Ej: María García López" icon={User} required />
            </div>
            <Field label="Correo electrónico" name="email" type="email" placeholder="cliente@empresa.com" icon={Mail} required />
            <Field
              label="Contraseña inicial"
              name="password"
              type="password"
              placeholder="Mín. 8 caracteres"
              icon={Lock}
              required
              hint="El cliente podrá cambiarla al iniciar sesión."
            />
          </div>
        </div>

        {/* Sección 2: Empresa / Negocio */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">2</div>
              <h2 className="text-sm font-semibold">Empresa / Negocio</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground pl-9.5">Información del negocio al que representan.</p>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <Field label="Nombre de empresa" name="empresa" placeholder="Ej: Distribuidora Pérez C.A." icon={Building2} />
            <Field label="Sector / Industria" name="sector" placeholder="Ej: Gastronomía, Moda, Tecnología" icon={FileText} />
            <div className="sm:col-span-2">
              <Field label="Sitio web" name="website" placeholder="https://mipagina.com" icon={Globe} />
            </div>
          </div>
        </div>

        {/* Sección 3: Contacto */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">3</div>
              <h2 className="text-sm font-semibold">Datos de contacto</h2>
            </div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-3">
            <Field label="Teléfono / WhatsApp" name="telefono" placeholder="+58 412 0000000" icon={Phone} />
            <Field label="Ciudad" name="ciudad" placeholder="Ej: Caracas" icon={MapPin} />
            <Field label="País" name="pais" placeholder="Venezuela" icon={MapPin} />
          </div>
        </div>

        {/* Sección 4: Notas internas */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">4</div>
              <h2 className="text-sm font-semibold">Notas internas</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground pl-9.5">Solo visibles para el equipo de Axendora.</p>
          </div>
          <div className="p-6">
            <textarea
              name="notas_internas"
              rows={3}
              placeholder="Acuerdos comerciales, contexto de la cuenta, observaciones del proceso de cierre..."
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <div className="flex-1">
            <SubmitButton />
          </div>
          <Link
            href="/admin/clientes"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'gap-2 sm:w-auto')}
          >
            <ArrowLeft size={16} />
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
