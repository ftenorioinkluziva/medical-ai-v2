/**
 * Test structured analysis implementation
 */

import { generateStructuredMedicalAnalysis } from '@/lib/ai/core/generate'

async function testStructuredAnalysis() {
  try {
    console.log('🧪 Testing structured analysis implementation...\n')

    const systemPrompt = `Você é um médico especialista em medicina integrativa.
Analise os dados fornecidos e retorne uma análise estruturada com:
1. Análise completa (texto narrativo)
2. Principais insights (3-7 pontos)
3. Itens de ação (3-7 recomendações)`

    const userPrompt = `Paciente de 44 anos com os seguintes exames:
- Glicose: 90 mg/dL
- HbA1c: 4,9%
- Colesterol Total: 214 mg/dL
- HDL: 36 mg/dL (BAIXO)
- LDL: 160 mg/dL (ALTO)
- Triglicerídeos: 117 mg/dL
- Vitamina D: 17 ng/mL (DEFICIENTE)`

    console.log('📊 Generating structured analysis...\n')

    const result = await generateStructuredMedicalAnalysis(
      systemPrompt,
      userPrompt,
      undefined,
      {
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        maxTokens: 4096,
      }
    )

    console.log('\n✅ STRUCTURED ANALYSIS GENERATED!\n')
    console.log('=' .repeat(60))
    console.log('📝 ANALYSIS (first 300 chars):')
    console.log('=' .repeat(60))
    console.log(result.analysis.substring(0, 300) + '...\n')

    console.log('=' .repeat(60))
    console.log('💡 INSIGHTS:')
    console.log('=' .repeat(60))
    result.insights.forEach((insight, i) => {
      console.log(`${i + 1}. ${insight}`)
    })
    console.log()

    console.log('=' .repeat(60))
    console.log('🎯 ACTION ITEMS:')
    console.log('=' .repeat(60))
    result.actionItems.forEach((item, i) => {
      console.log(`${i + 1}. ${item}`)
    })
    console.log()

    console.log('=' .repeat(60))
    console.log('📊 METADATA:')
    console.log('=' .repeat(60))
    console.log(`Model: ${result.model}`)
    console.log(`Tokens used: ${result.usage.totalTokens}`)
    console.log(`Processing time: ${result.metadata.processingTimeMs}ms`)
    console.log()

    console.log('✅ TEST SUCCESSFUL! Structured output is working correctly.')
  } catch (error) {
    console.error('❌ TEST FAILED:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

testStructuredAnalysis()
