'use client'

/**
 * Credits Page - Credit Management
 * Clean, professional interface for purchasing and managing credits
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Coins,
  CreditCard,
  History,
  Sparkles,
  Check,
  AlertCircle,
  ArrowRight,
  Loader2,
  Info,
} from 'lucide-react'

import { useCredits } from '@/hooks/use-credits'

interface CreditBalanceStats {
  totalPurchased: number
  totalUsed: number
}

interface Package {
  id: string
  name: string
  credits: number
  priceInCents: number
  displayOrder: number
}

export default function CreditsPage() {
  const { balance: contextBalance, loading: creditsLoading } = useCredits()
  const [balanceStats, setBalanceStats] = useState<CreditBalanceStats | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoadingData(true)
      const [balanceRes, packagesRes] = await Promise.all([
        fetch('/api/credits/balance'),
        fetch('/api/credits/packages'),
      ])

      if (balanceRes.ok) {
        // We only really need totalPurchased and totalUsed from here
        // The actual balance comes from the context
        const balanceData = await balanceRes.json()
        setBalanceStats(balanceData)
      }

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json()
        setPackages(packagesData.packages)
      }
    } catch (error) {
      console.error('Failed to load credits data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  async function handlePurchase(packageId: string) {
    setPurchasing(packageId)

    try {
      const res = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Falha ao iniciar compra. Tente novamente.')
        setPurchasing(null)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Falha ao iniciar compra. Tente novamente.')
      setPurchasing(null)
    }
  }

  // Combine loading states - for the page content, we mainly care about packages
  // The balance might come from context which is separate
  const loading = loadingData || (creditsLoading && contextBalance === null)

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando informações...</p>
          </div>
        </div>
      </div>
    )
  }

  const lowBalance = contextBalance !== null && contextBalance < 50
  const hasBalance = contextBalance !== null && contextBalance > 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Gerenciar Créditos
        </h1>
        <p className="text-muted-foreground mt-1">
          Adicione créditos para realizar análises médicas com inteligência artificial
        </p>
      </div>

      {/* Balance and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Balance Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5 text-primary" />
              Saldo Atual
            </CardTitle>
            <CardDescription>
              Seus créditos disponíveis para análises médicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-foreground">
                {(contextBalance ?? 0).toLocaleString('pt-BR')}
              </span>
              <span className="text-lg text-muted-foreground">créditos</span>
            </div>

            {lowBalance && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Saldo baixo! Adicione mais créditos para continuar usando as análises.
                </AlertDescription>
              </Alert>
            )}

            {hasBalance && !lowBalance && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>Você tem créditos suficientes para ~{Math.floor((contextBalance || 0) / 75)} análises completas</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Total Adquirido</p>
                <p className="text-xl font-semibold text-foreground">
                  {balanceStats?.totalPurchased?.toLocaleString('pt-BR') || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Utilizado</p>
                <p className="text-xl font-semibold text-foreground">
                  {balanceStats?.totalUsed?.toLocaleString('pt-BR') || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-primary" />
              Histórico
            </CardTitle>
            <CardDescription>
              Consulte suas transações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Veja todas as suas compras e débitos de créditos
            </p>
            <Link href="/dashboard/credits/history">
              <Button variant="outline" className="w-full justify-between group">
                Ver Histórico
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* How Credits Work */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-primary" />
            Como Funcionam os Créditos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">1 Crédito = 1.000 Tokens</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cada análise consome créditos baseado no uso da IA
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Débito Automático</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Créditos são debitados após cada operação de IA
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Sem Expiração</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Seus créditos nunca expiram
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Packages */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Pacotes Disponíveis
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {packages.map((pkg, index) => {
            const isPopular = index === 1 // Middle package is popular
            return (
              <Card
                key={pkg.id}
                className={`flex flex-col relative ${isPopular ? 'border-primary shadow-lg' : ''
                  }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Mais Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <CardDescription>
                    {pkg.credits.toLocaleString('pt-BR')} créditos
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div>
                    <span className="text-4xl font-bold text-foreground">
                      R$ {(pkg.priceInCents / 100).toFixed(2)}
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      <span>{pkg.credits.toLocaleString('pt-BR')} créditos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      <span>Créditos não expiram</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      <span>
                        ~{Math.floor(pkg.credits / 75)} análises completas
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      <span>Suporte prioritário</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={purchasing === pkg.id}
                    variant={isPopular ? 'default' : 'outline'}
                  >
                    {purchasing === pkg.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Comprar Agora'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Payment Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Pagamento Seguro via Stripe
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Aceitamos cartões de crédito, débito e PIX. Seus dados são protegidos com criptografia de ponta a ponta.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
