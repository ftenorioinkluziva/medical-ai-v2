'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowRight,
  Activity,
  Heart,
  Sparkles,
  Leaf,
  Apple,
  Dumbbell,
  Check,
  FileSearch,
  Brain,
  Calendar,
  ClipboardList,
} from 'lucide-react'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <nav className="fixed w-full border-b border-border/40 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md group-hover:shadow-primary/25 transition-all">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Medical AI</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8">
            <Link href="#servicos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Serviços</Link>
            <Link href="#sobre" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Sobre</Link>
            <Link href="#agentes" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Especialistas</Link>
            <Link href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Como Funciona</Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="cursor-pointer text-muted-foreground hover:text-foreground">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 cursor-pointer rounded-full px-6">
              <Link href="/register">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none -z-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">Análise Médica Inteligente V2.0</span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                Sua saúde potencializada por <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                  Inteligência Artificial
                </span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Uma plataforma completa com 4 agentes especialistas trabalhando em sinergia para fornecer análises precisas, diagnósticos e planos de saúde personalizados.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-base shadow-xl shadow-primary/20"
                >
                  <Link href="/register">
                    Iniciar Análise Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full h-14 px-8 text-base border-border bg-background/50 backdrop-blur-sm hover:bg-muted"
                >
                  <Link href="#como-funciona">
                    Ver como funciona
                  </Link>
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center gap-8 pt-4 border-t border-border/50">
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold">24/7</span>
                  <span className="text-sm text-muted-foreground">Disponibilidade</span>
                </div>
                <div className="w-px h-10 bg-border/50" />
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold">100%</span>
                  <span className="text-sm text-muted-foreground">Segurança LGPD</span>
                </div>
                <div className="w-px h-10 bg-border/50" />
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold">4.9/5</span>
                  <span className="text-sm text-muted-foreground">Satisfação</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:h-[600px] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-purple-500/30 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative w-full max-w-md bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-2xl ring-1 ring-white/10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Painel de Controle</h3>
                      <p className="text-xs text-muted-foreground">Análise em tempo real</p>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    Online
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">Análise Cardiovascular</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Leaf className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Metabolismo Basal</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '92%' }}
                        transition={{ duration: 1.5, delay: 0.7 }}
                        className="h-full bg-green-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <span className="text-sm font-medium">Neuro-cognitivo</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '78%' }}
                        transition={{ duration: 1.5, delay: 0.9 }}
                        className="h-full bg-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted border border-border" />
                  <div className="h-8 w-8 rounded-full bg-muted border border-border translate-x-[-15px]" />
                  <div className="h-8 w-8 rounded-full bg-muted border border-border translate-x-[-30px]" />
                  <div className="flex items-center text-xs text-muted-foreground translate-x-[-20px]">
                    +4 Especialistas ativos
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="servicos" className="py-24 bg-muted/50 border-y border-border/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tecnologia Integral</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Uma suite completa de ferramentas de IA para mapear, analisar e otimizar sua saúde biológica.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FileSearch,
                title: "OCR Avançado",
                desc: "Digitalização e estruturação automática de exames laboratoriais e laudos médicos complexos.",
                color: "text-blue-500"
              },
              {
                icon: Brain,
                title: "Motor Multi-Agente",
                desc: "Orquestração inteligente entre 4 especialistas digitais para diagnósticos cruzados.",
                color: "text-purple-500"
              },
              {
                icon: ClipboardList,
                title: "Relatórios Clínicos",
                desc: "Geração de documentos detalhados com insights acionáveis e alertas de risco.",
                color: "text-green-500"
              },
              {
                icon: Calendar,
                title: "Planejamento Vivo",
                desc: "Planos semanais de dieta e treino que se adaptam à sua evolução fisiológica.",
                color: "text-orange-500"
              },
            ].map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="h-full bg-card border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-lg bg-background border border-border flex items-center justify-center mb-4 ${service.color}`}>
                      <service.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed mt-2">{service.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Section */}
      <section id="agentes" className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Corpo Clínico Digital</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Conheça os especialistas de inteligência artificial que dedicarão 100% da atenção ao seu caso.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Medicina Integrativa", role: "Arquiteto de Saúde", icon: Leaf, color: "from-teal-500 to-emerald-500", type: "Foundation" },
              { name: "Endocrinologia", role: "Especialista Metabólico", icon: Activity, color: "from-blue-500 to-indigo-500", type: "Foundation" },
              { name: "Nutrição Funcional", role: "Bioquímico Nutricional", icon: Apple, color: "from-orange-500 to-red-500", type: "Specialized" },
              { name: "Fisiologia", role: "Treinador de Performance", icon: Dumbbell, color: "from-violet-500 to-purple-500", type: "Specialized" },
            ].map((agent, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <div className="group relative h-full bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${agent.color}`} />
                  <div className="p-6 text-center">
                    <div className={`mx-auto h-20 w-20 rounded-full bg-gradient-to-br ${agent.color} p-[2px] mb-6`}>
                      <div className="h-full w-full rounded-full bg-card flex items-center justify-center">
                        <agent.icon className="h-8 w-8 text-foreground" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-1">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{agent.role}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {agent.type} Agent
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Timeline */}
      <section id="como-funciona" className="py-24 bg-muted/30 border-t border-border/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Fluxo de Análise</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Do upload à estratégia de saúde em 4 passos simples.
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 -z-10" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: 1, title: "Upload", desc: "Envio seguro de exames" },
                { step: 2, title: "Processamento", desc: "Estruturação via OCR" },
                { step: 3, title: "Análise", desc: "Consenso Multi-Agente" },
                { step: 4, title: "Plano", desc: "Estratégia Final" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="bg-card md:bg-transparent p-6 md:p-0 rounded-xl border border-border md:border-none relative"
                >
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20 relative z-10">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-center mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground text-center">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary -z-20" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent -z-10" />

        <div className="container mx-auto px-4 lg:px-8 text-center text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Pronto para uma nova era de saúde?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-10 leading-relaxed">
              Junte-se à plataforma mais avançada de bio-inteligência e tome o controle da sua longevidade hoje.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 h-14 px-8 rounded-full text-lg shadow-2xl transition-transform hover:scale-105"
              >
                <Link href="/register">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <div className="flex gap-6 mt-6 sm:mt-0 text-sm font-medium text-primary-foreground/80">
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Plano Gratuito</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Sem cartão</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Medical AI</span>
            </Link>

            <div className="text-sm text-muted-foreground text-center md:text-right">
              <p>&copy; {new Date().getFullYear()} Medical AI v2. Todos os direitos reservados.</p>
              <p className="text-xs mt-1">Apenas para fins informativos. Consulte seu médico.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
