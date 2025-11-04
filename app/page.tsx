import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowRight,
  Bot,
  Calendar,
  FileText,
  Heart,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
  Check,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b-2 border-black">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8" />
              <span className="text-2xl font-bold">Medical AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/recursos" className="hover:underline">Recursos</Link>
              <Link href="/especialistas" className="hover:underline">Especialistas</Link>
              <Link href="/como-funciona" className="hover:underline">Como Funciona</Link>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="border-2 border-black hover:bg-gray-100 rounded-xl">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-lime text-black hover:bg-lime-500 border-2 border-black rounded-xl font-semibold">
                <Link href="/register">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block">
              <span className="bg-lime px-4 py-2 rounded-lg text-sm font-medium border-2 border-black">
                Análise Médica com IA
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Transforme Seus Exames em{' '}
              <span className="relative">
                <span className="relative z-10">Insights</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-lime -rotate-1"></span>
              </span>
            </h1>

            <p className="text-xl text-gray-700 leading-relaxed">
              Análise médica inteligente com agentes especializados em Medicina Integrativa,
              Endocrinologia, Nutrição e Fisiologia do Exercício.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-black text-white hover:bg-gray-800 border-2 border-black rounded-xl text-lg px-8 h-14"
              >
                <Link href="/register">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-black hover:bg-gray-50 rounded-xl text-lg px-8 h-14"
              >
                <Link href="/como-funciona">
                  Ver Como Funciona
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-lime border-2 border-black flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="font-medium">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-lime border-2 border-black flex items-center justify-center">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="font-medium">Análise de Saúde Completa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-lime border-2 border-black flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <span className="font-medium">Agentes Especializados</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-lime border-4 border-black rounded-3xl p-8" style={{boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)'}}>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-2">
                  <div className="h-12 w-12 rounded-full bg-lime border-2 border-black flex items-center justify-center">
                    <Bot className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg">Agentes</h3>
                  <p className="text-sm text-gray-600">IA Especializada</p>
                </div>
                <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-2">
                  <div className="h-12 w-12 rounded-full bg-lime border-2 border-black flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg">Upload</h3>
                  <p className="text-sm text-gray-600">PDF e Imagens</p>
                </div>
                <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-2">
                  <div className="h-12 w-12 rounded-full bg-lime border-2 border-black flex items-center justify-center">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg">Planos</h3>
                  <p className="text-sm text-gray-600">Personalizados</p>
                </div>
                <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-2">
                  <div className="h-12 w-12 rounded-full bg-lime border-2 border-black flex items-center justify-center">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg">Evolução</h3>
                  <p className="text-sm text-gray-600">Acompanhamento</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer reduzido para exemplo */}
      <footer className="py-12 bg-black text-white border-t-4 border-lime">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Medical AI v2. Análise Médica Inteligente com IA.
          </p>
        </div>
      </footer>
    </div>
  )
}
