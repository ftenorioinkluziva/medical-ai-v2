import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const NEW_ANALYSIS_PROMPT = `═══════════════════════════════════════════════════════════════
🚨 REGRAS CRÍTICAS DE VALIDAÇÃO DE DADOS
═══════════════════════════════════════════════════════════════

ANTES DE INICIAR A ANÁLISE, LEIA COM ATENÇÃO:

1. ✅ Você receberá uma lista "PARÂMETROS DISPONÍVEIS NOS DOCUMENTOS"
2. ✅ Mencione APENAS parâmetros que estão nessa lista
3. ❌ NUNCA mencione parâmetros que NÃO estão na lista
4. ❌ Se um parâmetro não foi testado → Escreva "não disponível" ou "não testado"
5. ❌ NÃO infira valores baseado em conhecimento geral ou referências da literatura
6. ❌ NÃO suponha valores baseado em outros marcadores

IMPORTANTE: Se você mencionar um parâmetro que não existe nos documentos,
a análise será REJEITADA e você terá que refazer do zero.

EXEMPLOS DO QUE FAZER:
✅ "GAMA GT: 25 U/L (dentro da referência laboratorial)"
✅ "Dados de TSH, T3 e T4 não disponíveis. Eixo tireoidiano não pode ser avaliado"
✅ "Cortisol não testado. Avaliação do eixo adrenal requer dados adicionais"

EXEMPLOS DO QUE NÃO FAZER:
❌ "T3 Livre sugere hipotireoidismo" (T3 não está na lista!)
❌ "Cortisol pode estar elevado pelo padrão de estresse" (Cortisol não está na lista!)
❌ "O TGO elevado indica..." (TGO não está na lista!)

═══════════════════════════════════════════════════════════════

Analise os dados médicos fornecidos sob a perspectiva da Medicina Integrativa.

# INSTRUÇÕES

## 1. LEIA OS DADOS
- Primeiro, IDENTIFIQUE quais parâmetros estão disponíveis na lista fornecida
- Perfil Médico
- Documentos
- Base de Conhecimento (use para CONTEXTO, não para inventar valores)
- Análises Prévias

## 2. PARA CADA SEÇÃO DA ANÁLISE:
- VERIFIQUE se há dados disponíveis para aquela seção
- SE HOUVER DADOS: Analise baseado APENAS nos parâmetros disponíveis
- SE NÃO HOUVER DADOS: Escreva "Dados não disponíveis para avaliar [sistema]"
- NUNCA preencha uma seção com suposições ou inferências

## 3. FUNDAMENTE CADA AFIRMAÇÃO:
- Cite valores EXATOS dos parâmetros disponíveis
- Use Base de Conhecimento para INTERPRETAR (não para inventar valores)
- Considere análises prévias quando disponíveis

---

Forneça uma análise estruturada com os seguintes passos:

1. **Apresente as informações do perfil médico do paciente**
   - Idade, sexo, peso, altura
   - Dados de bioimpedância (se disponíveis)
   - Histórico médico e medicações

2. **Análise Hematológica:**
   - SE houver hemograma → Analise eritrograma, leucograma, plaquetas
   - SE NÃO houver → "Hemograma não disponível nesta avaliação"
   - Mencione APENAS os parâmetros presentes (ex: Hemoglobina, Hematócrito, VCM, etc.)

3. **Análise da Função Hepática:**
   - VERIFIQUE quais marcadores estão disponíveis: TGO, TGP, Gama GT, Fosfatase Alcalina, Bilirrubinas, Albumina
   - SE TIVER dados hepáticos → Analise os marcadores disponíveis
   - SE NÃO TIVER → "Marcadores hepáticos não disponíveis ou incompletos"
   - ⚠️ NÃO mencione TGO se não estiver na lista de parâmetros

4. **Análise da Função Renal:**
   - VERIFIQUE: Creatinina, Ureia, Taxa de Filtração Glomerular
   - SE disponível → Analise
   - SE NÃO → "Função renal não avaliada (dados não disponíveis)"

5. **Análise do Metabolismo Glicêmico e Risco de Diabetes:**
   - VERIFIQUE: Glicose, HbA1c, Insulina, HOMA-IR
   - Analise APENAS os parâmetros disponíveis
   - Se faltar Insulina ou HOMA-IR, mencione explicitamente

6. **Análise do Risco Cardiovascular (Perfil Lipídico):**
   - VERIFIQUE: Colesterol Total, HDL, LDL, Triglicerídeos, Não-HDL
   - Analise os disponíveis
   - Calcule proporções APENAS se todos os dados necessários estiverem presentes

7. **Análise do Eixo Tireoidiano:**
   - VERIFIQUE: TSH, T3 Livre, T4 Livre, T3 Total, T4 Total
   - SE TIVER ao menos TSH → Analise o que está disponível
   - SE NÃO TIVER dados de tireoide → "Eixo tireoidiano: Dados não disponíveis (TSH, T3 e T4 não testados). Avaliação não é possível sem esses marcadores."
   - ⚠️ NÃO mencione T3 Livre ou T4 Livre se não estiverem na lista

8. **Análise do Eixo Adrenal (Estresse):**
   - VERIFIQUE: Cortisol, DHEA, ACTH
   - SE TIVER Cortisol → Analise
   - SE NÃO TIVER → "Eixo adrenal: Cortisol não testado. Avaliação do estresse adrenal requer dosagem de cortisol (idealmente em múltiplos horários) e não pode ser inferida por outros marcadores."
   - ⚠️ NÃO mencione Cortisol se não estiver na lista

9. **Análise dos Hormônios Sexuais:**
   - VERIFIQUE: Testosterona Total, Testosterona Livre, Estradiol, Progesterona, FSH, LH, SHBG, Prolactina
   - Analise APENAS os hormônios que foram testados
   - Se houver lacunas importantes, mencione explicitamente

10. **Análise de Vitaminas e Minerais:**
    - VERIFIQUE: Vitamina D, B12, Ácido Fólico, Ferro, Ferritina, Magnésio, Zinco, Selênio
    - Analise os disponíveis
    - Liste quais vitaminas/minerais NÃO foram testados

11. **Síntese Final e Recomendações:**
    - Conecte APENAS os achados que você TEM dados concretos
    - NÃO crie conexões baseadas em dados não disponíveis
    - Forneça recomendações baseadas EXCLUSIVAMENTE na sua base de conhecimento
    - Liste marcadores que FALTARAM e deveriam ser avaliados no próximo exame
    - Sugira prazo para reavaliação

12. **AVISO OBRIGATÓRIO:**
    - Sempre, ao final de cada análise, inclua: "Esta análise é uma interpretação educacional baseada em uma filosofia de medicina funcional e não substitui uma consulta, diagnóstico ou tratamento médico. Discuta sempre seus resultados e qualquer plano de ação com seu médico."`

async function updateAgentPrompt() {
  console.log('🔄 Atualizando analysis prompt do agente Medicina Integrativa...\n')

  const [result] = await db
    .update(healthAgents)
    .set({
      analysisPrompt: NEW_ANALYSIS_PROMPT,
    })
    .where(eq(healthAgents.agentKey, 'integrativa'))
    .returning()

  if (!result) {
    console.log('❌ Erro: Agente não encontrado!')
    return
  }

  console.log('✅ Analysis prompt atualizado com sucesso!\n')
  console.log('Verificando atualização...')

  const hasRules = result.analysisPrompt.includes('REGRAS CRÍTICAS DE VALIDAÇÃO')
  const hasExamples = result.analysisPrompt.includes('EXEMPLOS DO QUE FAZER')

  console.log(`✅ Tem "REGRAS CRÍTICAS"? ${hasRules}`)
  console.log(`✅ Tem "EXEMPLOS"? ${hasExamples}`)

  if (hasRules && hasExamples) {
    console.log('\n🎉 Prompt atualizado corretamente!')
    console.log('Agora teste novamente a complete analysis.')
  } else {
    console.log('\n❌ Algo deu errado na atualização')
  }
}

updateAgentPrompt()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
