/**
 * Next.js Middleware
 * Handles authentication and route protection
 */

import { auth } from '@/lib/auth/config'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Auth routes (redirect to appropriate dashboard if already authenticated)
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.includes(pathname)

  if (isAuthRoute && isAuthenticated) {
    // Redirect doctors to /doctor, others to /dashboard
    const redirectUrl = req.auth?.user?.role === 'doctor' ? '/doctor' : '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  // Protected routes (require authentication)
  const protectedPrefixes = ['/dashboard', '/agents', '/documents', '/profile', '/history', '/settings', '/admin', '/doctor']
  const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix))

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin routes (require admin role)
  if (pathname.startsWith('/admin')) {
    const userRole = req.auth?.user?.role
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Doctor routes - redirect doctors from /dashboard to /doctor
  if (pathname === '/dashboard' && req.auth?.user?.role === 'doctor') {
    return NextResponse.redirect(new URL('/doctor', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
