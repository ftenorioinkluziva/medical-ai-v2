/**
 * Synthesis Generator
 * Creates consolidated synthesis from multiple agent analyses
 */

import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { buildParametersContext, validateMentionedParameters, extractAvailableParameters } from './parameter-extractor'

const synthesisSchema = z.object({
  executiveSummary: z.string().describe('Resumo executivo integrando todas as análises em narrativa coesa'),
  keyFindings: z.array(z.string()).describe('Principais achados consolidados (5-7 itens)'),
  criticalAlerts: z.array(z.string()).describe('Alertas críticos que requerem atenção urgente'),
  mainRecommendations: z.array(z.string()).describe('Top 5 recomendações prioritárias'),
})

export type Synthesis = z.infer<typeof synthesisSchema>

interface AgentAnalysis {
  agent: string
  agentKey: string
  analysis: string
}

interface GenerateSynthesisOptions {
  structuredDocuments?: any[]
  enableValidation?: boolean
}

/**
 * Generate consolidated synthesis from multiple agent analyses
 */
export async function generateSynthesis(
  analyses: AgentAnalysis[],
  options: GenerateSynthesisOptions = {}
): Promise<Synthesis> {
  const { structuredDocuments = [], enableValidation = false } = options

  console.log(`🧠 [SYNTHESIS] Generating synthesis from ${analyses.length} analyses...`)
  console.log(`🧠 [SYNTHESIS] Structured documents: ${structuredDocuments.length}`)
  console.log(`🧠 [SYNTHESIS] Validation enabled: ${enableValidation}`)

  // Build context with all analyses
  const context = analyses
    .map(a => `## ${a.agent}\n\n${a.analysis}`)
    .join('\n\n---\n\n')

  // Extract available parameters from structured documents
  let parametersContext = ''
  let availableParameters: string[] = []

  if (structuredDocuments.length > 0) {
    parametersContext = buildParametersContext(structuredDocuments)
    const extracted = extractAvailableParameters(structuredDocuments)
    availableParameters = extracted.allParameters

    console.log(`✅ [SYNTHESIS] Extracted ${availableParameters.length} available parameters`)
    console.log(`   Parameters:`, availableParameters.slice(0, 10).join(', '), '...')
  } else {
    console.warn('⚠️  [SYNTHESIS] No structured documents provided - validation disabled')
    parametersContext = '\n⚠️  **ATENÇÃO:** Dados estruturados não disponíveis. Seja extremamente conservador ao mencionar valores específicos.\n'
  }

  const { object } = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: synthesisSchema,
    prompt: `Você é um coordenador médico senior especializado em medicina integrativa.

${parametersContext}

ANÁLISES DE MÚLTIPLOS ESPECIALISTAS:

${context}

SUA MISSÃO:
Sintetizar as análises acima em um resumo consolidado e coeso que integre as perspectivas de todos os especialistas.

REGRAS CRÍTICAS:
1. ✅ INTEGRE os insights de todos os especialistas em uma narrativa coesa
2. ✅ IDENTIFIQUE padrões comuns e convergências entre as análises
3. ✅ DESTAQUE áreas onde os especialistas se complementam
4. ✅ RESOLVA conflitos usando hierarquia médica e evidências
5. ✅ PRIORIZE alertas críticos e achados que requerem ação urgente
6. ✅ EVITE repetição - se múltiplos agentes mencionaram o mesmo, consolide em 1 item
7. ✅ FOQUE em insights acionáveis e relevantes clinicamente

🚨 REGRAS DE VALIDAÇÃO DE DADOS - EXTREMAMENTE IMPORTANTE:

**O QUE É PROIBIDO:**
1. ❌ NUNCA invente valores de parâmetros que NÃO estão na lista "PARÂMETROS DISPONÍVEIS"
2. ❌ NUNCA afirme que um parâmetro está alto/baixo/normal se ele não foi testado
3. ❌ NÃO confunda substrings de palavras (ex: "BASTOS" não é "AST", "BASTONETES" não é "TGO")
4. ❌ NUNCA infira valores aproximados de exames não realizados

**O QUE É PERMITIDO:**
1. ✅ Mencionar parâmetros NÃO disponíveis para RECOMENDAR exames futuros
   - Exemplo: "Recomenda-se solicitar T3 Livre e T3 Reverso no próximo ciclo"
2. ✅ Mencionar parâmetros NÃO disponíveis explicitando que NÃO foram testados
   - Exemplo: "(T3 Livre e T3 Reverso: não disponíveis)"
   - Exemplo: "T4 Livre foi medido, porém T3 Livre não foi testado"
3. ✅ Citar valores EXATOS como aparecem nos parâmetros disponíveis
4. ✅ Se múltiplos agentes mencionaram um parâmetro que NÃO está disponível, QUESTIONE e ignore
5. ✅ Prefira dizer "dados insuficientes" a fazer suposições

**ATENÇÃO ESPECIAL:** Se você encontrar menções a TGO, AST, ou outros marcadores nas análises dos especialistas,
VERIFIQUE na lista de parâmetros disponíveis se esses exames foram realmente realizados.
Palavras como "BASTOS" (nome) ou "BASTONETES" (células) NÃO são marcadores hepáticos!

FORMATO DE SAÍDA:

**Executive Summary:**
- Escreva UM parágrafo narrativo (150-200 palavras) que conte a "história clínica" do paciente
- Integre os principais pontos de TODAS as análises
- Destaque as conexões entre diferentes áreas (ex: metabolismo → exercício → nutrição)
- Termine com direcionamento claro do que precisa ser feito

**Key Findings:**
- Liste 5-7 achados principais CONSOLIDADOS
- Cada achado deve integrar insights de múltiplos especialistas quando possível
- Priorize por relevância clínica e impacto na saúde
- Use formato: "[Área] - Descrição do achado"

**Critical Alerts:**
- APENAS alertas que requerem ação médica urgente ou imediata
- Valores críticos, riscos sérios, contraindicações importantes
- Se não houver alertas críticos, retorne array vazio
- Máximo de 3 alertas (foque no mais urgente)

**Main Recommendations:**
- Top 5 recomendações prioritárias que integrem as visões dos especialistas
- Cada recomendação deve ser específica e acionável
- Priorize ações com maior impacto na saúde do paciente
- Ordene por urgência/importância

IMPORTANTE:
- Mantenha tom profissional mas acessível
- Use linguagem clara (evite jargão excessivo)
- Foque em ações práticas e mensuráveis
- Esta síntese será lida pelo paciente e médico

Gere a síntese consolidada.`,
  })

  console.log('✅ [SYNTHESIS] Synthesis generated successfully')

  // Validate synthesis if enabled and parameters available
  if (enableValidation && availableParameters.length > 0) {
    console.log('🔍 [SYNTHESIS] Validating synthesis for hallucinated parameters...')

    const synthesisText = JSON.stringify(object)
    const validation = validateMentionedParameters(synthesisText, availableParameters)

    if (!validation.valid) {
      console.error('❌ [SYNTHESIS] VALIDATION FAILED - Hallucinated parameters detected!')
      console.error('   Hallucinated:', validation.hallucinatedParameters)
      validation.warnings.forEach(w => console.error('   ', w))

      // Log detailed error for debugging
      console.error('\n📋 [SYNTHESIS] Synthesis content with hallucinations:')
      console.error(JSON.stringify(object, null, 2))

      throw new Error(
        `Synthesis validation failed: Mentioned parameters that don't exist in documents: ${validation.hallucinatedParameters.join(', ')}. ` +
        `This indicates AI hallucination. Please review the synthesis generation logic.`
      )
    } else {
      console.log('✅ [SYNTHESIS] Validation passed - no hallucinated parameters detected')
    }
  } else {
    console.warn('⚠️  [SYNTHESIS] Validation skipped (disabled or no parameters available)')
  }

  return object
}
