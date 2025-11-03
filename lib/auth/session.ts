/**
 * Server-side session utilities
 */

import { auth } from './config'
import { getUserRole, hasPermission, type Permission } from './rbac'
import { redirect } from 'next/navigation'

/**
 * Get current session (server-side)
 */
export async function getSession() {
  return await auth()
}

/**
 * Get current user (server-side)
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return session
}

/**
 * Require specific permission - redirect to login if not authorized
 */
export async function requirePermission(permission: Permission) {
  const session = await requireAuth()
  const role = getUserRole(session)

  if (!hasPermission(role, permission)) {
    redirect('/unauthorized')
  }

  return session
}

/**
 * Check if user is authenticated (returns boolean)
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return !!session
}

/**
 * Check if user has permission (returns boolean)
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const session = await getSession()
  if (!session) return false

  const role = getUserRole(session)
  return hasPermission(role, permission)
}
