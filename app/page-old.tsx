import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Activity,
  Bot,
  Calendar,
  FileText,
  Heart,
  Lock,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Análise Médica Inteligente com IA</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Medical AI v2
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Transforme seus exames médicos em insights acionáveis com o poder da
              Inteligência Artificial e agentes especializados
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8">
                <Link href="/register">
                  Começar Gratuitamente
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8">
                <Link href="/login">
                  Fazer Login
                </Link>
              </Button>
            </div>

            <div className="pt-8 flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <span>Dados Criptografados</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span>Análise Instantânea</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Recursos Completos para sua Saúde
            </h2>
            <p className="text-xl text-muted-foreground">
              Tudo que você precisa para monitorar e melhorar sua saúde em um só lugar
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Agentes de IA Especializados</CardTitle>
                <CardDescription>
                  Análises personalizadas em medicina integrativa, endocrinologia, nutrição e fisiologia do exercício
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Upload de Documentos</CardTitle>
                <CardDescription>
                  Processe PDFs e imagens de exames com extração inteligente e automática de dados médicos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Perfil Médico Completo</CardTitle>
                <CardDescription>
                  Mais de 16 campos personalizados para análises contextualizadas e precisas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Recomendações Personalizadas</CardTitle>
                <CardDescription>
                  Sugestões automáticas de exames, lifestyle e metas de saúde baseadas em suas análises
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle>Plano Semanal Completo</CardTitle>
                <CardDescription>
                  Receba planos de alimentação, treino, suplementação e lista de compras personalizados
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Comparação de Análises</CardTitle>
                <CardDescription>
                  Monitore seu progresso ao longo do tempo e acompanhe a evolução dos seus resultados
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Specialists Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Especialistas de IA ao seu Dispor
            </h2>
            <p className="text-xl text-muted-foreground">
              Cada agente é treinado em sua área específica para fornecer análises precisas
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <div className="text-4xl mb-2">🌿</div>
                <CardTitle className="text-green-900">Medicina Integrativa</CardTitle>
                <CardDescription className="text-green-700">
                  Análise holística considerando corpo, mente e estilo de vida para saúde e longevidade
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader>
                <div className="text-4xl mb-2">⚖️</div>
                <CardTitle className="text-purple-900">Endocrinologia</CardTitle>
                <CardDescription className="text-purple-700">
                  Análise detalhada de hormônios, metabolismo e equilíbrio endócrino
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader>
                <div className="text-4xl mb-2">🥗</div>
                <CardTitle className="text-orange-900">Nutrição Funcional</CardTitle>
                <CardDescription className="text-orange-700">
                  Metabolismo, micronutrientes, saúde digestiva e planos alimentares
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <div className="text-4xl mb-2">💪</div>
                <CardTitle className="text-blue-900">Fisiologia do Exercício</CardTitle>
                <CardDescription className="text-blue-700">
                  Performance física, composição corporal e prescrição de treinos
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-5xl font-bold mb-2">4</div>
              <div className="text-blue-100">Agentes Especializados</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">16+</div>
              <div className="text-blue-100">Campos de Perfil Médico</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-blue-100">Seguro e Privado</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-muted-foreground">
              Simples, rápido e eficiente
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Crie sua Conta</h3>
                <p className="text-muted-foreground">
                  Registre-se gratuitamente e complete seu perfil médico com informações sobre sua saúde e estilo de vida
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Faça Upload dos Exames</h3>
                <p className="text-muted-foreground">
                  Envie PDFs ou imagens dos seus exames médicos. Nossa IA extrai automaticamente os dados relevantes
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Receba Análises Detalhadas</h3>
                <p className="text-muted-foreground">
                  Escolha os especialistas de IA para analisar seus dados e receba insights personalizados, recomendações e planos de ação
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Acompanhe seu Progresso</h3>
                <p className="text-muted-foreground">
                  Compare análises ao longo do tempo, siga planos semanais personalizados e monitore sua evolução
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-purple-700 text-white border-0">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-4xl font-bold">
                Pronto para Transformar sua Saúde?
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Comece agora mesmo a usar o poder da Inteligência Artificial para entender melhor sua saúde
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8">
                  <Link href="/register">
                    Criar Conta Gratuita
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-amber-50 border-y border-amber-200">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-transparent border-amber-300">
            <CardHeader>
              <CardTitle className="text-amber-900 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Aviso Importante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-800">
                Este sistema é uma ferramenta educacional e de apoio à decisão clínica. As análises geradas por IA
                <strong> NÃO substituem consulta, diagnóstico ou tratamento médico profissional</strong>.
                Sempre consulte um profissional de saúde qualificado para interpretação médica definitiva e
                decisões de tratamento. Os dados são processados com segurança e privacidade, em conformidade
                com a LGPD.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-white">Medical AI v2</p>
            <p className="text-sm">
              © {new Date().getFullYear()} Medical AI. Análise Médica Inteligente com IA.
            </p>
            <p className="text-xs">
              Desenvolvido com tecnologia de ponta para o cuidado com sua saúde.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
