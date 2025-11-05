import { requireAuth } from '@/lib/auth/session'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth/config'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav
        userName={session.user?.name || ''}
        userRole={session.user?.role || 'patient'}
      />
      <main>{children}</main>
    </div>
  )
}
