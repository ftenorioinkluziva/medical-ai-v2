'use client'

/**
 * Patient Context
 * Manages selected patient state for doctors
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Patient {
  id: string
  name: string
  email: string
  image?: string | null
  age?: number | null
  gender?: string | null
}

interface PatientContextType {
  selectedPatient: Patient | null
  selectPatient: (patient: Patient) => void
  clearPatient: () => void
}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

export function PatientProvider({ children }: { children: ReactNode }) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('selectedPatient')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSelectedPatient(parsed)
      } catch (e) {
        console.error('Error loading selected patient:', e)
        localStorage.removeItem('selectedPatient')
      }
    }
  }, [])

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    localStorage.setItem('selectedPatient', JSON.stringify(patient))
  }

  const clearPatient = () => {
    setSelectedPatient(null)
    localStorage.removeItem('selectedPatient')
  }

  return (
    <PatientContext.Provider value={{ selectedPatient, selectPatient, clearPatient }}>
      {children}
    </PatientContext.Provider>
  )
}

export function usePatient() {
  const context = useContext(PatientContext)
  if (!context) {
    throw new Error('usePatient must be used within PatientProvider')
  }
  return context
}
