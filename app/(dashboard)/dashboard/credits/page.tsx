import { CreditBalanceCard } from '@/components/credits/credit-balance-card'
import { PurchasePackages } from '@/components/credits/purchase-packages'
import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'

export default async function CreditsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Créditos</h1>
        <p className="text-muted-foreground">
          Adicione créditos para realizar análises médicas com IA
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <CreditBalanceCard />
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold">Pacotes Disponíveis</h2>
        <PurchasePackages />
      </div>
    </div>
  )
}
