import Link from 'next/link'
import { Heart } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="py-12 border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900">Medical AI</span>
        </Link>
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Medical AI v2. Análise Médica Inteligente com IA.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Esta plataforma oferece análises educacionais e não substitui consulta médica profissional.
        </p>
      </div>
    </footer>
  )
}
