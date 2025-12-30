'use client'

/**
 * Force Light Theme Component
 * Wraps landing pages to force light mode regardless of user preference
 */

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

export function ForceLightTheme({ children }: { children: React.ReactNode }) {
  const { setTheme, theme } = useTheme()
  const previousThemeRef = useRef<string | undefined>()

  useEffect(() => {
    // Save current theme on mount only
    if (previousThemeRef.current === undefined) {
      previousThemeRef.current = theme
    }

    // Force light theme for landing pages
    setTheme('light')

    // Cleanup: restore theme when leaving landing page
    return () => {
      if (previousThemeRef.current && previousThemeRef.current !== 'light') {
        setTheme(previousThemeRef.current)
      }
    }
  }, [setTheme])

  // Also add 'light' class to force light mode styles
  return (
    <div className="light">
      {children}
    </div>
  )
}
