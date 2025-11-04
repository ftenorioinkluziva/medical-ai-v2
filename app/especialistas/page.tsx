import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowRight,
  Heart,
  Check,
  Sparkles,
} from 'lucide-react'

export default function EspecialistasPage() {
  const specialists = [
    {
      emoji: '🌿',
      name: 'Medicina Integrativa',
      color: 'from-green-50 to-green-100',
      borderColor: 'border-green-600',
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
      emoji: '⚖️',
      name: 'Endocrinologia Funcional',
      color: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-600',
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
      emoji: '🥗',
      name: 'Nutrição Funcional',
      color: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-600',
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
      emoji: '💪',
      name: 'Fisiologia do Exercício',
      color: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-600',
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
              <Link href="/especialistas" className="hover:underline font-semibold">Especialistas</Link>
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
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full border-2 border-black">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">Agentes Especializados</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold">
              Especialistas de IA
            </h1>
            <p className="text-xl md:text-2xl text-gray-800">
              Cada agente é treinado em sua área específica para fornecer análises precisas e personalizadas
            </p>
          </div>
        </div>
      </section>

      {/* Specialists Details */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            {specialists.map((specialist, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${specialist.color} border-4 ${specialist.borderColor} rounded-3xl overflow-hidden`}
                style={{boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)'}}
              >
                <div className="p-8 md:p-12">
                  {/* Header */}
                  <div className="flex items-start gap-6 mb-8">
                    <div className="text-6xl md:text-8xl">{specialist.emoji}</div>
                    <div className="flex-1">
                      <h2 className="text-3xl md:text-4xl font-bold mb-3">{specialist.name}</h2>
                      <p className="text-lg md:text-xl text-gray-700">{specialist.description}</p>
                    </div>
                  </div>

                  {/* Grid de Conteúdo */}
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Foco de Análise */}
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Foco de Análise</h3>
                      <ul className="space-y-3">
                        {specialist.focus.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <span className="font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefícios */}
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Benefícios</h3>
                      <ul className="space-y-3">
                        {specialist.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <span className="font-medium">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Abordagem */}
                  <div className="mt-8 bg-white/50 border-2 border-black rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-3">Abordagem</h3>
                    <p className="text-gray-700 leading-relaxed">{specialist.approach}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Agents Work Together */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              Como os Agentes Trabalham Juntos
            </h2>

            <Card className="border-4 border-black rounded-3xl overflow-hidden" style={{boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)'}}>
              <CardHeader className="bg-lime border-b-4 border-black">
                <CardTitle className="text-2xl">Análise Integrada e Completa</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <p className="text-lg text-gray-700">
                    Nossos agentes não trabalham isoladamente. Eles colaboram para fornecer uma visão 360° da sua saúde:
                  </p>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime border-2 border-black flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-semibold">Análise Individual</p>
                        <p className="text-gray-600">Cada agente analisa seus dados sob sua perspectiva especializada</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime border-2 border-black flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-semibold">Visão Contextualizada</p>
                        <p className="text-gray-600">Consideram seu perfil médico completo e histórico de análises</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime border-2 border-black flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-semibold">Recomendações Integradas</p>
                        <p className="text-gray-600">Geram recomendações que se complementam entre as especialidades</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime border-2 border-black flex items-center justify-center font-bold">
                        4
                      </div>
                      <div>
                        <p className="font-semibold">Plano de Ação Unificado</p>
                        <p className="text-gray-600">Você recebe um plano coeso e prático para implementar</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-black text-white border-4 border-black rounded-3xl p-12 text-center" style={{boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)'}}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Conheça Seus Especialistas
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Comece agora e tenha acesso a especialistas analisando seus dados de saúde
            </p>
            <Button
              asChild
              size="lg"
              className="bg-lime text-black hover:bg-lime-500 border-4 border-black rounded-xl text-xl px-12 h-16 font-bold"
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
