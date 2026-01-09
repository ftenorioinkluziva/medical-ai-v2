'use client'

/**
 * Credit Badge Component
 * Displays user's current credit balance in the navigation header
 */

import { Coins } from 'lucide-react'
import Link from 'next/link'
import { useCredits } from '@/hooks/use-credits'

export function CreditBadge() {
  const { balance, loading } = useCredits()

  if (loading && balance === null) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50">
        <Coins className="h-3.5 w-3.5 text-muted-foreground animate-pulse" />
        <span className="text-xs font-medium text-muted-foreground">...</span>
      </div>
    )
  }

  const isLow = balance !== null && balance < 50

  return (
    <Link
      href="/dashboard/credits"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
      title="Gerenciar créditos"
    >
      <Coins className={`h-3.5 w-3.5 ${isLow ? 'text-orange-600 dark:text-orange-400' : 'text-primary'}`} />
      <span className={`text-xs font-semibold ${isLow ? 'text-orange-600 dark:text-orange-400' : 'text-primary'}`}>
        {balance?.toLocaleString('pt-BR') || '0'}
      </span>
    </Link>
  )
}
