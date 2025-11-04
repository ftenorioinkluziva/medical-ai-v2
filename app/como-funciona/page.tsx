import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowRight,
  Heart,
  UserPlus,
  Upload,
  Brain,
  TrendingUp,
  Check,
  FileText,
  Shield,
  Zap,
  Target,
} from 'lucide-react'

export default function ComoFuncionaPage() {
  const steps = [
    {
      number: '01',
      title: 'Crie sua Conta',
      description: 'Registre-se gratuitamente e complete seu perfil médico com informações sobre sua saúde e estilo de vida',
      icon: UserPlus,
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
      description: 'Escolha os especialistas de IA para analisar seus dados e receba insights personalizados, recomendações e planos de ação',
      icon: Brain,
      details: [
        'Agentes especializados disponíveis',
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
      description: 'Seus dados médicos são criptografados e protegidos com as mais altas medidas de segurança.'
    },
    {
      icon: Zap,
      title: 'Processamento Rápido',
      description: 'Análises completas em segundos usando modelos de IA de última geração.'
    },
    {
      icon: Target,
      title: 'Personalização',
      description: 'Cada análise considera seu perfil único, histórico e objetivos pessoais.'
    },
    {
      icon: FileText,
      title: 'Relatórios Completos',
      description: 'Receba relatórios detalhados e fáceis de entender de cada análise.'
    }
  ]

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
              <Link href="/recursos" className="hover:underline">Recursos</Link>
              <Link href="/especialistas" className="hover:underline">Especialistas</Link>
              <Link href="/como-funciona" className="hover:underline font-semibold">Como Funciona</Link>
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
              Como Funciona
            </h1>
            <p className="text-xl md:text-2xl text-gray-800">
              Simples, rápido e eficiente - em 4 passos você tem análises completas da sua saúde
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon
              return (
                <div
                  key={index}
                  className="bg-white border-4 border-black rounded-3xl p-8 md:p-12 hover:translate-x-1 hover:translate-y-1 transition-all"
                  style={{boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)'}}
                >
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Number & Icon */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-lime border-4 border-black flex items-center justify-center text-3xl font-bold">
                        {step.number}
                      </div>
                      <div className="h-16 w-16 rounded-2xl bg-gray-100 border-2 border-black flex items-center justify-center">
                        <IconComponent className="h-8 w-8" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <h3 className="text-3xl md:text-4xl font-bold mb-3">{step.title}</h3>
                        <p className="text-lg md:text-xl text-gray-700">{step.description}</p>
                      </div>

                      {/* Details */}
                      <div className="grid md:grid-cols-2 gap-3">
                        {step.details.map((detail, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-600" />
                            <span className="text-gray-700">{detail}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tip */}
                      <div className="bg-lime/20 border-2 border-black rounded-xl p-4">
                        <p className="font-semibold">💡 Dica: <span className="font-normal">{step.tip}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              Por que escolher Medical AI?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <Card
                    key={index}
                    className="border-4 border-black rounded-3xl overflow-hidden"
                    style={{boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)'}}
                  >
                    <CardHeader className="bg-white border-b-4 border-black">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-lime border-2 border-black flex items-center justify-center">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-700 text-lg">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              Tecnologia de Ponta
            </h2>

            <div className="bg-black text-white border-4 border-black rounded-3xl p-8 md:p-12" style={{boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)'}}>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-lime">Modelos de IA</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-lime" />
                      <span>Google Gemini</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-lime" />
                      <span>Vertex AI RAG</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-lime" />
                      <span>Processamento de Linguagem Natural</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-lime" />
                      <span>Modelos especializados por área médica</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-4 text-lime">Segurança</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-lime" />
                      <span>Criptografia end-to-end</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-lime" />
                      <span>Conformidade LGPD</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-lime" />
                      <span>Armazenamento seguro em nuvem</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-lime" />
                      <span>Backup automático de dados</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              Perguntas Frequentes
            </h2>

            <div className="space-y-4">
              {[
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
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border-4 border-black rounded-2xl p-6"
                  style={{boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'}}
                >
                  <h3 className="font-bold text-xl mb-2">{faq.q}</h3>
                  <p className="text-gray-700">{faq.a}</p>
                </div>
              ))}
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
              Crie sua conta gratuita e comece a analisar seus exames médicos em minutos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white border-4 border-black hover:bg-gray-50 rounded-xl text-xl px-12 h-16 font-bold"
                style={{boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'}}
              >
                <Link href="/recursos">
                  Ver Recursos
                </Link>
              </Button>
            </div>
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
