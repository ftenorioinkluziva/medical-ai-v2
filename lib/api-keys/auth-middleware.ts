/**
 * Authentication Middleware
 * Supports both session cookies and API keys
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'
import { validateApiKey } from './generate'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type AuthResult = {
  authenticated: boolean
  user?: {
    id: string
    email: string
    name: string | null
    role: string
  }
  authMethod?: 'session' | 'api-key'
  error?: string
}

/**
 * Authenticate a request using either session cookie or API key
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  // Try API Key first (Authorization header)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const apiKey = authHeader.substring(7)

    console.log('🔑 [AUTH] Attempting API key authentication...')

    const validation = await validateApiKey(apiKey)

    if (!validation.valid) {
      console.log(`❌ [AUTH] API key invalid: ${validation.error}`)
      return {
        authenticated: false,
        error: validation.error || 'API key inválida',
      }
    }

    // Get user details
    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, validation.userId!))
      .limit(1)

    if (!userResult || userResult.length === 0) {
      console.log('❌ [AUTH] User not found for API key')
      return {
        authenticated: false,
        error: 'Usuário não encontrado',
      }
    }

    const user = userResult[0]

    console.log(`✅ [AUTH] API key authenticated: ${user.email} (${user.role})`)

    return {
      authenticated: true,
      user,
      authMethod: 'api-key',
    }
  }

  // Fall back to session authentication
  console.log('🍪 [AUTH] Attempting session authentication...')

  const session = await auth()

  if (!session?.user?.id) {
    console.log('❌ [AUTH] No session found')
    return {
      authenticated: false,
      error: 'Não autenticado',
    }
  }

  console.log(`✅ [AUTH] Session authenticated: ${session.user.email} (${session.user.role})`)

  return {
    authenticated: true,
    user: {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name!,
      role: session.user.role,
    },
    authMethod: 'session',
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(authResult: AuthResult): boolean {
  return authResult.authenticated && authResult.user?.role === 'admin'
}
