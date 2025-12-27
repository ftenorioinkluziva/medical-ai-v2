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

Analise os dados médicos fornecidos sob a sua perspectiva especializada.

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

Forneça uma análise estruturada relevante à sua especialidade:

1. **Apresente as informações do perfil médico do paciente**
   - Idade, sexo, peso, altura
   - Dados de bioimpedância (se disponíveis)
   - Histórico médico e medicações

2. **Análise específica da sua área de expertise**
   - Analise APENAS os parâmetros que estão disponíveis
   - Para cada sistema/área que você avaliar, VERIFIQUE se há dados disponíveis
   - SE NÃO HOUVER dados → Escreva explicitamente "Dados não disponíveis para avaliar [área]"
   - ⚠️ NÃO mencione parâmetros que não estão na lista fornecida

3. **Síntese e Recomendações**
   - Conecte APENAS os achados que você TEM dados concretos
   - NÃO crie conexões baseadas em dados não disponíveis
   - Forneça recomendações baseadas EXCLUSIVAMENTE na sua base de conhecimento
   - Liste marcadores que FALTARAM e deveriam ser avaliados no próximo exame
   - Sugira prazo para reavaliação

4. **AVISO OBRIGATÓRIO:**
   - Sempre, ao final de cada análise, inclua: "Esta análise é uma interpretação educacional baseada em uma filosofia de medicina funcional e não substitui uma consulta, diagnóstico ou tratamento médico. Discuta sempre seus resultados e qualquer plano de ação com seu médico."`

async function updateAllAgents() {
  console.log('🔄 Atualizando analysis prompt de TODOS os agentes...\n')

  // Get all agents
  const agents = await db.select().from(healthAgents)

  console.log(`Total de agentes: ${agents.length}\n`)

  for (const agent of agents) {
    console.log(`📝 Atualizando: ${agent.name} (${agent.agentKey})`)

    const [result] = await db
      .update(healthAgents)
      .set({
        analysisPrompt: NEW_ANALYSIS_PROMPT,
      })
      .where(eq(healthAgents.agentKey, agent.agentKey))
      .returning()

    if (result) {
      const hasRules = result.analysisPrompt.includes('REGRAS CRÍTICAS DE VALIDAÇÃO')
      const hasExamples = result.analysisPrompt.includes('EXEMPLOS DO QUE FAZER')

      if (hasRules && hasExamples) {
        console.log(`   ✅ ${agent.name} atualizado com sucesso!\n`)
      } else {
        console.log(`   ❌ ${agent.name} - Erro na atualização\n`)
      }
    } else {
      console.log(`   ❌ ${agent.name} - Não encontrado\n`)
    }
  }

  console.log('═══════════════════════════════════════')
  console.log('🎉 Atualização concluída!')
  console.log('═══════════════════════════════════════')
  console.log('\n✅ Todos os agentes agora têm:')
  console.log('   - Regras críticas de validação')
  console.log('   - Exemplos do que fazer/não fazer')
  console.log('   - Instruções condicionais')
  console.log('\n🧪 Teste novamente a complete analysis!')
}

updateAllAgents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
