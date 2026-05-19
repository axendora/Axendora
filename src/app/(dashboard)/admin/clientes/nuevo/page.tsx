import Link from 'next/link'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { RegistroClienteForm } from './_components/registro-cliente-form'

export const metadata = { title: 'Registrar cliente' }

export default function NuevoClientePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/clientes"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'shrink-0 gap-1.5')}
        >
          <ArrowLeft size={15} />
          Volver
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <UserPlus size={20} className="shrink-0 text-primary" />
            <h1 className="font-serif text-2xl font-semibold">Registrar cliente</h1>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Crea una cuenta de acceso y completa el perfil del nuevo cliente.
          </p>
        </div>
      </div>

      <RegistroClienteForm />
    </div>
  )
}
