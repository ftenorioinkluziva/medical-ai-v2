import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import {
  ArrowRight,
  UserPlus,
  Upload,
  Brain,
  TrendingUp,
  Check,
  FileText,
  Shield,
  Zap,
  Target,
  Sparkles,
} from 'lucide-react'

export default function ComoFuncionaPage() {
  const steps = [
    {
      number: '01',
      title: 'Crie sua Conta',
      description: 'Registre-se gratuitamente e complete seu perfil médico com informações sobre sua saúde e estilo de vida',
      icon: UserPlus,
      bgColor: 'bg-stone-50',
      details: [
        'Cadastro rápido e seguro',
        'Preencha seu perfil médico com 16+ campos',
        'Informações sobre saúde, estilo de vida e objetivos',
        '100% gratuito para começar'
      ],
      tip: 'Quanto mais completo seu perfil, mais personalizadas serão as análises!'
    },
    {
      number: '02',
      title: 'Faça Upload dos Exames',
      description: 'Envie PDFs ou imagens dos seus exames médicos. Nossa IA extrai automaticamente os dados relevantes',
      icon: Upload,
      bgColor: 'bg-slate-50',
      details: [
        'Suporte a PDF, PNG, JPG e outros formatos',
        'Extração automática de dados médicos',
        'Armazenamento seguro e criptografado',
        'Organize seus exames por data e tipo'
      ],
      tip: 'Você pode fazer upload de múltiplos exames de uma vez!'
    },
    {
      number: '03',
      title: 'Receba Análises Detalhadas',
      description: 'Escolha os especialistas de IA para analisar seus dados e receba insights personalizados e recomendações',
      icon: Brain,
      bgColor: 'bg-zinc-50',
      details: [
        '4 agentes especializados disponíveis',
        'Análises baseadas em seu perfil completo',
        'Recomendações personalizadas',
        'Planos semanais de alimentação e treino'
      ],
      tip: 'Você pode solicitar análises de múltiplos especialistas para uma visão 360°!'
    },
    {
      number: '04',
      title: 'Acompanhe seu Progresso',
      description: 'Compare análises ao longo do tempo, siga planos semanais personalizados e monitore sua evolução',
      icon: TrendingUp,
      bgColor: 'bg-neutral-50',
      details: [
        'Histórico completo de análises',
        'Gráficos de evolução',
        'Comparação de resultados',
        'Ajustes contínuos nas recomendações'
      ],
      tip: 'Faça uploads periódicos de novos exames para acompanhar sua evolução!'
    }
  ]

  const features = [
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Seus dados médicos são criptografados e protegidos com as mais altas medidas de segurança.',
      bgColor: 'bg-gray-100'
    },
    {
      icon: Zap,
      title: 'Processamento Rápido',
      description: 'Análises completas em segundos usando modelos de IA de última geração.',
      bgColor: 'bg-gray-100'
    },
    {
      icon: Target,
      title: 'Personalização',
      description: 'Cada análise considera seu perfil único, histórico e objetivos pessoais.',
      bgColor: 'bg-gray-100'
    },
    {
      icon: FileText,
      title: 'Relatórios Completos',
      description: 'Receba relatórios detalhados e fáceis de entender de cada análise.',
      bgColor: 'bg-gray-100'
    }
  ]

  const faqs = [
    {
      q: 'As análises substituem consultas médicas?',
      a: 'Não. O Medical AI é uma ferramenta educacional e de apoio à decisão. Sempre consulte um profissional de saúde qualificado para diagnóstico e tratamento.'
    },
    {
      q: 'Meus dados estão seguros?',
      a: 'Sim! Utilizamos criptografia de ponta a ponta e estamos em conformidade com a LGPD. Seus dados médicos são tratados com o mais alto nível de segurança.'
    },
    {
      q: 'Quanto custa?',
      a: 'Você pode criar sua conta e começar gratuitamente. Oferecemos planos flexíveis para diferentes necessidades.'
    },
    {
      q: 'Posso usar com qualquer tipo de exame?',
      a: 'Sim! Nosso sistema processa exames laboratoriais, bioimpedância, relatórios médicos e diversos outros tipos de documentos de saúde.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <LandingNav activePage="como-funciona" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200">
              <Sparkles className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Passo a Passo</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Como Funciona
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Simples, rápido e eficiente - em 4 passos você tem análises completas da sua saúde
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-10">
            {steps.map((step, index) => {
              const IconComponent = step.icon
              return (
                <Card
                  key={index}
                  className="hover:shadow-xl transition-shadow border-gray-200"
                >
                  <CardContent className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      {/* Number & Icon */}
                      <div className="flex-shrink-0 flex flex-col items-center gap-4">
                        <div className="h-20 w-20 rounded-xl bg-gray-900 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                          {step.number}
                        </div>
                        <div className={`h-16 w-16 rounded-lg ${step.bgColor} border border-gray-200 flex items-center justify-center`}>
                          <IconComponent className="h-8 w-8 text-gray-700" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-6">
                        <div>
                          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{step.title}</h3>
                          <p className="text-base text-gray-600 leading-relaxed">{step.description}</p>
                        </div>

                        {/* Details */}
                        <div className="grid md:grid-cols-2 gap-3">
                          {step.details.map((detail, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                              <span className="text-sm text-gray-700">{detail}</span>
                            </div>
                          ))}
                        </div>

                        {/* Tip */}
                        <div className={`${step.bgColor} border-l-4 border-gray-900 rounded-r-lg p-4`}>
                          <p className="text-sm">
                            <span className="font-semibold text-gray-900">💡 Dica:</span>{' '}
                            <span className="text-gray-700">{step.tip}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Por que escolher Medical AI?
              </h2>
              <p className="text-lg text-gray-600">
                Tecnologia de ponta para cuidar da sua saúde
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow border-gray-200">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-lg ${feature.bgColor} border border-gray-200 flex items-center justify-center`}>
                          <IconComponent className="h-6 w-6 text-gray-600" />
                        </div>
                        <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                      </div>
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

      {/* Technology Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Tecnologia de Ponta
              </h2>
              <p className="text-lg text-gray-600">
                IA de última geração para análises médicas precisas
              </p>
            </div>

            <Card className="bg-gray-900 border-none text-white">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-6 text-gray-100">Modelos de IA</h3>
                    <ul className="space-y-3">
                      {[
                        'Google Gemini 2.5',
                        'Vertex AI RAG',
                        'Processamento de Linguagem Natural',
                        'Modelos especializados por área médica'
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-400" />
                          <span className="text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-6 text-gray-100">Segurança</h3>
                    <ul className="space-y-3">
                      {[
                        'Criptografia end-to-end',
                        'Conformidade LGPD',
                        'Armazenamento seguro em nuvem',
                        'Backup automático de dados'
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-400" />
                          <span className="text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-lg text-gray-600">
                Respostas para as dúvidas mais comuns
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
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
                Crie sua conta gratuita e comece a analisar seus exames médicos em minutos
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-base px-8"
                >
                  <Link href="/recursos">
                    Ver Recursos
                  </Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
