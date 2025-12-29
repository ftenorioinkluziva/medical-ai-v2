import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { CreditStatsCards } from '@/components/admin/credit-stats-cards'
import { UserCreditsTable } from '@/components/admin/user-credits-table'
import { PricingConfig } from '@/components/admin/pricing-config'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="pricing">Precificação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <CreditStatsCards />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserCreditsTable />
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <PricingConfig />
        </TabsContent>
      </Tabs>
    </div>
  )
}
