'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { PatientProvider } from '@/lib/contexts/patient-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <PatientProvider>
          {children}
          <Toaster position="top-right" richColors />
        </PatientProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
