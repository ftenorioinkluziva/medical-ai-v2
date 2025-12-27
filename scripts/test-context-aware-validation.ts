import { validateMentionedParameters } from '@/lib/ai/synthesis/parameter-extractor'

// Texto REAL da análise que estava falhando
const analysisText = `Dados sobre a conversão periférica (T3) não estão disponíveis.

Marcadores Adicionais Sugeridos para Próxima Avaliação:
- T3 Livre, T3 Reverso, Progesterona, DHEA-S, Cortisol salivar, Magnésio eritrocitário.`

// Parâmetros disponíveis (sem T3 ou Cortisol)
const availableParameters = [
  'TSH',
  'T4 LIVRE',
  'HEMOGLOBINA',
  'GLICOSE',
]

console.log('=== TESTE: Validação Context-Aware ===\n')

console.log('📄 TEXTO:')
console.log(analysisText)
console.log('\n')

console.log('📊 PARÂMETROS DISPONÍVEIS:')
console.log(availableParameters.join(', '))
console.log('\n')

console.log('🔍 EXECUTANDO VALIDAÇÃO...\n')

const result = validateMentionedParameters(analysisText, availableParameters)

console.log('📋 RESULTADO:')
console.log(`   Valid: ${result.valid} ${result.valid ? '✅' : '❌'}`)
console.log(`   Hallucinated: [${result.hallucinatedParameters.join(', ')}]`)
console.log(`   Warnings: ${result.warnings.length}`)
result.warnings.forEach(w => console.log(`      ${w}`))

if (result.valid) {
  console.log('\n🎉 SUCESSO!')
  console.log('   A validação agora permite menções contextuais apropriadas:')
  console.log('   - "não disponível"')
  console.log('   - "sugerido para próxima avaliação"')
} else {
  console.log('\n❌ FALHOU!')
  console.log('   A validação ainda está bloqueando menções apropriadas.')
}

console.log('\n=== FIM DO TESTE ===')
