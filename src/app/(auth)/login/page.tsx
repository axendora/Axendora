import { Suspense } from 'react'
import LoginForm from './_components/login-form'

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-semibold">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Accede a tu panel de Axendora
        </p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
