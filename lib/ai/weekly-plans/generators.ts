/**
 * Weekly Plan Generators
 * AI functions to generate personalized weekly plans
 */

import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { buildKnowledgeContext } from '../knowledge'

// Schema for Supplementation Strategy
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

// Schema for Shopping List
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

// Schema for Meal Plan
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

// Schema for Workout Plan
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

/**
 * Generate supplementation strategy based on analysis
 */
export async function generateSupplementationStrategy(analysisText: string) {
  console.log('💊 [WEEKLY-PLAN] Generating supplementation strategy...')

  const knowledgeContext = await buildKnowledgeContext(
    'suplementação nutricional reposição hormonal vitaminas minerais',
    { maxChunks: 3, maxCharsPerChunk: 1200 }
  )

  const result = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: supplementationSchema,
    maxTokens: 3000, // Limit output to prevent infinite generation
    prompt: `Você é um médico especialista em medicina integrativa e nutrição funcional.

Baseado na análise médica abaixo, elabore uma estratégia completa de suplementação e reposição hormonal para a próxima semana/mês até o próximo exame.

ANÁLISE MÉDICA:
${analysisText}

${knowledgeContext ? `\nBASE DE CONHECIMENTO:\n${knowledgeContext}` : ''}

INSTRUÇÕES:
1. Liste suplementos específicos com dosagens, horários e propósitos
2. Se houver indicações hormonais, inclua estratégias de suporte/reposição
3. Recomende exames para monitoramento futuro
4. Seja específico e prático
5. Considere interações e contraindicações
6. Priorize segurança e evidências científicas

IMPORTANTE: Esta é uma orientação educacional. O paciente deve consultar um médico antes de iniciar qualquer suplementação.`,
  })

  console.log('✅ [WEEKLY-PLAN] Supplementation strategy generated')
  console.log(`📊 [WEEKLY-PLAN] Supplementation tokens: ${result.usage?.totalTokens || 0}`)
  return { object: result.object, usage: result.usage }
}

/**
 * Generate shopping list based on analysis
 */
export async function generateShoppingList(analysisText: string) {
  console.log('🛒 [WEEKLY-PLAN] Generating shopping list...')

  const result = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: shoppingListSchema,
    maxTokens: 2000, // Limit output to prevent infinite generation
    prompt: `Você é um nutricionista brasileiro especializado em alimentação funcional.

Baseado na análise médica abaixo, elabore uma lista de compras semanal completa com alimentos BRASILEIROS facilmente encontrados em supermercados como Carrefour, Pão de Açúcar, Extra, ou mercados locais.

ANÁLISE MÉDICA:
${analysisText}

INSTRUÇÕES IMPORTANTES:
1. Use SOMENTE alimentos disponíveis no Brasil e fáceis de encontrar
2. Organize por categorias (Proteínas, Vegetais, Frutas, Grãos, Laticínios, etc)
3. Inclua quantidades aproximadas para uma semana (ex: "500g", "1 kg", "1 maço", "1 dúzia")
4. Priorize alimentos da culinária brasileira (ex: arroz integral, feijão, tapioca, mandioca, frutas tropicais)
5. Inclua marcas brasileiras quando relevante (ex: "Leite desnatado Itambé ou similar")
6. Considere preços acessíveis e disponibilidade no Brasil
7. Adicione dicas práticas para comprar em mercados brasileiros

EXEMPLOS DE ALIMENTOS BRASILEIROS:
- Proteínas: frango, carne bovina, peixe (tilápia, salmão), ovos, queijo minas
- Grãos: arroz integral, feijão (carioca, preto), lentilha, quinoa
- Vegetais: alface, tomate, cenoura, brócolis, couve, abobrinha
- Frutas: banana, maçã, laranja, mamão, abacate, manga, açaí
- Outros: tapioca, mandioca, batata-doce, aveia

Crie uma lista REALISTA para o contexto brasileiro.`,
  })

  console.log('✅ [WEEKLY-PLAN] Shopping list generated')
  console.log(`📊 [WEEKLY-PLAN] Shopping list tokens: ${result.usage?.totalTokens || 0}`)
  return { object: result.object, usage: result.usage }
}

/**
 * Generate meal plan based on analysis
 */
