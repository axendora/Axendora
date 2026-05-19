import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const AUTH_ROUTES = ['/login', '/registro', '/recuperar']
const CLIENT_ROUTES = ['/cliente']
const ADMIN_ROUTES = ['/admin']

export async function proxy(request: NextRequest) {
  const { supabase, user, response } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r))
  const isClientRoute = CLIENT_ROUTES.some((r) => pathname.startsWith(r))
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))

  if (isAuthRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const dest = profile?.role === 'admin' ? '/admin' : '/cliente'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  if ((isClientRoute || isAdminRoute) && !user) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/cliente', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
