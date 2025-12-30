'use client'

/**
 * Medical Profile Page
 * User medical profile management
 */

import { MedicalProfileForm } from '@/components/profile/medical-profile-form'
import { useSession } from 'next-auth/react'
import { User } from 'lucide-react'

export default function ProfilePage() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
          <User className="h-6 w-6 sm:h-8 sm:w-8" />
          Perfil Médico
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Mantenha suas informações médicas atualizadas para análises mais precisas
        </p>
      </div>

      {/* Profile Form */}
      {session?.user?.id && (
        <MedicalProfileForm
          userId={session.user.id}
          onProfileSaved={(profile) => {
            console.log('Profile saved successfully:', profile)
          }}
        />
      )}
    </div>
  )
}
