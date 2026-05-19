import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <Link href="/">
          <Image
            src="/logo_letras_blancas.png"
            alt="Axendora"
            width={160}
            height={52}
            priority
            className="h-10 w-auto"
          />
        </Link>
      </div>
      {children}
    </div>
  )
}
