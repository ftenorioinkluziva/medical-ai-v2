import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import {
  ArrowRight,
  Activity,
  FileText,
  Calendar,
  TrendingUp,
  Check,
  Shield,
  Database,
  Zap,
  BarChart3,
  Users,
  Brain,
  Leaf,
  Apple,
  Dumbbell,
  Sparkles,
} from 'lucide-react'

export default function RecursosPage() {
  const mainFeatures = [
    {
      icon: Leaf,
      title: 'Agentes de IA Especializados',
      description: 'Especialistas treinados em áreas médicas específicas',
      bgColor: 'bg-stone-50',
      borderColor: 'border-stone-200',
      items: [
        { icon: Leaf, name: 'Medicina Integrativa', desc: 'Análise holística para saúde e longevidade' },
        { icon: Activity, name: 'Endocrinologia Funcional', desc: 'Análise hormonal e equilíbrio metabólico' },
        { icon: Apple, name: 'Nutrição Funcional', desc: 'Metabolismo e planos alimentares personalizados' },
        { icon: Dumbbell, name: 'Fisiologia do Exercício', desc: 'Performance física e composição corporal' },
      ]
    },
    {
      icon: FileText,
      title: 'Upload de Documentos',
      description: 'Processamento inteligente de exames médicos',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      items: [
        { name: 'Suporte a Múltiplos Formatos', desc: 'PDFs, imagens PNG, JPG e documentos médicos' },
        { name: 'Extração Automática', desc: 'IA extrai dados médicos automaticamente' },
        { name: 'Armazenamento Seguro', desc: 'Criptografia e conformidade LGPD' },
        { name: 'Histórico Completo', desc: 'Acesso a todas as análises anteriores' },
      ]
    },
    {
      icon: Calendar,
      title: 'Planos Semanais',
      description: 'Alimentação, treino e suplementação personalizados',
      bgColor: 'bg-zinc-50',
      borderColor: 'border-zinc-200',
      items: [
        { name: 'Plano Alimentar Brasileiro', desc: 'Adaptado aos alimentos disponíveis no Brasil' },
        { name: 'Prescrição de Treino', desc: 'Baseada em seus dados e objetivos' },
        { name: 'Suplementação Personalizada', desc: 'Estratégia baseada em suas necessidades' },
        { name: 'Lista de Compras', desc: 'Automatizada e organizada' },
      ]
    },
    {
      icon: TrendingUp,
      title: 'Acompanhamento',
      description: 'Monitore sua evolução ao longo do tempo',
      bgColor: 'bg-neutral-50',
      borderColor: 'border-neutral-200',
      items: [
        { name: 'Comparação de Análises', desc: 'Compare resultados ao longo do tempo' },
        { name: 'Gráficos de Progresso', desc: 'Visualize tendências e melhorias' },
        { name: 'Recomendações Contínuas', desc: 'Ajustes baseados em sua evolução' },
        { name: 'Perfil Médico Completo', desc: '16+ campos de saúde e estilo de vida' },
      ]
    },
  ]

  const additionalFeatures = [
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Criptografia de ponta a ponta, conformidade LGPD e armazenamento seguro de todos os seus dados médicos.',
      bgColor: 'bg-gray-100'
    },
    {
      icon: Database,
      title: 'RAG Avançado',
      description: 'Retrieval-Augmented Generation para análises precisas baseadas em conhecimento médico atualizado.',
      bgColor: 'bg-gray-100'
    },
    {
      icon: Zap,
      title: 'Processamento Rápido',
      description: 'Análises em segundos com modelos de IA otimizados para máximo desempenho e precisão.',
      bgColor: 'bg-gray-100'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Detalhados',
      description: 'Visualizações claras e relatórios completos de todas as suas análises e recomendações.',
      bgColor: 'bg-gray-100'
    },
    {
      icon: Users,
      title: 'Acesso Multi-usuário',
      description: 'Compartilhe análises com profissionais de saúde de forma segura e controlada.',
      bgColor: 'bg-gray-100'
    },
    {
      icon: Brain,
      title: 'IA de Última Geração',
      description: 'Modelos Google Gemini e Vertex AI para análises médicas de alta precisão e confiabilidade.',
      bgColor: 'bg-gray-100'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <LandingNav activePage="recursos" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200">
              <Sparkles className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Recursos Completos</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Tudo que Você Precisa
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Ferramentas completas para análise médica inteligente com IA
            </p>
          </div>
        </div>
      </section>

      {/* Main Resources Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {mainFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <Card key={index} className={`hover:shadow-lg transition-shadow ${feature.borderColor}`}>
                  <CardHeader className={feature.bgColor}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-2xl font-bold text-gray-900">{feature.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-700">{feature.description}</CardDescription>
                      </div>
                      <div className="h-14 w-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-7 w-7 text-gray-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      {feature.items.map((item, i) => {
                        const ItemIcon = item.icon || Check
                        return (
                          <li key={i} className="flex items-start gap-3">
                            <ItemIcon className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Recursos Adicionais</h2>
              <p className="text-lg text-gray-600">Tecnologia de ponta para sua saúde</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {additionalFeatures.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow border-gray-200">
                    <CardHeader>
                      <div className={`h-12 w-12 rounded-lg ${feature.bgColor} border border-gray-200 flex items-center justify-center mb-4`}>
                        <IconComponent className="h-6 w-6 text-gray-600" />
                      </div>
                      <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gray-900 border-none text-white">
            <CardHeader className="text-center py-12">
              <CardTitle className="text-3xl md:text-4xl font-bold mb-4">
                Pronto para Começar?
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg mb-8">
                Experimente todos os recursos gratuitamente
              </CardDescription>
              <Button
                asChild
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-md text-base px-8"
              >
                <Link href="/register">
                  Criar Conta Gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardHeader>
          </Card>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
