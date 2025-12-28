import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { CreditStatsCards } from '@/components/admin/credit-stats-cards'
import { UserCreditsTable } from '@/components/admin/user-credits-table'

export default async function AdminCreditsPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Créditos</h1>
        <p className="text-muted-foreground">
          Monitoramento e controle do sistema de billing
        </p>
      </div>

      <CreditStatsCards />
      <UserCreditsTable />
    </div>
  )
}
