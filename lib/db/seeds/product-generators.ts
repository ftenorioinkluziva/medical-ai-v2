/**
 * Seed Product Generators
 * Populates database with 5 product generators (4 weekly plan + 1 recommendations)
 * Converts existing Zod schemas to JSON Schema format
 */

import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'
import { z } from 'zod'
import { zodToJsonSchema } from '@/lib/ai/core/schema-converter'

// ============================================
// SCHEMAS (copied from existing generators)
// ============================================

// 1. Supplementation Schema
const supplementationSchema = z.object({
  overview: z.string().describe('Visão geral da estratégia de suplementação'),
  supplements: z.array(
    z.object({
      name: z.string().describe('Nome do suplemento'),
      dosage: z.string().describe('Dosagem recomendada'),
      timing: z.string().describe('Horário/momento de tomar'),
      purpose: z.string().describe('Propósito/benefício esperado'),
      duration: z.string().optional().describe('Duração do uso'),
    })
  ).describe('Lista de suplementos recomendados'),
  hormonalSupport: z.array(
    z.object({
      hormone: z.string().describe('Hormônio a ser equilibrado'),
      strategy: z.string().describe('Estratégia de reposição/suporte'),
      monitoring: z.string().describe('Como monitorar'),
    })
  ).optional().describe('Estratégias de suporte hormonal'),
  nextExamRecommendations: z.array(z.string()).optional().describe('Exames para o próximo ciclo'),
})

// 2. Shopping List Schema
const shoppingListSchema = z.object({
  overview: z.string().describe('Visão geral da lista'),
  categories: z.array(
    z.object({
      category: z.string().describe('Categoria (ex: Proteínas, Vegetais, Frutas)'),
      items: z.array(
        z.object({
          item: z.string().describe('Nome do item'),
          quantity: z.string().optional().describe('Quantidade sugerida'),
          notes: z.string().optional().describe('Observações'),
          priority: z.enum(['high', 'medium', 'low']).optional(),
        })
      ),
    })
  ).describe('Categorias de compras'),
  estimatedCost: z.string().optional().describe('Custo estimado total'),
  tips: z.array(z.string()).optional().describe('Dicas de compra'),
})

// 3. Meal Plan Schema
const mealSchema = z.object({
  name: z.string().describe('Nome da refeição'),
  ingredients: z.array(z.string()).describe('Ingredientes'),
  calories: z.string().optional().describe('Calorias aproximadas'),
  prepTime: z.string().optional().describe('Tempo de preparo'),
})

const mealPlanSchema = z.object({
  overview: z.string().describe('Visão geral do plano alimentar'),
  dailyCalories: z.string().optional().describe('Calorias diárias'),
  macros: z.object({
    protein: z.string().optional(),
    carbs: z.string().optional(),
    fats: z.string().optional(),
  }).optional().describe('Distribuição de macronutrientes'),
  meals: z.array(
    z.object({
      day: z.string().describe('Dia da semana'),
      breakfast: mealSchema,
      lunch: mealSchema,
      dinner: mealSchema,
      snacks: z.array(
        z.object({
          name: z.string(),
          timing: z.string(),
          calories: z.string().optional(),
        })
      ).optional(),
    })
  ).describe('Plano de refeições para cada dia'),
  mealPrepTips: z.array(z.string()).optional().describe('Dicas de preparo'),
})

// 4. Workout Plan Schema
const workoutPlanSchema = z.object({
  overview: z.string().describe('Visão geral do plano de treino'),
  weeklyGoal: z.string().optional().describe('Meta da semana'),
  workouts: z.array(
    z.object({
      day: z.string().describe('Dia da semana'),
      type: z.string().describe('Tipo de treino (Cardio, Força, HIIT, etc)'),
      duration: z.string().describe('Duração total'),
      intensity: z.enum(['low', 'medium', 'high']).optional(),
      exercises: z.array(
        z.object({
          name: z.string(),
          sets: z.string().optional(),
          reps: z.string().optional(),
          duration: z.string().optional(),
          notes: z.string().optional(),
        })
      ),
      warmup: z.string().optional().describe('Aquecimento'),
      cooldown: z.string().optional().describe('Alongamento/resfriamento'),
    })
  ).describe('Treinos da semana'),
  restDays: z.array(z.string()).optional().describe('Dias de descanso'),
  progressionTips: z.array(z.string()).optional().describe('Dicas de progressão'),
})

