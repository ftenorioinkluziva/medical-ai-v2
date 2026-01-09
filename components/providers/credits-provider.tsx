'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface CreditsContextType {
    balance: number | null
    loading: boolean
    refreshBalance: () => Promise<void>
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined)

export function CreditsProvider({
    children,
    pollingInterval = 30000 // 30 seconds default, much better than 5s
}: {
    children: React.ReactNode
    pollingInterval?: number
}) {
    const [balance, setBalance] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const pathname = usePathname()

    const fetchBalance = useCallback(async (isBackground = false) => {
        if (!isBackground) setLoading(true)
        try {
            const res = await fetch('/api/credits/balance')
            if (res.ok) {
                const data = await res.json()
                setBalance(data.balance)
            }
        } catch (error) {
            console.error('Failed to update credits:', error)
        } finally {
            if (!isBackground) setLoading(false)
        }
    }, [])

    // Initial fetch
    useEffect(() => {
        fetchBalance()
    }, [fetchBalance])

    // Refetch on route change (navigation)
    useEffect(() => {
        fetchBalance(true)
    }, [pathname, fetchBalance])

    // Smart Polling & Focus Revalidation
    useEffect(() => {
        // Poll checks (background update)
        const interval = setInterval(() => fetchBalance(true), pollingInterval)

        // Focus checks
        const onFocus = () => fetchBalance(true)
        window.addEventListener('focus', onFocus)

        return () => {
            clearInterval(interval)
            window.removeEventListener('focus', onFocus)
        }
    }, [fetchBalance, pollingInterval])

    return (
        <CreditsContext.Provider value={{ balance, loading, refreshBalance: () => fetchBalance(true) }}>
            {children}
        </CreditsContext.Provider>
    )
}

export function useCreditsContext() {
    const context = useContext(CreditsContext)
    if (context === undefined) {
        throw new Error('useCreditsContext must be used within a CreditsProvider')
    }
    return context
}
