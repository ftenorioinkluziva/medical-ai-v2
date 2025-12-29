'use client'

/**
 * Credit History Page
 * Professional transaction history with filtering and stats
 */

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Receipt,
  Loader2,
  ShoppingCart,
  Sparkles,
  FileText,
} from 'lucide-react'

interface Transaction {
  id: string
  type: string
  amount: number
  balanceAfter: number
  description: string | null
  createdAt: string
  metadata?: any
}

type FilterType = 'all' | 'purchase' | 'debit'

export default function CreditHistoryPage() {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    try {
      const res = await fetch('/api/credits/history')
      const data = await res.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true
    if (filter === 'purchase') return tx.amount > 0
    if (filter === 'debit') return tx.amount < 0
    return true
  })

  const stats = {
    totalPurchases: transactions.filter((tx) => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0),
    totalDebits: Math.abs(transactions.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0)),
    transactionCount: transactions.length,
  }

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) return <ShoppingCart className="h-4 w-4" />
    return <Sparkles className="h-4 w-4" />
  }

  const getTransactionBadge = (type: string, amount: number) => {
    if (amount > 0) {
      return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Compra</Badge>
    }
    return <Badge variant="secondary">Débito</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando histórico...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/credits">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Histórico de Transações
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe todas as suas compras e débitos de créditos
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Total Comprado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              +{stats.totalPurchases.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Créditos adquiridos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              Total Usado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {stats.totalDebits.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Créditos utilizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Receipt className="h-4 w-4" />
              Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {stats.transactionCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total de movimentações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filtrar Transações
              </CardTitle>
              <CardDescription>
                {filteredTransactions.length} de {transactions.length} transações
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todas
              </Button>
              <Button
                variant={filter === 'purchase' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('purchase')}
              >
                Compras
              </Button>
              <Button
                variant={filter === 'debit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('debit')}
              >
                Débitos
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Detalhes das Transações
          </CardTitle>
          <CardDescription>
            Histórico completo de movimentações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground font-medium">
                {filter === 'all'
                  ? 'Nenhuma transação encontrada'
                  : filter === 'purchase'
                  ? 'Nenhuma compra encontrada'
                  : 'Nenhum débito encontrado'
                }
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {filter !== 'all' ? 'Tente outro filtro ou ' : ''}
                Suas transações aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx, index) => (
                <div
                  key={tx.id}
                  className={`flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
                    index !== filteredTransactions.length - 1 ? 'border-b' : ''
                  }`}
                >
                  {/* Left Side - Icon, Description, Date */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      tx.amount > 0
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {getTransactionIcon(tx.type, tx.amount)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground truncate">
                          {tx.description || 'Transação'}
                        </p>
                        {getTransactionBadge(tx.type, tx.amount)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(tx.createdAt), "dd 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Amount and Balance */}
                  <div className="text-right ml-4">
                    <p className={`text-lg font-bold ${
                      tx.amount > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-foreground'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Saldo: {tx.balanceAfter.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back to Credits Button */}
      <div className="flex justify-center pt-4">
        <Link href="/dashboard/credits">
          <Button variant="outline" size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Créditos
          </Button>
        </Link>
      </div>
    </div>
  )
}
