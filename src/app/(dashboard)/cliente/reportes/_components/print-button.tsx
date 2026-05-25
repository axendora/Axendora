'use client'

import { Printer } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2 print:hidden')}
    >
      <Printer size={14} />
      Imprimir
    </button>
  )
}
