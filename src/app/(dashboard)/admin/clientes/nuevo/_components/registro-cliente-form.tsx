'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import {
  User, Mail, Lock, Phone, Building2, Globe, MapPin, FileText,
  CheckCircle2, ArrowLeft, UserPlus, Copy, Check, ExternalLink, MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { COUNTRY_CODES, COUNTRIES, waLink } from '@/lib/countries'
import { registrarClienteAction, type RegistrarClienteResult } from '../actions'

const INPUT =
  'w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20'

const SELECT =
  'rounded-lg border border-border bg-background py-2.5 px-3 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20'

function SectionHeader({ num, title, sub }: { num: number; title: string; sub?: string }) {
  return (
    <div className="border-b border-border bg-muted/30 px-6 py-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
          {num}
        </div>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {sub && <p className="mt-0.5 pl-9 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function Field({
  label, name, type = 'text', placeholder, icon: Icon, required, hint,
}: {
  label: string; name: string; type?: string; placeholder?: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  required?: boolean; hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <div className="relative">
        <Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input id={name} name={name} type={type} placeholder={placeholder}
          className={cn(INPUT, 'pl-9')} />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className={cn(buttonVariants({ size: 'lg' }), 'w-full gap-2 font-semibold', pending && 'opacity-70')}>
      <UserPlus size={18} />
      {pending ? 'Registrando cliente...' : 'Registrar cliente'}
    </button>
  )
}

// ── Success card ───────────────────────────────────────────────────────────────

function SuccessCard({ cliente }: { cliente: Extract<RegistrarClienteResult, { ok: true }>['cliente'] }) {
  const [copied, setCopied] = useState(false)

  function copyId() {
    navigator.clipboard.writeText(cliente.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const infoFields = [
    { label: 'Email',        value: cliente.email,    icon: Mail },
    { label: 'Teléfono',     value: cliente.telefono, icon: Phone },
    { label: 'WhatsApp',     value: cliente.whatsapp, icon: MessageCircle },
    { label: 'Empresa',      value: cliente.empresa,  icon: Building2 },
    { label: 'Sector',       value: cliente.sector,   icon: FileText },
    { label: 'Sitio web',    value: cliente.website,  icon: Globe },
    { label: 'Ciudad',       value: cliente.ciudad,   icon: MapPin },
    { label: 'País',         value: cliente.pais,     icon: MapPin },
  ].filter((f) => f.value)

  return (
    <div className="mx-auto max-w-xl">
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

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-base font-bold text-primary">
            {cliente.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold">{cliente.nombre}</p>
            {cliente.empresa && <p className="text-xs text-muted-foreground">{cliente.empresa}</p>}
          </div>
          <div className="ml-auto flex gap-2">
            {cliente.whatsapp && (
              <a href={waLink(cliente.whatsapp)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-[#25D366]/40 bg-[#25D366]/10 px-2.5 py-1.5 text-xs text-[#25D366] hover:bg-[#25D366]/20 transition-colors">
                <MessageCircle size={12} /> WhatsApp
              </a>
            )}
            {cliente.telefono && (
              <a href={`tel:${cliente.telefono}`}
                className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs text-primary hover:bg-primary/20 transition-colors">
                <Phone size={12} /> Llamar
              </a>
            )}
            <button onClick={copyId}
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
              {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
              {copied ? 'Copiado' : 'ID'}
            </button>
          </div>
        </div>

        {infoFields.length > 0 && (
          <div className="grid gap-px bg-border sm:grid-cols-2">
            {infoFields.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3 bg-card px-5 py-3.5">
                <Icon size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-0.5 truncate text-sm font-medium">
                    {label === 'Sitio web' ? (
                      <a href={value!.startsWith('http') ? value! : `https://${value}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline">
                        {value} <ExternalLink size={10} />
                      </a>
                    ) : label === 'WhatsApp' ? (
                      <a href={waLink(value!)} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#25D366] hover:underline">
                        {value} <ExternalLink size={10} />
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

        {cliente.notas_internas && (
          <div className="border-t border-border px-5 py-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Notas internas</p>
            <p className="whitespace-pre-wrap text-sm text-foreground/80">{cliente.notas_internas}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href={`/admin/clientes/${cliente.id}`} className={cn(buttonVariants(), 'flex-1 justify-center gap-2')}>
          Ver perfil completo
        </Link>
        <Link href="/admin/clientes/nuevo" className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 justify-center gap-2')}>
          <UserPlus size={16} /> Registrar otro cliente
        </Link>
      </div>
    </div>
  )
}

// ── Main form ──────────────────────────────────────────────────────────────────

export function RegistroClienteForm() {
  const [state, action] = useActionState<RegistrarClienteResult | null, FormData>(
    registrarClienteAction, null,
  )

  if (state?.ok) return <SuccessCard cliente={state.cliente} />

  return (
    <div className="mx-auto max-w-2xl">
      <form action={action} className="space-y-6">
        {state && !state.ok && (
          <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            {state.error}
          </div>
        )}

        {/* 1 · Datos de acceso */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <SectionHeader num={1} title="Datos de acceso" sub="Credenciales con las que el cliente iniciará sesión." />
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Nombre completo" name="nombre" placeholder="Ej: María García López" icon={User} required />
            </div>
            <Field label="Correo electrónico" name="email" type="email" placeholder="cliente@empresa.com" icon={Mail} required />
            <Field label="Contraseña inicial" name="password" type="password" placeholder="Mín. 8 caracteres" icon={Lock} required hint="El cliente podrá cambiarla al iniciar sesión." />
          </div>
        </div>

        {/* 2 · Contacto */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <SectionHeader num={2} title="Datos de contacto" />
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            {/* Teléfono de llamada */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Teléfono (llamadas)</label>
              <div className="relative">
                <Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input name="telefono" type="tel" placeholder="+57 300 000 0000"
                  className={cn(INPUT, 'pl-9')} />
              </div>
              <p className="text-xs text-muted-foreground">Para llamar directamente al cliente.</p>
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                <MessageCircle size={12} className="mr-1 inline text-[#25D366]" />
                WhatsApp
              </label>
              <div className="flex gap-2">
                <select name="whatsapp_codigo" defaultValue="+57"
                  className={cn(SELECT, 'w-36 shrink-0')}>
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input name="whatsapp_numero" type="tel" placeholder="300 000 0000"
                  className={cn(INPUT)} />
              </div>
              <p className="text-xs text-muted-foreground">Se usará para abrir WhatsApp directamente.</p>
            </div>
          </div>
        </div>

        {/* 3 · Empresa */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <SectionHeader num={3} title="Empresa / Negocio" sub="Información del negocio al que representa." />
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <Field label="Nombre de empresa" name="empresa" placeholder="Distribuidora García C.A." icon={Building2} />
            <Field label="Sector / Industria" name="sector" placeholder="Gastronomía, Moda, Tecnología..." icon={FileText} />
            <div className="sm:col-span-2">
              <Field label="Sitio web" name="website" placeholder="https://mipagina.com" icon={Globe} />
            </div>
          </div>
        </div>

        {/* 4 · Ubicación */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <SectionHeader num={4} title="Ubicación" />
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Ciudad</label>
              <div className="relative">
                <MapPin size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input name="ciudad" type="text" placeholder="Bogotá, Medellín..." className={cn(INPUT, 'pl-9')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">País</label>
              <select name="pais" defaultValue="Colombia" className={cn(SELECT, 'w-full')}>
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.flag} {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 5 · Notas internas */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <SectionHeader num={5} title="Notas internas" sub="Solo visibles para el equipo de Axendora." />
          <div className="p-6">
            <textarea name="notas_internas" rows={3}
              placeholder="Acuerdos comerciales, contexto de la cuenta, observaciones del proceso de cierre..."
              className={cn(INPUT, 'resize-none')} />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <div className="flex-1"><SubmitButton /></div>
          <Link href="/admin/clientes" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'gap-2 sm:w-auto')}>
            <ArrowLeft size={16} /> Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
