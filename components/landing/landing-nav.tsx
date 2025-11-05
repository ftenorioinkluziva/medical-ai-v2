import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'

interface LandingNavProps {
  activePage?: 'recursos' | 'especialistas' | 'como-funciona'
}

export function LandingNav({ activePage }: LandingNavProps) {
  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gray-900 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Medical AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/recursos"
              className={`transition-colors ${
                activePage === 'recursos'
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Recursos
            </Link>
            <Link
              href="/especialistas"
              className={`transition-colors ${
                activePage === 'especialistas'
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Especialistas
            </Link>
            <Link
              href="/como-funciona"
              className={`transition-colors ${
                activePage === 'como-funciona'
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Como Funciona
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-gray-900 text-white hover:bg-gray-800 shadow-sm">
              <Link href="/register">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
