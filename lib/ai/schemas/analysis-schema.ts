/**
 * Zod schema for structured agent analysis output
 */

import { z } from 'zod'

/**
 * Schema for structured analysis output
 * Ensures AI generates analysis with insights and action items
 */
export const structuredAnalysisSchema = z.object({
  // Main narrative analysis (comprehensive explanation)
  analysis: z.string()
    .describe(`Análise médica completa e detalhada em formato MARKDOWN bem estruturado.

FORMATAÇÃO OBRIGATÓRIA:
- Use headings (##) para separar seções principais
- Use sub-headings (###) para sub-seções quando necessário
- Use **negrito** para destacar valores, achados importantes e termos clínicos
- Use bullet points (-) para listas e enumerações
- Use linha em branco entre parágrafos para melhor legibilidade
- Organize o texto em seções claras conforme o analysisPrompt do agente
- Seja abrangente, profissional e baseado em evidências

A análise deve ser fácil de ler e visualmente organizada.`),

  // Key insights (3-7 bullet points)
  insights: z.array(z.string())
    .min(3)
    .max(7)
    .describe('Lista de 3 a 7 principais insights e achados clínicos ESPECÍFICOS DA SUA ESPECIALIDADE. Cada insight deve ser claro, único, clinicamente relevante e NÃO repetir informações que outros especialistas já mencionaram.'),

  // Action items (3-7 recommendations)
  actionItems: z.array(z.string())
    .min(3)
    .max(7)
    .describe('Lista de 3 a 7 recomendações práticas e acionáveis ESPECÍFICAS DA SUA ÁREA DE EXPERTISE. Devem ser específicas, mensuráveis, implementáveis e DIFERENTES das recomendações de outros especialistas.'),
})

export type StructuredAnalysis = z.infer<typeof structuredAnalysisSchema>

/**
 * Example of expected output:
 *
 * {
 *   analysis: "O paciente apresenta um quadro de resistência à insulina moderada...",
 *   insights: [
 *     "HOMA-IR elevado (2,5) indica resistência à insulina estabelecida",
 *     "HDL baixo (35 mg/dL) aumenta risco cardiovascular",
 *     "Vitamina D deficiente (18 ng/mL) pode agravar quadro metabólico"
 *   ],
 *   actionItems: [
 *     "Iniciar suplementação de Vitamina D3 5000 UI/dia com K2",
 *     "Implementar dieta low-carb (< 100g carboidratos/dia)",
 *     "Exercício aeróbico moderado 150 min/semana (Zona 2)"
 *   ]
 * }
 */
