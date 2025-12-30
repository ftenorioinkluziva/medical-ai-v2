'use client'

/**
 * Force Light Theme Component
 * Wraps landing pages to force light mode regardless of user preference
 */

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

export function ForceLightTheme({ children }: { children: React.ReactNode }) {
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    // Save current theme
    const previousTheme = theme

    // Force light theme for landing pages
    setTheme('light')

    // Cleanup: restore theme when leaving landing page
    return () => {
      if (previousTheme && previousTheme !== 'light') {
        setTheme(previousTheme)
      }
    }
  }, [setTheme, theme])

  // Also add 'light' class to force light mode styles
  return (
    <div className="light">
      {children}
    </div>
  )
}
