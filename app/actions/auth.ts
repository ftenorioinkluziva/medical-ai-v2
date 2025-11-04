'use server'

/**
 * Server Actions for Authentication
 */

import { signOut } from '@/lib/auth/config'

export async function handleSignOut() {
  await signOut()
}
