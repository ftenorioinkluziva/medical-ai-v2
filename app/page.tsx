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
  Zap,
  Lock,
  BarChart3,
  FileSearch,
  Lightbulb,
  Layers,
  Workflow,
  FolderOpen,
  Brain,
  Calendar,
  ClipboardList,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="border-b border-blue-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#0E69F1] to-[#0A51CF] flex items-center justify-center shadow-sm">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Medical AI</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8">
            <Link href="#servicos" className="text-gray-600 dark:text-gray-300 hover:text-[#0E69F1] dark:hover:text-[#3B82F6] transition-colors font-medium">Serviços</Link>
            <Link href="#sobre" className="text-gray-600 dark:text-gray-300 hover:text-[#0E69F1] dark:hover:text-[#3B82F6] transition-colors font-medium">Sobre</Link>
            <Link href="#agentes" className="text-gray-600 dark:text-gray-300 hover:text-[#0E69F1] dark:hover:text-[#3B82F6] transition-colors font-medium">Especialistas</Link>
            <Link href="#como-funciona" className="text-gray-600 dark:text-gray-300 hover:text-[#0E69F1] dark:hover:text-[#3B82F6] transition-colors font-medium">Como Funciona</Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-[#0E69F1] text-white hover:bg-[#0A51CF] cursor-pointer shadow-md">
              <Link href="/register">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <Sparkles className="h-4 w-4 text-[#0E69F1] dark:text-[#3B82F6]" />
              <span className="text-sm font-semibold text-[#0A51CF] dark:text-blue-300">Análise Médica Inteligente</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
              Cuidando da sua saúde com{' '}
              <span className="text-[#0E69F1] dark:text-[#3B82F6]">Inteligência Artificial</span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Plataforma avançada de análise médica com 4 especialistas em IA.
              Processamento automático de exames, diagnósticos inteligentes e recomendações personalizadas para sua saúde.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="cursor-pointer bg-[#0E69F1] text-white hover:bg-[#0A51CF] shadow-lg"
              >
                <Link href="/register">
                  Agendar Consulta Virtual
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="cursor-pointer border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Link href="#como-funciona">
                  Saiba Mais
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Check className="h-5 w-5 text-[#0E69F1] dark:text-[#3B82F6]" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Atendimento 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-[#0E69F1] dark:text-[#3B82F6]" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-[#0E69F1] dark:text-[#3B82F6]" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Confiável</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-blue-300/30 dark:from-blue-900/20 dark:to-blue-800/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-blue-100 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 border border-blue-200 dark:border-gray-700">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#0E69F1] to-[#0A51CF] flex items-center justify-center">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sistema Multi-Agente</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">4 Especialistas em IA</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                    <Activity className="h-5 w-5 text-[#0E69F1] dark:text-[#3B82F6]" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Análise Completa de Exames</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                    <FileSearch className="h-5 w-5 text-[#0E69F1] dark:text-[#3B82F6]" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">OCR + Vision AI</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-[#0E69F1] dark:text-[#3B82F6]" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recomendações Personalizadas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="servicos" className="bg-white dark:bg-gray-900 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nossos Serviços
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Tecnologia de ponta para cuidar da sua saúde de forma inteligente e personalizada
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-blue-100 dark:border-gray-700 hover:border-[#0E69F1] dark:hover:border-[#3B82F6] bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-800">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center mb-4">
                  <FileSearch className="h-8 w-8 text-[#0E69F1] dark:text-[#3B82F6]" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Análise de Documentos</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Upload e processamento automático de PDFs e imagens médicas com OCR avançado
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-blue-100 dark:border-gray-700 hover:border-[#0E69F1] dark:hover:border-[#3B82F6] bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-800">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-950 dark:to-teal-900 flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Análise Multi-Agente</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  4 especialistas IA trabalham em conjunto para análise completa da sua saúde
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-blue-100 dark:border-gray-700 hover:border-[#0E69F1] dark:hover:border-[#3B82F6] bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-800">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900 flex items-center justify-center mb-4">
                  <ClipboardList className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Recomendações</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Sugestões personalizadas de saúde baseadas em análises consolidadas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-blue-100 dark:border-gray-700 hover:border-[#0E69F1] dark:hover:border-[#3B82F6] bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-800">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950 dark:to-orange-900 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Plano Semanal</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Planejamento semanal personalizado com metas de saúde e bem-estar
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-blue-300/30 dark:from-blue-900/20 dark:to-blue-800/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-blue-100 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-[#0E69F1] dark:text-[#3B82F6] mb-2">4</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Especialistas IA</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">24/7</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Disponibilidade</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">100%</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Seguro LGPD</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">IA</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Gemini 2.5</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <Heart className="h-4 w-4 text-[#0E69F1] dark:text-[#3B82F6]" />
                <span className="text-sm font-semibold text-[#0A51CF] dark:text-blue-300">Sobre o Medical AI</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Tecnologia de Ponta para sua Saúde
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                O Medical AI é uma plataforma inovadora que combina inteligência artificial com expertise médica
                para fornecer análises precisas e recomendações personalizadas.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-[#0E69F1] dark:text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Sistema Multi-Agente</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Arquitetura com agentes Foundation e Specialized trabalhando em conjunto</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-[#0E69F1] dark:text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">RAG Médico</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Base de conhecimento com pgvector e embeddings para análises fundamentadas</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-[#0E69F1] dark:text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Processamento Inteligente</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">OCR e Vision AI para extrair e estruturar dados de documentos médicos</p>
                  </div>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="cursor-pointer bg-[#0E69F1] text-white hover:bg-[#0A51CF] mt-6"
              >
                <Link href="/register">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Specialists Grid */}
      <section id="agentes" className="bg-white dark:bg-gray-900 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nossos Especialistas em IA
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Conheça os agentes especializados que cuidam da sua saúde de forma personalizada
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-teal-200 dark:border-teal-800 hover:border-teal-400 dark:hover:border-teal-600 bg-white dark:bg-gray-800">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-950 dark:to-teal-900 flex items-center justify-center mb-4 ring-4 ring-teal-50 dark:ring-teal-950">
                  <Leaf className="h-10 w-10 text-teal-600 dark:text-teal-400" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Medicina Integrativa</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Análise holística considerando todos os aspectos da sua saúde e bem-estar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-medium rounded-full">Foundation</span>
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">Holística</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 bg-white dark:bg-gray-800">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900 flex items-center justify-center mb-4 ring-4 ring-purple-50 dark:ring-purple-950">
                  <Activity className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Endocrinologia</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Especialista em hormônios, metabolismo e equilíbrio endócrino
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">Foundation</span>
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">Hormônios</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-sky-200 dark:border-sky-800 hover:border-sky-400 dark:hover:border-sky-600 bg-white dark:bg-gray-800">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-950 dark:to-sky-900 flex items-center justify-center mb-4 ring-4 ring-sky-50 dark:ring-sky-950">
                  <Apple className="h-10 w-10 text-sky-600 dark:text-sky-400" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Nutrição Funcional</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Orientação nutricional personalizada para sua saúde e objetivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-medium rounded-full">Specialized</span>
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">Alimentação</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 bg-white dark:bg-gray-800">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950 dark:to-orange-900 flex items-center justify-center mb-4 ring-4 ring-orange-50 dark:ring-orange-950">
                  <Dumbbell className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Fisiologia do Exercício</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Planos de treino e orientações para performance e saúde física
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">Specialized</span>
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">Exercício</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Processo simples e inteligente para cuidar da sua saúde
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-4 -left-4 h-12 w-12 rounded-xl bg-gradient-to-br from-[#0E69F1] to-[#0A51CF] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  1
                </div>
                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-4 mx-auto">
                  <FolderOpen className="h-8 w-8 text-[#0E69F1] dark:text-[#3B82F6]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">Upload de Documentos</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Envie seus exames em PDF ou imagem de forma segura
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-4 -left-4 h-12 w-12 rounded-xl bg-gradient-to-br from-[#0E69F1] to-[#0A51CF] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  2
                </div>
                <div className="h-16 w-16 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center mb-4 mx-auto">
                  <Layers className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">Processamento IA</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  OCR e Vision AI extraem e estruturam os dados médicos
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-4 -left-4 h-12 w-12 rounded-xl bg-gradient-to-br from-[#0E69F1] to-[#0A51CF] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  3
                </div>
                <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center mb-4 mx-auto">
                  <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">Análise Multi-Agente</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  4 especialistas analisam seus dados em paralelo
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-4 -left-4 h-12 w-12 rounded-xl bg-gradient-to-br from-[#0E69F1] to-[#0A51CF] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  4
                </div>
                <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">Recomendações</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Receba insights e plano personalizado de saúde
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#0E69F1] to-[#0A51CF] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pronto para Transformar sua Saúde?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Junte-se a milhares de pessoas que já confiam na nossa plataforma de análise médica com IA
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="cursor-pointer bg-white text-[#0E69F1] hover:bg-gray-100 shadow-xl"
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
                className="cursor-pointer border-white text-white hover:bg-white/10"
              >
                <Link href="/login">
                  Já Tenho Conta
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 mt-10 text-sm text-blue-100 flex-wrap">
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
                <span>100% Seguro LGPD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            <Link href="/" className="inline-flex items-center justify-center gap-2 group cursor-pointer">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#0E69F1] to-[#0A51CF] flex items-center justify-center shadow-sm">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Medical AI</span>
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="#servicos" className="hover:text-gray-900 dark:hover:text-white transition-colors">Serviços</Link>
              <Link href="#sobre" className="hover:text-gray-900 dark:hover:text-white transition-colors">Sobre</Link>
              <Link href="#agentes" className="hover:text-gray-900 dark:hover:text-white transition-colors">Especialistas</Link>
              <Link href="#como-funciona" className="hover:text-gray-900 dark:hover:text-white transition-colors">Como Funciona</Link>
              <Link href="/login" className="hover:text-gray-900 dark:hover:text-white transition-colors">Login</Link>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} Medical AI v2. Plataforma de Análise Médica Multi-Agente com IA.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 max-w-2xl">
                Esta plataforma oferece análises educacionais geradas por IA para fins informativos e NÃO substitui consulta médica profissional.
                Sempre consulte um médico qualificado para diagnósticos e tratamentos.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <div className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400">
                Next.js 16
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400">
                Google Gemini AI
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400">
                PostgreSQL + pgvector
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400">
                LGPD Compliant
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
