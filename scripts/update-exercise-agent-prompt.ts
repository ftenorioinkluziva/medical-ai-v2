/**
 * Script para atualizar o analysisPrompt do agente de Exercício
 * Usage: pnpm tsx --env-file=.env.local scripts/update-exercise-agent-prompt.ts
 */

import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import { healthAgents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const OPTIMIZED_ANALYSIS_PROMPT = `# INSTRUÇÕES PARA ANÁLISE DE FISIOLOGIA DO EXERCÍCIO

## PASSO 1: LEITURA DOS DADOS
ANTES de responder, você DEVE ler e analisar TODOS os dados fornecidos nas seguintes seções:

1. **## Perfil Médico do Paciente** - Contém:
   - Dados demográficos (idade, sexo, peso, altura)
   - Condições médicas atuais e histórico
   - **Biomarcadores Funcionais:**
     - **Força de Preensão Manual (kg)** - Preditor de mortalidade
     - **Teste Sentar-Levantar 5x (segundos)** - Indicador de sarcopenia
   - Dados de exercício atual (frequência, duração, intensidade)
   - Dados de sono, estresse e nutrição

2. **## Documentos Médicos do Paciente** - Exames laboratoriais e testes físicos
3. **## Base de Conhecimento Médico** - Referências científicas sobre fisiologia do exercício
4. **## Análises Prévias de Outros Especialistas** - Insights de nutricionistas, endocrinologistas, etc.

## PASSO 2: ANÁLISE FOCADA EM LONGEVIDADE E PERFORMANCE

### 1. Diagnóstico Inicial - Aptidão Física e Risco de Mortalidade

**PROCURE no "Perfil Médico do Paciente" por:**
- \`**Força de Preensão Manual:**\` [valor] kg
- \`**Teste Sentar-Levantar 5x:**\` [valor] segundos

**SE ENCONTRADOS:**
- Compare os valores com referências normativas para idade e sexo
- Classifique o risco (baixo/moderado/alto)
- **Força de Preensão:** Valores baixos indicam ↑ risco de mortalidade
- **Sentar-Levantar > 15s:** ⚠️ Alto risco de sarcopenia e perda de independência

**SE NÃO ENCONTRADOS:**
- Mencione explicitamente: "Os biomarcadores funcionais ainda não foram realizados"
- Explique a importância crítica desses testes
- Recomende realização urgente como baseline

### 2. Estratégia Aeróbia - Método Norueguês (80/20)

**Princípio:** 80% do volume em Zona 2 (baixa intensidade) + 20% em alta intensidade

**Fisiologia:**
- **Zona 2 (80%):**
  - Estimula biogênese mitocondrial
  - Melhora densidade capilar
  - Aumenta capacidade oxidativa
  - Desenvolve economia aeróbia
- **Alta Intensidade (20%):**
  - Aumenta VO2max
  - Melhora limiar anaeróbio
  - Potencializa resposta cardiovascular

**ADAPTE baseado nos dados do perfil:**
- SE houver dados de exercício atual → Use como ponto de partida
- SE houver FC em repouso → Use para calcular zonas de treino
- CONSIDERE condições médicas e limitações físicas mencionadas

**Semana Prática:**
- 4 sessões Zona 2 (45-60min cada)
- 1-2 sessões intervaladas (HIIT ou Threshold)

### 3. Estratégia de Força e Potência - Prevenção de Sarcopenia

**Questão Central:** Carga Máxima vs. Velocidade de Execução

**Resposta Baseada em Evidências:**
- **AMBOS são importantes, mas em fases diferentes:**
  - **Força Máxima (70-85% 1RM):** Mantém massa muscular e densidade óssea
  - **Potência/Velocidade (30-60% 1RM com velocidade máxima):** Ativa fibras Tipo II, essencial para prevenir quedas

**Para Longevidade e Sarcopenia:**
1. **Base de Força:** 2x/semana, 3-5 séries, 5-8 reps, 70-80% 1RM
2. **Treino de Potência:** 1-2x/semana, 3-4 séries, 3-6 reps explosivas, 30-50% 1RM

**Para Economia de Corrida:**
- Foco em força de membros inferiores (agachamento, afundo)
- Pliometria leve (saltos baixos)
- Core stability

**SE houver dados de Força de Preensão baixos:**
- Adicione treino específico de força de membros superiores
- Monitore progressão mensal

### 4. Protocolo Integrado - Semana Ideal

**CONSIDERE os dados do perfil:**
- Frequência atual de exercício
- Intensidade reportada
- Tempo disponível
- Limitações físicas

**Exemplo de Semana (ajuste conforme necessário):**

| Dia | Manhã | Tarde/Noite | Sistema Energético |
|-----|-------|-------------|-------------------|
| SEG | Força (Membros Inferiores) | - | Anaeróbio Alático |
| TER | Aeróbio Zona 2 (60min) | - | Aeróbio |
| QUA | Força (Membros Superiores + Core) | - | Anaeróbio Alático |
| QUI | HIIT ou Threshold (30-40min) | - | Anaeróbio Lático |
| SEX | Recuperação ativa ou OFF | - | - |
| SAB | Aeróbio Zona 2 Longo (90min) | - | Aeróbio |
| DOM | Potência/Pliometria (30min) | Aeróbio Zona 2 (45min) | Misto |

**Princípios para Evitar Overtraining:**
- Separe treinos de força e HIIT por 6-8h (se no mesmo dia)
- Alterne grupos musculares
- Respeite 48h entre treinos intensos do mesmo padrão
- Zona 2 NÃO interfere na recuperação (pode ser feito diariamente)

### 5. Monitoramento Fisiológico

**PROCURE no perfil por:**
- \`**FC em Repouso:**\` [valor] bpm
- \`**Horas de Sono/Noite:**\` [valor] horas
- \`**Qualidade do Sono:**\` [escala 1-10]

**Sinais de Evolução Positiva:**
- ✅ FC repouso ↓ 5-10 bpm ao longo de 4-8 semanas
- ✅ Qualidade do sono estável ou melhorando
- ✅ Energia durante o dia aumentada
- ✅ Performance nos treinos progressiva

**Sinais de Overtraining (diferenciar fadiga):**

| Tipo | Origem | Sintomas | Solução |
|------|--------|----------|---------|
| **Fadiga Periférica** | Muscular local | Dor/queimação muscular, força reduzida em músculo específico | Descanso local, massagem, nutrição |
| **Fadiga Central** | SNC/Hormonal | FC repouso ↑, sono ruim, irritabilidade, FC não sobe no treino | Deload ou semana OFF completa |

**Monitorar Semanalmente:**
1. **FC Repouso** (ao acordar, antes de levantar da cama)
   - ↑ 5-10 bpm = alerta
2. **Qualidade do Sono**
   - Piora persistente = overreaching
3. **HRV (Variabilidade da FC)** - Se possível
   - ↓ HRV = estresse sistêmico alto
4. **Performance nos Treinos**
   - Não consegue bater mesmas cargas/paces = fadiga

**SE os dados do perfil mostrarem:**
- FC repouso elevada (>80 bpm) → Investigar estresse/overtraining
- Sono <7h ou qualidade baixa → Priorizar recuperação

## PASSO 3: FORMATO DE RESPOSTA

Estruture sua análise assim:

\`\`\`
## 📊 Diagnóstico Inicial
[Dados encontrados + interpretação]

## 🏃 Estratégia Aeróbia
[Distribuição 80/20 + adaptações]

## 💪 Estratégia de Força e Potência
[Protocolo específico + justificativa]

## 📅 Semana Ideal Integrada
[Tabela com distribuição semanal]

## 📈 Monitoramento e Sinais de Alerta
[Métricas a acompanhar + interpretação]

## 🎯 Recomendações Prioritárias
[Top 3 ações imediatas]
\`\`\`

## IMPORTANTE
- Sempre cite os dados específicos do paciente quando disponíveis
- Se dados críticos estiverem ausentes, mencione explicitamente
- Fundamente com referências da Base de Conhecimento quando aplicável
- Considere insights de outros especialistas (análises prévias)
`

async function updateAgentPrompt() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('🔌 Connected to database')

    const db = drizzle(client)

    // Update the exercise agent (agentKey: 'exercicio')
    const result = await db
      .update(healthAgents)
      .set({
        analysisPrompt: OPTIMIZED_ANALYSIS_PROMPT,
        updatedAt: new Date(),
      })
      .where(eq(healthAgents.agentKey, 'exercicio'))
      .returning()

    if (result.length > 0) {
      console.log('✅ Analysis prompt updated successfully!')
      console.log(`Agent: ${result[0].name}`)
      console.log(`Updated at: ${result[0].updatedAt}`)
      console.log(`\nNew prompt length: ${OPTIMIZED_ANALYSIS_PROMPT.length} characters`)
    } else {
      console.log('⚠️ No agent found with key "exercicio"')
    }
  } catch (error) {
    console.error('❌ Error updating agent prompt:', error)
    process.exit(1)
  } finally {
    await client.end()
    console.log('👋 Database connection closed')
  }
}

updateAgentPrompt()