export async function generateMealPlan(analysisText: string) {
  console.log('🍽️ [WEEKLY-PLAN] Generating meal plan...')

  const knowledgeContext = await buildKnowledgeContext(
    'nutrição funcional alimentação saudável plano alimentar',
    { maxChunks: 3, maxCharsPerChunk: 1200 }
  )

  const result = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: mealPlanSchema,
    maxTokens: 4000, // Limit output to prevent infinite generation
    prompt: `Você é um nutricionista brasileiro especializado em medicina funcional e culinária brasileira.

Baseado na análise médica abaixo, crie um plano alimentar completo para a semana (7 dias) com café da manhã, almoço, jantar e lanches, usando PRATOS E INGREDIENTES DA CULINÁRIA BRASILEIRA.

ANÁLISE MÉDICA:
${analysisText}

${knowledgeContext ? `\nBASE DE CONHECIMENTO:\n${knowledgeContext}` : ''}

INSTRUÇÕES IMPORTANTES:
1. Use SOMENTE receitas e ingredientes brasileiros, fáceis de encontrar e preparar
2. Inclua pratos típicos brasileiros saudáveis (ex: arroz integral com feijão, tapioca, pão de queijo fit, baião de dois, moqueca, escondidinho)
3. Use proteínas comuns no Brasil: frango, carne bovina, peixe (tilápia, salmão), ovos
4. Inclua acompanhamentos brasileiros: arroz integral, feijão, farofa, vinagrete, saladas tropicais
5. Use frutas tropicais brasileiras: açaí, manga, mamão, banana, abacate, maracujá
6. Café da manhã brasileiro: tapioca, pão integral, ovos, frutas, iogurte, café com leite
7. Inclua calorias aproximadas e tempo de preparo realista
8. Considere objetivos de saúde mantendo sabor brasileiro
9. Adicione 1-2 lanches brasileiros por dia (ex: castanhas, frutas, iogurte)
10. Inclua dicas de meal prep adaptadas ao contexto brasileiro

EXEMPLOS DE REFEIÇÕES BRASILEIRAS SAUDÁVEIS:
- Café: Tapioca recheada, omelete com queijo minas, mingau de aveia com frutas
- Almoço: Frango grelhado com arroz integral e feijão preto, salada verde com vinagrete
- Jantar: Peixe assado com legumes e purê de batata-doce, salada de folhas
- Lanches: Açaí com granola, banana com pasta de amendoim, queijo minas com tomate

Crie um cardápio SABOROSO, PRÁTICO e REALISTA para o brasileiro preparar em casa!`,
  })

  console.log('✅ [WEEKLY-PLAN] Meal plan generated')
  console.log(`📊 [WEEKLY-PLAN] Meal plan tokens: ${result.usage?.totalTokens || 0}`)
  return { object: result.object, usage: result.usage }
}

/**
 * Generate workout plan based on analysis
 */
export async function generateWorkoutPlan(analysisText: string) {
  console.log('💪 [WEEKLY-PLAN] Generating workout plan...')

  const knowledgeContext = await buildKnowledgeContext(
    'exercício físico treinamento atividade física',
    { maxChunks: 3, maxCharsPerChunk: 1200 }
  )

  const result = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: workoutPlanSchema,
    maxTokens: 4000, // Limit output to prevent infinite generation
    prompt: `Você é um fisiologista do exercício e personal trainer especializado em saúde integrativa.

Baseado na análise médica abaixo, crie um plano de treinamento semanal personalizado.

ANÁLISE MÉDICA:
${analysisText}

${knowledgeContext ? `\nBASE DE CONHECIMENTO:\n${knowledgeContext}` : ''}

INSTRUÇÕES IMPORTANTES:
1. Crie treinos para 3-5 dias da semana (considere nível de condicionamento)
2. Inclua variedade: cardio, força, flexibilidade
3. Especifique exercícios, séries, repetições, duração de forma CONCISA
4. Adapte à condição física e objetivos do paciente
5. Inclua aquecimento e alongamento
6. Respeite limitações e contraindicações mencionadas
7. Adicione dicas de progressão BREVES (1-2 frases por exercício)
8. Defina dias de descanso adequados

REGRAS DE FORMATAÇÃO:
- Seja CONCISO e OBJETIVO
- Máximo 100 palavras por descrição de exercício
- Use frases curtas e diretas
- NÃO repita instruções
- NÃO adicione texto motivacional excessivo

Crie um plano SEGURO, PROGRESSIVO e PRÁTICO.`,
  })

  console.log('✅ [WEEKLY-PLAN] Workout plan generated')
  console.log(`📊 [WEEKLY-PLAN] Workout plan tokens: ${result.usage?.totalTokens || 0}`)
  return { object: result.object, usage: result.usage }
}
