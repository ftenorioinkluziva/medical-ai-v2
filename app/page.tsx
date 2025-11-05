import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowRight,
  Activity,
  FileText,
  Heart,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  Leaf,
  Apple,
  Dumbbell,
  Check,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
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
              <Link href="/recursos" className="text-gray-600 hover:text-gray-900 transition-colors">Recursos</Link>
              <Link href="/especialistas" className="text-gray-600 hover:text-gray-900 transition-colors">Especialistas</Link>
              <Link href="/como-funciona" className="text-gray-600 hover:text-gray-900 transition-colors">Como Funciona</Link>
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200">
              <Sparkles className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Análise Médica com IA</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900">
              Transforme Seus Exames em{' '}
              <span className="text-gray-700">Insights de Saúde</span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed">
              Análise médica inteligente com agentes especializados em Medicina Integrativa,
              Endocrinologia, Nutrição e Fisiologia do Exercício. Seu parceiro completo para uma vida mais saudável.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gray-900 text-white hover:bg-gray-800 shadow-md text-base px-8"
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
                className="border-gray-300 hover:bg-gray-50 text-base px-8"
              >
                <Link href="/como-funciona">
                  Ver Como Funciona
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Análise Completa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">4 Especialistas IA</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <Card className="hover:shadow-md transition-shadow border-gray-200 hover:border-gray-300">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                    <Leaf className="h-6 w-6 text-gray-600" />
                  </div>
                  <CardTitle className="text-base">Integrativa</CardTitle>
                  <CardDescription className="text-xs">Medicina Holística</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-md transition-shadow border-gray-200 hover:border-gray-300">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                    <Activity className="h-6 w-6 text-gray-600" />
                  </div>
                  <CardTitle className="text-base">Endocrinologia</CardTitle>
                  <CardDescription className="text-xs">Hormônios & Metabolismo</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-md transition-shadow border-gray-200 hover:border-gray-300">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                    <Apple className="h-6 w-6 text-gray-600" />
                  </div>
                  <CardTitle className="text-base">Nutrição</CardTitle>
                  <CardDescription className="text-xs">Alimentação Funcional</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-md transition-shadow border-gray-200 hover:border-gray-300">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                    <Dumbbell className="h-6 w-6 text-gray-600" />
                  </div>
                  <CardTitle className="text-base">Exercício</CardTitle>
                  <CardDescription className="text-xs">Performance & Treino</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Como Funciona
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Análise médica inteligente em poucos passos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
              <CardTitle className="text-xl">1. Envie seus Exames</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Faça upload de PDFs ou imagens dos seus exames médicos de forma segura e criptografada.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-gray-600" />
              </div>
              <CardTitle className="text-xl">2. Escolha Especialistas</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Selecione quais agentes de IA especializados você deseja consultar para análise personalizada.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-gray-600" />
              </div>
              <CardTitle className="text-xl">3. Receba Insights</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Obtenha análises detalhadas, recomendações personalizadas e planos de ação para sua saúde.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gray-900 border-none text-white">
          <CardHeader className="text-center py-12">
            <CardTitle className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para Transformar sua Saúde?
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que já estão usando IA para cuidar melhor da sua saúde
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-md text-base px-8"
              >
                <Link href="/register">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                <span>Gratuito para começar</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                <span>100% Seguro</span>
              </div>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
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
    </div>
  )
}
