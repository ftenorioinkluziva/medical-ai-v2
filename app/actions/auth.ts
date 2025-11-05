'use server'

/**
 * Server Actions for Authentication
 */

import { signOut } from '@/lib/auth/config'
import { redirect } from 'next/navigation'

export async function handleSignOut() {
  await signOut({ redirect: false })
  redirect('/login')
}