// 5. Recommendations Schema
const recommendationsSchema = z.object({
  examRecommendations: z.array(z.object({
    exam: z.string(),
    reason: z.string(),
    urgency: z.enum(['high', 'medium', 'low']),
    suggestedTimeframe: z.string(),
  })),
  lifestyleRecommendations: z.array(z.object({
    category: z.enum(['exercise', 'nutrition', 'sleep', 'stress', 'hydration', 'habits']),
    recommendation: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    expectedBenefit: z.string(),
  })),
  healthGoals: z.array(z.object({
    goal: z.string(),
    currentStatus: z.string(),
    targetValue: z.string(),
    timeframe: z.string(),
    actionSteps: z.array(z.string()),
  })),
  alerts: z.array(z.object({
    type: z.enum(['urgent', 'warning', 'info']),
    message: z.string(),
    action: z.string(),
  })),
})

// ============================================
// GENERATOR DEFINITIONS
// ============================================

export const productGenerators = [
  // 1. Supplementation Generator
  {
    agentKey: 'supplementation',
    agentType: 'product_generator' as const,
    productType: 'weekly_plan' as const,
    generatorKey: 'supplementation',

    name: 'Suplementação',
    title: 'Gerador de Plano de Suplementação',
    description: 'Gera estratégia completa de suplementação nutricional e reposição hormonal baseada nas análises médicas.',

    color: 'purple',
    icon: 'pill',

    systemPrompt: 'Você é um médico especialista em medicina integrativa e nutrição funcional.',

    analysisPrompt: `Baseado na análise médica, elabore uma estratégia completa de suplementação e reposição hormonal para a próxima semana/mês até o próximo exame.

INSTRUÇÕES:
1. Liste suplementos específicos com dosagens, horários e propósitos
2. Se houver indicações hormonais, inclua estratégias de suporte/reposição
3. Recomende exames para monitoramento futuro
4. Seja específico e prático
5. Considere interações e contraindicações
6. Priorize segurança e evidências científicas

IMPORTANTE: Esta é uma orientação educacional. O paciente deve consultar um médico antes de iniciar qualquer suplementação.`,

    outputSchema: zodToJsonSchema(supplementationSchema),

    ragConfig: {
      enabled: true,
      keywords: ['suplementação', 'reposição hormonal', 'vitaminas', 'minerais', 'nutrição funcional'],
      maxChunks: 3,
      maxCharsPerChunk: 1200,
    },

    modelName: 'gemini-2.5-flash',
    modelConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000,
    },

    executionOrder: 1,
    allowedRoles: ['doctor', 'admin'],
    isActive: true,
    displayOrder: 100,
  },

  // 2. Shopping List Generator
  {
    agentKey: 'shopping',
    agentType: 'product_generator' as const,
    productType: 'weekly_plan' as const,
    generatorKey: 'shopping',

    name: 'Lista de Compras',
    title: 'Gerador de Lista de Compras Saudável',
    description: 'Gera lista de compras personalizada baseada nas necessidades nutricionais identificadas.',

    color: 'green',
    icon: 'shopping-cart',

    systemPrompt: 'Você é um nutricionista especializado em planejamento alimentar prático.',

    analysisPrompt: `Baseado na análise médica e nas necessidades nutricionais identificadas, crie uma lista de compras completa e prática para a semana.

INSTRUÇÕES:
1. Organize por categorias (Proteínas, Vegetais, Frutas, Grãos, etc)
2. Sugira quantidades apropriadas para uma semana
3. Priorize alimentos que atendam as necessidades específicas identificadas
4. Inclua dicas de escolha e conservação
5. Considere praticidade e disponibilidade
6. Indique estimativa de custo se possível

Seja prático e realista.`,

    outputSchema: zodToJsonSchema(shoppingListSchema),

    ragConfig: {
      enabled: true,
      keywords: ['alimentação saudável', 'nutrição', 'lista de compras', 'alimentos funcionais'],
      maxChunks: 2,
      maxCharsPerChunk: 1000,
    },

    modelName: 'gemini-2.5-flash',
    modelConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000,
    },

    executionOrder: 2,
    allowedRoles: ['doctor', 'admin'],
    isActive: true,
    displayOrder: 101,
  },

  // 3. Meal Plan Generator
  {
    agentKey: 'meals',
    agentType: 'product_generator' as const,
    productType: 'weekly_plan' as const,
    generatorKey: 'meals',

    name: 'Plano de Refeições',
    title: 'Gerador de Plano Alimentar Semanal',
    description: 'Gera plano completo de refeições para a semana com receitas práticas e balanceadas.',

    color: 'orange',
    icon: 'utensils',

    systemPrompt: 'Você é um nutricionista especializado em planejamento de refeições e culinária saudável.',

    analysisPrompt: `Baseado na análise médica e nas necessidades nutricionais, crie um plano de refeições completo para 7 dias.

INSTRUÇÕES:
1. Inclua café da manhã, almoço, jantar e lanches
2. Especifique ingredientes e modo de preparo
3. Considere as necessidades nutricionais específicas identificadas
4. Varie as opções ao longo da semana
5. Indique calorias aproximadas e macronutrientes
6. Seja prático e realista quanto ao preparo
7. Inclua dicas de meal prep

Foque em refeições saborosas, nutritivas e fáceis de preparar.`,

    outputSchema: zodToJsonSchema(mealPlanSchema),

    ragConfig: {
      enabled: true,
      keywords: ['nutrição', 'receitas saudáveis', 'planejamento alimentar', 'macronutrientes'],
      maxChunks: 3,
      maxCharsPerChunk: 1200,
    },

    modelName: 'gemini-2.5-flash',
    modelConfig: {
      temperature: 0.8,
      maxOutputTokens: 3000,
    },

    executionOrder: 3,
    allowedRoles: ['doctor', 'admin'],
    isActive: true,
    displayOrder: 102,
  },

  // 4. Workout Plan Generator
  {
    agentKey: 'workout',
    agentType: 'product_generator' as const,
    productType: 'weekly_plan' as const,
    generatorKey: 'workout',

    name: 'Plano de Treino',
    title: 'Gerador de Plano de Exercícios Semanal',
    description: 'Gera plano de treinos personalizado baseado nas condições de saúde e objetivos.',

    color: 'blue',
    icon: 'dumbbell',

    systemPrompt: 'Você é um educador físico e fisiologista do exercício especializado em prescrição personalizada de atividade física.',

    analysisPrompt: `Baseado na análise médica, condições de saúde e objetivos, crie um plano de treino completo e seguro para a semana.

INSTRUÇÕES:
1. Considere TODAS as condições médicas e limitações identificadas
2. Especifique tipo de treino, duração e intensidade para cada dia
3. Detalhe exercícios com séries, repetições ou duração
4. Inclua aquecimento e alongamento
5. Indique dias de descanso apropriados
6. Forneça dicas de progressão segura
7. Priorize SEGURANÇA acima de tudo

Se houver contraindicações, adapte ou exclua exercícios conforme necessário.
NUNCA prescreva exercícios inadequados para as condições do paciente.`,

    outputSchema: zodToJsonSchema(workoutPlanSchema),

    ragConfig: {
      enabled: true,
      keywords: ['exercício físico', 'treino', 'atividade física', 'prescrição de exercícios'],
      maxChunks: 3,
      maxCharsPerChunk: 1200,
    },

    modelName: 'gemini-2.5-flash',
    modelConfig: {
      temperature: 0.7,
      maxOutputTokens: 2500,
    },

    executionOrder: 4,
    allowedRoles: ['doctor', 'admin'],
    isActive: true,
    displayOrder: 103,
  },

  // 5. Recommendations Generator
  {
    agentKey: 'recommendations',
    agentType: 'product_generator' as const,
    productType: 'recommendations' as const,
    generatorKey: 'recommendations',

    name: 'Recomendações',
    title: 'Gerador de Recomendações Integradas',
    description: 'Gera recomendações consolidadas de exames, lifestyle, metas e alertas baseadas em múltiplas análises.',

    color: 'indigo',
    icon: 'clipboard-list',

    systemPrompt: 'Você é um coordenador médico especializado em medicina integrativa.',

    analysisPrompt: `CONTEXTO MULTI-ESPECIALIDADE:
Você tem acesso a análises de múltiplos especialistas diferentes.

SUA MISSÃO:
Gere recomendações que INTEGREM e HARMONIZEM as perspectivas de todos os especialistas.

REGRAS CRÍTICAS DE INTEGRAÇÃO:
1. ✅ SINTETIZE insights comuns entre os especialistas
2. ✅ IDENTIFIQUE SINERGIAS entre diferentes áreas
3. ✅ RESOLVA CONFLITOS usando hierarquia médica e evidências
4. ✅ EVITE DUPLICAÇÃO absoluta
5. ✅ PRIORIZE por impacto consolidado
6. ✅ USE a knowledge base para fundamentar decisões

Gere recomendações nas seguintes categorias:

1. **Exames Recomendados**: Consolide exames sugeridos por diferentes especialistas
2. **Recomendações de Lifestyle**: Integre sugestões de exercício + nutrição + sono + estresse
3. **Metas de Saúde**: Crie metas que integrem múltiplas análises
4. **Alertas**: Consolide alertas críticos de todos os agentes

DIRETRIZES IMPORTANTES:
- Base TODAS as recomendações nas análises fornecidas
- Utilize as referências da base de conhecimento para fundamentar
- Seja específico e prático - evite recomendações genéricas
- Priorize ações baseadas em evidências científicas
- Use linguagem clara, acessível e encorajadora
- Foque em recomendações acionáveis que o paciente pode implementar
- SEMPRE mantenha postura educacional - não substitui consulta médica
- Mencione quando há CONSENSO entre especialistas (isso aumenta confiança)`,

    outputSchema: zodToJsonSchema(recommendationsSchema),

    ragConfig: {
      enabled: true,
      keywords: ['recomendações', 'exames', 'lifestyle', 'metas de saúde', 'medicina preventiva'],
      maxChunks: 7,
      maxCharsPerChunk: 1500,
    },

    modelName: 'gemini-2.5-flash',
    modelConfig: {
      temperature: 0.7,
      maxOutputTokens: 3000,
    },

    executionOrder: 5,
    allowedRoles: ['doctor', 'admin'],
    isActive: true,
    displayOrder: 104,
  },
]

/**
 * Seed product generators to database
 */
export async function seedProductGenerators() {
  console.log('🌱 Seeding product generators...\n')

  for (const generator of productGenerators) {
    console.log(`  📦 Inserting: ${generator.name} (${generator.generatorKey})`)

    await db.insert(healthAgents).values(generator).onConflictDoNothing()
  }

  console.log(`\n✅ Seeded ${productGenerators.length} product generators!`)
}

// Execute if run directly (simplified check for tsx compatibility)
const isMainModule = process.argv[1]?.includes('product-generators')

if (isMainModule) {
  console.log('🚀 Starting seed execution...')

  seedProductGenerators()
    .then(() => {
      console.log('\n🎉 Seeding completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:')
      console.error(error)
      process.exit(1)
    })
} else {
  console.log('ℹ️  Not executing seed (imported as module)')
}
