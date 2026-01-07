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

const mealDefinitionSchema = z.object({
  name: z.string().describe('Nome curto da refeição (máx 5 palavras)'),
  ingredients: z.array(z.string()).describe('Lista de ingredientes (máx 5 itens)'),
  instructions: z.string().describe('Instruções EXTREMAMENTE curtas (máx 20 palavras)'),
  calories: z.string().describe('Ex: "450 kcal"'),
  macros: z.object({
    fats: z.string().describe('Ex: "15g"'),
    carbs: z.string().describe('Ex: "45g"'),
    protein: z.string().describe('Ex: "30g"'),
  }).optional().describe('Macronutrientes'),
})

const mealPlanSchema = z.object({
  overview: z.string().describe('Visão geral da estratégia nutricional da semana'),
  daily_calories_avg: z.string().describe('Média de calorias diárias (ex: "2100 kcal")'),
  weekly_plan: z.array(
    z.object({
      day: z.string().describe('Dia da semana por extenso (ex: "Segunda-feira")'),
      meals: z.object({
        breakfast: mealDefinitionSchema,
        morning_snack: mealDefinitionSchema,
        lunch: mealDefinitionSchema,
        afternoon_snack: mealDefinitionSchema,
        pre_workout: mealDefinitionSchema,
        post_workout: mealDefinitionSchema,
        dinner: mealDefinitionSchema,
        supper: mealDefinitionSchema,
      }),
    })
  ).describe('Plano detalhado para os 7 dias da semana'),
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

    analysisPrompt: `Baseado na análise médica, elabore uma estratégia de suplementação e suporte hormonal.

REGRAS DE OURO:
1. Máximo 8 suplementos no total.
2. Dose e timing: Seja extremamente curto (ex: "5g ao acordar").
3. Propósito: Máximo 10 palavras.
4. Use SOMENTE o que for necessário para o ciclo atual.`,

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

    analysisPrompt: `Crie uma lista de compras prática baseada na análise.

REGRAS DE OURO:
1. Máximo 5 itens por categoria.
2. Nome do item: Máximo 3 palavras.
3. Quantidade: Curta (ex: "500g", "1 bandeja").
4. Liste apenas o essencial para o plano alimentar.`,

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

    analysisPrompt: `Crie um plano alimentar para 7 dias baseado na análise médica.

ESTRUTURA OBRIGATÓRIA (7 refeições/dia):
- Café da manhã, Lanche manhã, Almoço, Lanche tarde, Pré-treino, Pós-treino, Jantar, Ceia.

REGRAS DE OURO PARA CONCISÃO (VITAL para evitar erros de truncagem):
1. Nome do prato: Máximo 5 palavras.
2. Ingredientes: Máximo 5 itens.
3. Instruções: Máximo 20 palavras por prato.
4. TUDO em português e ingredientes brasileiros.
5. Macros e calorias por refeição são obrigatórios.`,

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
