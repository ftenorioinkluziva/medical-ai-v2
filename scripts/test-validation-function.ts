import { validateMentionedParameters } from '@/lib/ai/synthesis/parameter-extractor'

// Texto de exemplo da análise que falhou
const analysisText = `## Análise Integrativa de Saúde, Performance e Metabolismo

Esta análise integra os dados de bioimpedância, exames laboratoriais e informações de estilo de vida para fornecer uma visão holística da saúde metabólica e da performance da paciente.

### Perfil da Paciente

- **Idade:** 44 anos
- **Sexo:** Feminino
- **Peso:** 65.8 kg
- **Altura:** 160 cm
- **IMC:** 26.7 kg/m² (Sobrepeso)
- **Histórico:** Praticante de exercício moderado, 2x por semana.

### Análise da Composição Corporal e Performance

A avaliação da composição corporal é o ponto central para entender o estado metabólico atual. Os dados revelam um quadro clássico de **obesidade sarcopênica**, onde coexistem um excesso de gordura corporal e uma deficiência de massa muscular.

- **Percentual de Gordura Corporal (PGC):** **44.9%**, um valor considerado excessivo e que representa um risco metabólico significativo.
- **Massa de Músculo Esquelético (MME):** **19.4 kg**, classificada como "Abaixo" do esperado para sua idade.`

// Parâmetros disponíveis (sem T3 ou Cortisol)
const availableParameters = [
  'HEMOGLOBINA',
  'HEMATÓCRITO',
  'LEUCÓCITOS',
  'PLAQUETAS',
  'GLICOSE',
  'HBA1C',
  'COLESTEROL TOTAL',
  'HDL',
  'LDL',
  'TRIGLICERÍDEOS',
  'CREATININA',
  'TSH',
  'T4 LIVRE',
  'VITAMINA D',
  'FERRITINA',
]

console.log('=== TESTE DA FUNÇÃO DE VALIDAÇÃO ===\n')

console.log('📄 TEXTO DA ANÁLISE:')
console.log(analysisText)
console.log('\n')

console.log('📊 PARÂMETROS DISPONÍVEIS:')
console.log(availableParameters.join(', '))
console.log('\n')

console.log('🔍 EXECUTANDO VALIDAÇÃO...\n')

const result = validateMentionedParameters(analysisText, availableParameters)

console.log('📋 RESULTADO:')
console.log(`   Valid: ${result.valid}`)
console.log(`   Hallucinated: ${result.hallucinatedParameters.join(', ')}`)
console.log(`   Warnings: ${result.warnings.length}`)
result.warnings.forEach(w => console.log(`      ${w}`))

console.log('\n🔍 BUSCANDO "T3" NO TEXTO:')
const hasT3 = analysisText.toLowerCase().includes('t3')
console.log(`   Contém "t3": ${hasT3}`)

if (hasT3) {
  const index = analysisText.toLowerCase().indexOf('t3')
  const context = analysisText.substring(Math.max(0, index - 50), Math.min(analysisText.length, index + 50))
  console.log(`   Contexto: "${context}"`)
}

console.log('\n🔍 BUSCANDO "Cortisol" NO TEXTO:')
const hasCortisol = analysisText.toLowerCase().includes('cortisol')
console.log(`   Contém "cortisol": ${hasCortisol}`)

if (hasCortisol) {
  const index = analysisText.toLowerCase().indexOf('cortisol')
  const context = analysisText.substring(Math.max(0, index - 50), Math.min(analysisText.length, index + 50))
  console.log(`   Contexto: "${context}"`)
}

console.log('\n=== FIM DO TESTE ===')
