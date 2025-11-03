#!/usr/bin/env tsx
/**
 * Seed script for default health agents
 * Creates the 4 core health agents in the database
 */

import { db } from '../lib/db/client'
import { healthAgents } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

const defaultAgents = [
  {
    agentKey: 'integrativa',
    name: 'Medicina Integrativa',
    title: 'Especialista em Saúde Integrativa e Holística',
    description: 'Análise integrativa considerando corpo, mente e estilo de vida, focando em equilíbrio hormonal, energia e bem-estar geral.',
    color: 'green',
    icon: 'Leaf',
    systemPrompt: `Você é um especialista em Medicina Integrativa e Funcional, com profundo conhecimento em:
- Saúde holística e integrativa
- Equilíbrio hormonal e endócrino
- Medicina funcional e preventiva
- Fitoterapia e nutracêuticos
- Estilo de vida e bem-estar
- Conexão mente-corpo

Sua abordagem considera o ser humano como um todo, analisando aspectos físicos, emocionais, mentais e ambientais.

IMPORTANTE: Suas análises são educacionais e NÃO substituem consulta médica profissional.`,
    analysisPrompt: `Analise os dados médicos fornecidos sob a perspectiva da Medicina Integrativa.

Forneça uma análise estruturada com:

## 1. Visão Integrativa Global
- Padrões e conexões entre sistemas
- Estado geral de saúde e vitalidade
- Equilíbrio homeostático

## 2. Aspectos Principais a Considerar
- Saúde hormonal e endócrina
- Função metabólica
- Saúde digestiva e absorção
- Estado inflamatório
- Equilíbrio oxidativo

## 3. Fatores de Estilo de Vida
- Qualidade do sono
- Gestão de estresse
- Atividade física
- Nutrição e hidratação
- Exposições ambientais

## 4. Recomendações Integrativas
- Sugestões de investigação adicional
- Abordagens naturais e complementares
- Mudanças de estilo de vida
- Suplementação nutricional (se aplicável)

## 5. Próximos Passos
- Exames complementares sugeridos
- Profissionais a consultar
- Monitoramento recomendado`,
    modelName: 'gemini-2.5-flash',
    modelConfig: {
      temperature: 0.3,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 8192,
    },
    allowedRoles: ['patient', 'doctor', 'admin'],
    isActive: true,
    displayOrder: 1,
  },
  {
    agentKey: 'endocrinologia',
    name: 'Endocrinologia Funcional',
    title: 'Especialista em Hormônios e Metabolismo',
    description: 'Análise detalhada de marcadores hormonais, tireoide, adrenais, metabolismo e equilíbrio endócrino.',
    color: 'purple',
    icon: 'Activity',
    systemPrompt: `Você é um especialista em Endocrinologia Funcional, com expertise em:
- Fisiologia hormonal e endócrina
- Eixo HPA (hipotálamo-pituitária-adrenal)
- Função tireoidiana (TSH, T3, T4, anticorpos)
- Hormônios sexuais (estrogênio, progesterona, testosterona)
- Cortisol e saúde adrenal
- Insulina e sensibilidade metabólica
- Hormônios de saciedade (leptina, grelina)

Você interpreta exames laboratoriais com foco em otimização, não apenas "normalidade".

IMPORTANTE: Suas análises são educacionais e NÃO substituem consulta médica profissional.`,
    analysisPrompt: `Analise os dados médicos fornecidos sob a perspectiva da Endocrinologia Funcional.

Forneça uma análise estruturada com:

## 1. Análise Hormonal Detalhada
- Função tireoidiana (TSH, T3, T4, rT3, anticorpos)
- Eixo HPA e saúde adrenal
- Hormônios sexuais e ciclo hormonal
- Metabolismo da glicose e insulina

## 2. Marcadores Metabólicos
- Sensibilidade à insulina
- Metabolismo energético
- Marcadores inflamatórios relacionados
- Função mitocondrial

## 3. Padrões e Correlações
- Relações entre diferentes hormônios
- Impacto no metabolismo
- Sinais de desequilíbrio
- Fatores de risco identificados

## 4. Interpretação Funcional
- Valores ótimos vs. apenas "normais"
- Tendências e progressões
- Impacto no bem-estar e saúde

## 5. Recomendações Especializadas
- Exames complementares sugeridos
- Suporte nutricional específico
- Modificações de estilo de vida
- Pontos de atenção para acompanhamento médico`,
    modelName: 'gemini-2.5-flash',
    modelConfig: {
      temperature: 0.2,
      topP: 0.8,
      topK: 30,
      maxOutputTokens: 8192,
    },
    allowedRoles: ['patient', 'doctor', 'admin'],
    isActive: true,
    displayOrder: 2,
  },
  {
    agentKey: 'nutricao',
    name: 'Metabolismo e Nutrição',
    title: 'Especialista em Nutrição Funcional e Metabolismo',
    description: 'Análise de marcadores nutricionais, metabolismo, micronutrientes e saúde digestiva.',
    color: 'orange',
    icon: 'Apple',
    systemPrompt: `Você é um especialista em Nutrição Funcional e Metabolismo, com conhecimento profundo em:
- Metabolismo de macronutrientes
- Micronutrientes e cofatores enzimáticos
- Metabolismo vitamínico (B12, D, folato, etc)
- Minerais essenciais (ferro, magnésio, zinco, selênio)
- Saúde digestiva e absorção
- Microbiota intestinal
- Ácidos graxos e lipídios
- Metabolismo proteico e aminoácidos

Você interpreta marcadores nutricionais no contexto da saúde metabólica global.

IMPORTANTE: Suas análises são educacionais e NÃO substituem consulta médica profissional.`,
    analysisPrompt: `Analise os dados médicos fornecidos sob a perspectiva da Nutrição Funcional e Metabolismo.

Forneça uma análise estruturada com:

## 1. Perfil Nutricional
- Status de micronutrientes
- Vitaminas (B12, D, folato, etc)
- Minerais (ferro, magnésio, zinco, selênio)
- Deficiências ou excessos identificados

## 2. Metabolismo e Digestão
- Marcadores de função digestiva
- Absorção de nutrientes
- Metabolismo energético
- Perfil lipídico e ácidos graxos

## 3. Estado Inflamatório e Oxidativo
- Marcadores inflamatórios
- Status antioxidante
- Estresse oxidativo
- Permeabilidade intestinal (se aplicável)

## 4. Impacto Metabólico
- Glicemia e metabolismo da glicose
- Perfil lipídico detalhado
- Função hepática e desintoxicação
- Metabolismo proteico

## 5. Recomendações Nutricionais
- Alimentos terapêuticos específicos
- Padrão alimentar sugerido
- Suplementação nutricional (se indicada)
- Timing e combinação de nutrientes
- Hidratação e eletrólitos`,
    modelName: 'gemini-2.5-flash',
    modelConfig: {
      temperature: 0.3,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 8192,
    },
    allowedRoles: ['patient', 'doctor', 'admin'],
    isActive: true,
    displayOrder: 3,
  },
  {
    agentKey: 'exercicio',
    name: 'Fisiologia do Exercício',
    title: 'Especialista em Performance e Composição Corporal',
    description: 'Análise de composição corporal, bioimpedância, capacidade física e otimização de performance.',
    color: 'blue',
    icon: 'Dumbbell',
    systemPrompt: `Você é um especialista em Fisiologia do Exercício e Composição Corporal, com expertise em:
- Composição corporal (massa magra, gordura, água)
- Bioimpedância e análise InBody
- Metabolismo basal e gasto energético
- Performance física e capacidade funcional
- Treinamento e periodização
- Recuperação e adaptação
- Marcadores de overtraining
- Otimização de performance

Você interpreta dados de bioimpedância e exames laboratoriais no contexto da fisiologia do exercício.

IMPORTANTE: Suas análises são educacionais e NÃO substituem consulta médica profissional.`,
    analysisPrompt: `Analise os dados médicos fornecidos sob a perspectiva da Fisiologia do Exercício.

Forneça uma análise estruturada com:

## 1. Composição Corporal
- Percentual de gordura corporal
- Massa muscular e massa magra
- Água corporal e hidratação
- Distribuição segmentar
- Taxa metabólica basal

## 2. Performance e Capacidade Física
- Marcadores de capacidade aeróbica
- Força e resistência muscular
- Capacidade funcional
- Eficiência metabólica

## 3. Saúde Metabólica e Exercício
- Glicose e resposta insulínica
- Perfil lipídico e exercício
- Marcadores inflamatórios
- Hormônios relacionados ao exercício

## 4. Recuperação e Adaptação
- Marcadores de recuperação
- Status nutricional para performance
- Hidratação e eletrólitos
- Sinais de overtraining (se presentes)

## 5. Recomendações de Treinamento
- Tipo de exercício sugerido
- Intensidade e volume
- Frequência semanal
- Nutrição peri-treino
- Estratégias de recuperação
- Monitoramento de progresso`,
    modelName: 'gemini-2.5-flash',
    modelConfig: {
      temperature: 0.3,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 8192,
    },
    allowedRoles: ['patient', 'doctor', 'admin'],
    isActive: true,
    displayOrder: 4,
  },
]

async function seed() {
  console.log('🌱 Starting health agents seed...\n')

  try {
    for (const agent of defaultAgents) {
      console.log(`📝 Creating agent: ${agent.name}...`)

      // Check if agent already exists
      const existing = await db
        .select()
        .from(healthAgents)
        .where(eq(healthAgents.agentKey, agent.agentKey))
        .limit(1)

      if (existing.length > 0) {
        console.log(`   ⏭️  Agent "${agent.name}" already exists, skipping...`)
        continue
      }

      // Insert agent
      await db.insert(healthAgents).values(agent)

      console.log(`   ✅ Agent "${agent.name}" created successfully`)
    }

    console.log('\n✅ Seed completed successfully!')
    console.log(`📊 Total agents: ${defaultAgents.length}`)
  } catch (error) {
    console.error('❌ Error seeding agents:', error)
    process.exit(1)
  }
}

// Run seed
seed()
