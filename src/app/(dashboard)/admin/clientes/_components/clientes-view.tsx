'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutGrid, List, Phone, ChevronRight,
  Building2, MapPin, Pencil, Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { waLink } from '@/lib/countries'
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon'
import { EditClienteModal, type ClienteEditable } from './edit-cliente-modal'
import { DeleteClienteModal } from './delete-cliente-modal'

export interface ClienteRow {
  id: string
  user_id: string
  nombre: string
  email: string
  telefono: string | null
  whatsapp: string | null
  empresa: string | null
  sector: string | null
  ciudad: string | null
  pais: string | null
  notas_internas: string | null
  website: string | null
  created_at: string
}

interface Props {
  clientes: ClienteRow[]
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

// ── Action buttons ─────────────────────────────────────────────────────────────

function ContactBtns({ cliente }: { cliente: ClienteRow }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {cliente.whatsapp && (
        <a
          href={waLink(cliente.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          title={`WhatsApp: ${cliente.whatsapp}`}
          onClick={(e) => e.stopPropagation()}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366] transition-colors hover:bg-[#25D366]/25"
        >
          <WhatsAppIcon size={14} />
        </a>
      )}
      {cliente.telefono && (
        <a
          href={`tel:${cliente.telefono}`}
          title={`Llamar: ${cliente.telefono}`}
          onClick={(e) => e.stopPropagation()}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition-colors hover:bg-primary/25"
        >
          <Phone size={14} />
        </a>
      )}
    </div>
  )
}

// ── List view ──────────────────────────────────────────────────────────────────

function ListView({
  clientes,
  onEdit,
  onDelete,
}: {
  clientes: ClienteRow[]
  onEdit: (c: ClienteRow) => void
  onDelete: (c: ClienteRow) => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card divide-y divide-border">
      {clientes.map((c) => (
        <div key={c.id} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/20">
          {/* Avatar + info */}
          <Link href={`/admin/clientes/${c.user_id}`} className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {c.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{c.nombre}</p>
              <p className="truncate text-xs text-muted-foreground">{c.email}</p>
            </div>
          </Link>

          {/* Empresa / ciudad — tablet+ */}
          <div className="hidden min-w-0 w-48 flex-col md:flex">
            {c.empresa && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 size={10} className="shrink-0" />
                <span className="truncate">{c.empresa}</span>
              </div>
            )}
            {c.ciudad && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">{c.ciudad}{c.pais ? `, ${c.pais}` : ''}</span>
              </div>
            )}
          </div>

          {/* Fecha — desktop */}
          <p className="hidden w-28 shrink-0 text-right text-xs text-muted-foreground lg:block">
            {formatDate(c.created_at)}
          </p>

          {/* Buttons */}
          <div className="flex shrink-0 items-center gap-1.5">
            <ContactBtns cliente={c} />
            <button onClick={() => onEdit(c)}
              title="Editar"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
              <Pencil size={13} />
            </button>
            <button onClick={() => onDelete(c)}
              title="Eliminar"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-error/40 hover:text-error">
              <Trash2 size={13} />
            </button>
            <Link href={`/admin/clientes/${c.user_id}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Grid view ──────────────────────────────────────────────────────────────────

function GridView({
  clientes,
  onEdit,
  onDelete,
}: {
  clientes: ClienteRow[]
  onEdit: (c: ClienteRow) => void
  onDelete: (c: ClienteRow) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {clientes.map((c) => (
        <div key={c.id} className="group flex flex-col rounded-2xl border border-border bg-card transition-colors hover:border-primary/30">
          {/* Card header */}
          <Link href={`/admin/clientes/${c.user_id}`} className="flex items-start gap-3 p-4 pb-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-bold text-primary">
              {c.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">{c.nombre}</p>
              <p className="truncate text-xs text-muted-foreground">{c.email}</p>
              {c.empresa && (
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 size={10} className="shrink-0" />
                  <span className="truncate">{c.empresa}</span>
                </div>
              )}
            </div>
          </Link>

          {/* Details */}
          <div className="border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground space-y-1">
            {c.sector && <p className="truncate">{c.sector}</p>}
            {(c.ciudad || c.pais) && (
              <div className="flex items-center gap-1">
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">{[c.ciudad, c.pais].filter(Boolean).join(', ')}</span>
              </div>
            )}
            <p className="text-muted-foreground/60">Cliente desde {formatDate(c.created_at)}</p>
          </div>

          {/* Actions */}
          <div className="mt-auto flex items-center gap-1.5 border-t border-border/60 px-4 py-3">
            <ContactBtns cliente={c} />
            <div className="ml-auto flex items-center gap-1.5">
              <button onClick={() => onEdit(c)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                <Pencil size={13} />
              </button>
              <button onClick={() => onDelete(c)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-error/40 hover:text-error">
                <Trash2 size={13} />
              </button>
              <Link href={`/admin/clientes/${c.user_id}`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-8 gap-1 px-2 text-xs')}>
                Ver <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ClientesView({ clientes }: Props) {
  const router = useRouter()
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [editTarget, setEditTarget] = useState<ClienteRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ClienteRow | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function openEdit(c: ClienteRow) {
    setEditTarget(c)
    setEditOpen(true)
  }

  function openDelete(c: ClienteRow) {
    setDeleteTarget(c)
    setDeleteOpen(true)
  }

  function handleSuccess() {
    router.refresh()
  }

  const clienteEditable: ClienteEditable | null = editTarget
    ? {
        user_id:        editTarget.user_id,
        nombre:         editTarget.nombre,
        email:          editTarget.email,
        telefono:       editTarget.telefono,
        whatsapp:       editTarget.whatsapp,
        empresa:        editTarget.empresa,
        sector:         editTarget.sector,
        website:        editTarget.website,
        ciudad:         editTarget.ciudad,
        pais:           editTarget.pais,
        notas_internas: editTarget.notas_internas,
      }
    : null

  return (
    <>
      {/* Toggle */}
      <div className="flex justify-end">
        <div className="flex rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setView('list')}
            className={cn(
              'flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors',
              view === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <List size={13} /> Lista
          </button>
          <button
            onClick={() => setView('grid')}
            className={cn(
              'flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors',
              view === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LayoutGrid size={13} /> Tarjetas
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <ListView clientes={clientes} onEdit={openEdit} onDelete={openDelete} />
      ) : (
        <GridView clientes={clientes} onEdit={openEdit} onDelete={openDelete} />
      )}

      {/* Modals */}
      <EditClienteModal
        cliente={clienteEditable}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={handleSuccess}
      />
      <DeleteClienteModal
        cliente={deleteTarget}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}
