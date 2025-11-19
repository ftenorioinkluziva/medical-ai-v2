'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'
import { PatientProvider } from '@/lib/contexts/patient-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PatientProvider>
        {children}
        <Toaster position="top-right" richColors />
      </PatientProvider>
    </SessionProvider>
  )
}
