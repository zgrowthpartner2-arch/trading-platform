import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Protected routes
  const protectedPaths = ['/dashboard', '/admin']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  // Auth routes (redirect if logged in)
  const authPaths = ['/login', '/register']
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))

  // Redirect to login if accessing protected route without token
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing auth routes with token
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register']
}
