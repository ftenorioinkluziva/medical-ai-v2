'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function CreditBalanceCard() {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBalance()
  }, [])

  async function fetchBalance() {
    try {
      const res = await fetch('/api/credits/balance')
      const data = await res.json()
      setBalance(data.balance)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Créditos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  const lowBalance = balance !== null && balance < 50

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Créditos Disponíveis
        </CardTitle>
        <CardDescription>Saldo atual da sua conta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-4xl font-bold">{balance ?? 0}</div>

        {lowBalance && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Saldo baixo. Adicione mais créditos para continuar usando análises.
            </AlertDescription>
          </Alert>
        )}

        <Button className="w-full" asChild>
          <a href="/dashboard/credits">Adicionar Créditos</a>
        </Button>
      </CardContent>
    </Card>
  )
}
