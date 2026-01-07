import { requirePermission } from '@/lib/auth/session'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { getCurrentUser } from '@/lib/auth/session'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  await requirePermission('manage_agents')

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav
        userName={user?.name || ''}
        userRole={user?.role || 'patient'}
      />
      <main>{children}</main>
    </div>
  )
}
