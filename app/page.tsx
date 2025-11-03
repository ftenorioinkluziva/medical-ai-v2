import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold tracking-tight">
            Medical AI v2
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistema avançado de análise médica com Inteligência Artificial e agentes especializados
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">Criar Conta</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <span className="text-2xl">🌿</span>
              </div>
              <CardTitle>Medicina Integrativa</CardTitle>
              <CardDescription>
                Análise holística considerando corpo, mente e estilo de vida
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <span className="text-2xl">⚖️</span>
              </div>
              <CardTitle>Endocrinologia</CardTitle>
              <CardDescription>
                Análise detalhada de hormônios e metabolismo
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <span className="text-2xl">🥗</span>
              </div>
              <CardTitle>Nutrição</CardTitle>
              <CardDescription>
                Metabolismo, micronutrientes e saúde digestiva
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-2xl">💪</span>
              </div>
              <CardTitle>Exercício</CardTitle>
              <CardDescription>
                Performance física e composição corporal
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Recursos Principais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold">Upload de Documentos Médicos</h3>
                  <p className="text-sm text-muted-foreground">
                    Processe PDFs e imagens de exames com extração inteligente de dados
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold">4 Agentes Especializados</h3>
                  <p className="text-sm text-muted-foreground">
                    Análises personalizadas em medicina integrativa, endocrinologia, nutrição e exercício
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold">Perfil Médico Completo</h3>
                  <p className="text-sm text-muted-foreground">
                    16+ campos de saúde e estilo de vida para análises contextualizadas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold">Chat com IA</h3>
                  <p className="text-sm text-muted-foreground">
                    Converse com agentes especializados sobre seus dados de saúde
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900">⚠️ Aviso Importante</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-800">
                Este sistema é uma ferramenta educacional e de apoio. As análises geradas por IA
                <strong> NÃO substituem consulta médica profissional</strong>. Sempre consulte
                um profissional de saúde qualificado para interpretação médica definitiva e
                decisões de tratamento.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
