import { useCreditsContext } from '@/components/providers/credits-provider'

interface UseCreditsReturn {
    balance: number | null
    loading: boolean
    error: Error | null
    mutate: () => Promise<void>
}

/**
 * Custom hook to access user credits data
 * Consumes the global CreditsContext
 */
export function useCredits(
    // Options are now handled globally by the Provider
    // Keeping argument for compatibility
    _options: {
        pollingInterval?: number
        revalidateOnFocus?: boolean
    } = {}
): UseCreditsReturn {
    // We safely try to access context. 
    // If we want to use this hook outside of the provider (e.g. landing page?), it might fail.
    // But currently the entire dashboard is wrapped.
    const { balance, loading, refreshBalance } = useCreditsContext()

    return {
        balance,
        loading,
        error: null,
        mutate: refreshBalance
    }
}
