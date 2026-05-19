import Image from 'next/image'
import Link from 'next/link'

const navLinks = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Contacto', href: '#contacto' },
]

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com/axendora' },
  { label: 'Facebook', href: 'https://facebook.com/axendora' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <Image
              src="/logo_letras_blancas.png"
              alt="Axendora"
              width={140}
              height={46}
              className="h-8 w-auto"
            />
            <p className="max-w-xs text-sm text-muted-foreground">
              Agencia de marketing digital comprometida con el crecimiento de tu marca.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Navegación</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Síguenos</h4>
            <div className="flex flex-col gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {s.label}
                </a>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">axendora@gmail.com</p>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Axendora. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
