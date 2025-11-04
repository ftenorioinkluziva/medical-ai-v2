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
  Check,
  Lock,
  Database,
  Zap,
  BarChart3,
  Users,
  Brain,
} from 'lucide-react'

export default function RecursosPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b-2 border-black">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-8 w-8" />
              <span className="text-2xl font-bold">Medical AI</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/recursos" className="hover:underline font-semibold">Recursos</Link>
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

      {/* Hero */}
      <section className="bg-lime border-b-4 border-black py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold">
              Recursos Completos
            </h1>
            <p className="text-xl md:text-2xl text-gray-800">
              Tudo que você precisa para análise médica inteligente com IA
            </p>
          </div>
        </div>
      </section>

      {/* Main Resources Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Agentes de IA */}
            <Card className="border-4 border-black rounded-3xl bg-white overflow-hidden" style={{boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)'}}>
              <CardHeader className="bg-lime border-b-4 border-black">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-3xl">
                      <h3 className="font-bold">Agentes de IA Especializados</h3>
                    </CardTitle>
                    <CardDescription className="text-black/70 text-lg">
                      Especialistas treinados em áreas médicas específicas
                    </CardDescription>
                  </div>
                  <Bot className="h-16 w-16 flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0 text-green-600" />
                    <div>
                      <p className="font-semibold">Medicina Integrativa</p>
                      <p className="text-gray-600">Análise holística para saúde e longevidade</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0 text-purple-600" />
                    <div>
                      <p className="font-semibold">Endocrinologia Funcional</p>
                      <p className="text-gray-600">Análise hormonal e equilíbrio metabólico</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0 text-orange-600" />
                    <div>
                      <p className="font-semibold">Nutrição Funcional</p>
                      <p className="text-gray-600">Metabolismo e planos alimentares personalizados</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="font-semibold">Fisiologia do Exercício</p>
                      <p className="text-gray-600">Performance física e composição corporal</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Upload de Documentos */}
            <Card className="border-4 border-black rounded-3xl bg-white overflow-hidden" style={{boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)'}}>
              <CardHeader className="bg-white border-b-4 border-black">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-3xl">
                      <h3 className="font-bold">Upload de Documentos</h3>
                    </CardTitle>
                    <CardDescription className="text-black/70 text-lg">
                      Processamento inteligente de exames médicos
                    </CardDescription>
                  </div>
                  <FileText className="h-16 w-16 flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Suporte a Múltiplos Formatos</p>
                      <p className="text-gray-600">PDFs, imagens PNG, JPG e documentos médicos</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Extração Automática</p>
                      <p className="text-gray-600">IA extrai dados médicos automaticamente</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Armazenamento Seguro</p>
                      <p className="text-gray-600">Criptografia e conformidade LGPD</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Histórico Completo</p>
                      <p className="text-gray-600">Acesso a todas as análises anteriores</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Planos Semanais */}
            <Card className="border-4 border-black rounded-3xl bg-black text-white overflow-hidden" style={{boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)'}}>
              <CardHeader className="border-b-4 border-white">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-3xl">
                      <h3 className="font-bold">Planos Semanais</h3>
                    </CardTitle>
                    <CardDescription className="text-white/70 text-lg">
                      Alimentação, treino e suplementação personalizados
                    </CardDescription>
                  </div>
                  <Calendar className="h-16 w-16 flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0 text-lime" />
                    <div>
                      <p className="font-semibold">Plano Alimentar Brasileiro</p>
                      <p className="text-gray-300">Adaptado aos alimentos disponíveis no Brasil</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0 text-lime" />
                    <div>
                      <p className="font-semibold">Prescrição de Treino</p>
                      <p className="text-gray-300">Baseada em seus dados e objetivos</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0 text-lime" />
                    <div>
                      <p className="font-semibold">Suplementação Personalizada</p>
                      <p className="text-gray-300">Estratégia baseada em suas necessidades</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0 text-lime" />
                    <div>
                      <p className="font-semibold">Lista de Compras</p>
                      <p className="text-gray-300">Automatizada e organizada</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Acompanhamento */}
            <Card className="border-4 border-black rounded-3xl bg-white overflow-hidden" style={{boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)'}}>
              <CardHeader className="bg-white border-b-4 border-black">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-3xl">
                      <h3 className="font-bold">Acompanhamento</h3>
                    </CardTitle>
                    <CardDescription className="text-black/70 text-lg">
                      Monitore sua evolução ao longo do tempo
                    </CardDescription>
                  </div>
                  <TrendingUp className="h-16 w-16 flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Comparação de Análises</p>
                      <p className="text-gray-600">Compare resultados ao longo do tempo</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Gráficos de Progresso</p>
                      <p className="text-gray-600">Visualize tendências e melhorias</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Recomendações Contínuas</p>
                      <p className="text-gray-600">Ajustes baseados em sua evolução</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Perfil Médico Completo</p>
                      <p className="text-gray-600">16+ campos de saúde e estilo de vida</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Recursos Adicionais</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border-4 border-black rounded-3xl p-6" style={{boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)'}}>
                <Lock className="h-12 w-12 mb-4 text-green-600" />
                <h3 className="text-xl font-bold mb-2">Segurança Total</h3>
                <p className="text-gray-600">
                  Criptografia de ponta a ponta, conformidade LGPD e armazenamento seguro de todos os seus dados médicos.
                </p>
              </div>

              <div className="bg-white border-4 border-black rounded-3xl p-6" style={{boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)'}}>
                <Database className="h-12 w-12 mb-4 text-blue-600" />
                <h3 className="text-xl font-bold mb-2">RAG Avançado</h3>
                <p className="text-gray-600">
                  Retrieval-Augmented Generation para análises precisas baseadas em conhecimento médico atualizado.
                </p>
              </div>

              <div className="bg-white border-4 border-black rounded-3xl p-6" style={{boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)'}}>
                <Zap className="h-12 w-12 mb-4 text-yellow-600" />
                <h3 className="text-xl font-bold mb-2">Processamento Rápido</h3>
                <p className="text-gray-600">
                  Análises em segundos com modelos de IA otimizados para máximo desempenho e precisão.
                </p>
              </div>

              <div className="bg-white border-4 border-black rounded-3xl p-6" style={{boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)'}}>
                <BarChart3 className="h-12 w-12 mb-4 text-purple-600" />
                <h3 className="text-xl font-bold mb-2">Relatórios Detalhados</h3>
                <p className="text-gray-600">
                  Visualizações claras e relatórios completos de todas as suas análises e recomendações.
                </p>
              </div>

              <div className="bg-white border-4 border-black rounded-3xl p-6" style={{boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)'}}>
                <Users className="h-12 w-12 mb-4 text-orange-600" />
                <h3 className="text-xl font-bold mb-2">Acesso Multi-usuário</h3>
                <p className="text-gray-600">
                  Compartilhe análises com profissionais de saúde de forma segura e controlada.
                </p>
              </div>

              <div className="bg-white border-4 border-black rounded-3xl p-6" style={{boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)'}}>
                <Brain className="h-12 w-12 mb-4 text-pink-600" />
                <h3 className="text-xl font-bold mb-2">IA de Última Geração</h3>
                <p className="text-gray-600">
                  Modelos Google Gemini e Vertex AI para análises médicas de alta precisão e confiabilidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-lime border-4 border-black rounded-3xl p-12 text-center" style={{boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)'}}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para Começar?
            </h2>
            <p className="text-xl mb-8">
              Experimente todos os recursos gratuitamente
            </p>
            <Button
              asChild
              size="lg"
              className="bg-black text-white hover:bg-gray-800 border-4 border-black rounded-xl text-xl px-12 h-16 font-bold"
              style={{boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'}}
            >
              <Link href="/register">
                Criar Conta Gratuita
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black text-white border-t-4 border-lime">
        <div className="container mx-auto px-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-lime" />
            <span className="text-2xl font-bold">Medical AI</span>
          </Link>
          <p className="text-gray-400 mt-4">
            © {new Date().getFullYear()} Medical AI v2. Análise Médica Inteligente com IA.
          </p>
        </div>
      </footer>
    </div>
  )
}
