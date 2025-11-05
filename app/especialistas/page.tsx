import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import {
  ArrowRight,
  Check,
  Sparkles,
  Leaf,
  Activity,
  Apple,
  Dumbbell,
} from 'lucide-react'

export default function EspecialistasPage() {
  const specialists = [
    {
      icon: Leaf,
      name: 'Medicina Integrativa',
      bgColor: 'bg-stone-50',
      borderColor: 'border-stone-200',
      description: 'Análise holística considerando corpo, mente e estilo de vida para saúde e longevidade',
      focus: [
        'Visão sistêmica da saúde',
        'Prevenção e longevidade',
        'Equilíbrio entre corpo e mente',
        'Medicina preventiva',
        'Qualidade de vida'
      ],
      approach: 'Combina medicina convencional com práticas integrativas, focando em todos os aspectos que influenciam sua saúde: físico, emocional, mental e ambiental.',
      benefits: [
        'Identificação de causas raiz de problemas de saúde',
        'Plano personalizado de prevenção',
        'Recomendações de estilo de vida',
        'Foco em longevidade saudável'
      ]
    },
    {
      icon: Activity,
      name: 'Endocrinologia Funcional',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      description: 'Análise detalhada de hormônios, metabolismo e equilíbrio endócrino',
      focus: [
        'Equilíbrio hormonal',
        'Metabolismo e energia',
        'Tireoide e adrenais',
        'Hormônios sexuais',
        'Controle glicêmico'
      ],
      approach: 'Avalia seus hormônios de forma integrada, identificando desequilíbrios e suas interações para otimizar seu metabolismo e bem-estar.',
      benefits: [
        'Otimização hormonal natural',
        'Melhora de energia e disposição',
        'Equilíbrio metabólico',
        'Regulação do peso corporal'
      ]
    },
    {
      icon: Apple,
      name: 'Nutrição Funcional',
      bgColor: 'bg-zinc-50',
      borderColor: 'border-zinc-200',
      description: 'Metabolismo, micronutrientes, saúde digestiva e planos alimentares personalizados',
      focus: [
        'Nutrição individualizada',
        'Saúde digestiva',
        'Micronutrientes',
        'Metabolismo',
        'Alimentação anti-inflamatória'
      ],
      approach: 'Analisa suas necessidades nutricionais únicas baseado em seus exames e perfil, criando planos alimentares adaptados à realidade brasileira.',
      benefits: [
        'Planos alimentares personalizados',
        'Melhora da saúde digestiva',
        'Otimização de energia',
        'Alimentos disponíveis no Brasil'
      ]
    },
    {
      icon: Dumbbell,
      name: 'Fisiologia do Exercício',
      bgColor: 'bg-neutral-50',
      borderColor: 'border-neutral-200',
      description: 'Performance física, composição corporal e prescrição de treinos baseada em dados',
      focus: [
        'Composição corporal',
        'Performance atlética',
        'Recuperação muscular',
        'Condicionamento físico',
        'Periodização de treino'
      ],
      approach: 'Usa seus dados de saúde para prescrever treinos otimizados para seus objetivos, capacidade atual e limitações individuais.',
      benefits: [
        'Treinos baseados em dados reais',
        'Progressão personalizada',
        'Prevenção de lesões',
        'Otimização de resultados'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <LandingNav activePage="especialistas" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200">
              <Sparkles className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Agentes Especializados</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Especialistas de IA
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Cada agente é treinado em sua área específica para fornecer análises precisas e personalizadas
            </p>
          </div>
        </div>
      </section>

      {/* Specialists Details */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            {specialists.map((specialist, index) => {
              const IconComponent = specialist.icon
              return (
                <Card
                  key={index}
                  className={`hover:shadow-xl transition-shadow ${specialist.borderColor}`}
                >
                  <CardHeader className={specialist.bgColor}>
                    <div className="flex flex-col md:flex-row items-start gap-6">
                      <div className="h-20 w-20 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-10 w-10 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                          {specialist.name}
                        </CardTitle>
                        <CardDescription className="text-base text-gray-700">
                          {specialist.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-8">
                    {/* Grid de Conteúdo */}
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      {/* Foco de Análise */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Foco de Análise</h3>
                        <ul className="space-y-3">
                          {specialist.focus.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                              <span className="text-sm text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Benefícios */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Benefícios</h3>
                        <ul className="space-y-3">
                          {specialist.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                              <span className="text-sm text-gray-700">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Abordagem */}
                    <div className={`${specialist.bgColor} border ${specialist.borderColor} rounded-lg p-6`}>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Abordagem</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{specialist.approach}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How Agents Work Together */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Como os Agentes Trabalham Juntos
              </h2>
              <p className="text-lg text-gray-600">
                Análise integrada e completa da sua saúde
              </p>
            </div>

            <Card className="border-gray-200">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-xl text-gray-900">Visão 360° da Sua Saúde</CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed">
                    Nossos agentes não trabalham isoladamente. Eles colaboram para fornecer uma visão completa:
                  </p>

                  <div className="space-y-5">
                    {[
                      {
                        title: 'Análise Individual',
                        desc: 'Cada agente analisa seus dados sob sua perspectiva especializada'
                      },
                      {
                        title: 'Visão Contextualizada',
                        desc: 'Consideram seu perfil médico completo e histórico de análises'
                      },
                      {
                        title: 'Recomendações Integradas',
                        desc: 'Geram recomendações que se complementam entre as especialidades'
                      },
                      {
                        title: 'Plano de Ação Unificado',
                        desc: 'Você recebe um plano coeso e prático para implementar'
                      }
                    ].map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-700">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{step.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gray-900 border-none text-white">
            <CardHeader className="text-center py-12">
              <CardTitle className="text-3xl md:text-4xl font-bold mb-4">
                Conheça Seus Especialistas
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg mb-8">
                Comece agora e tenha acesso aos especialistas analisando seus dados de saúde
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
