import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-6">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">Medical AI v2</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Análise médica inteligente com IA
          </p>
        </div>
        <Suspense fallback={<div className="text-gray-600 dark:text-gray-400">Carregando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
