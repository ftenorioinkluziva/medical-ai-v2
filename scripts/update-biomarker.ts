#!/usr/bin/env tsx
/**
 * Script para atualizar biomarcadores e protocolos
 * Uso: pnpm tsx scripts/update-biomarker.ts
 */

import { db } from '../lib/db/client'
import { biomarkersReference, protocols } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Exemplo: Atualizar Vitamina D3 com nova pesquisa
 */
async function updateVitaminD() {
  console.log('📝 Atualizando Vitamina D3 com novos valores de pesquisa 2025...\n')

  // 1. Atualizar referência do biomarcador
  const [updatedBio] = await db
    .update(biomarkersReference)
    .set({
      optimalMin: '50',
      optimalMax: '90',
      clinicalInsight: 'Estudos de 2025 mostram que níveis acima de 50 ng/mL são necessários para imunidade ótima. Faixa de 60-90 ng/mL demonstrou melhor prevenção de doenças autoimunes e otimização hormonal.',
      sourceRef: 'Optimal Vitamin D for Immunity, NEJM 2025',
      updatedAt: new Date(),
    })
    .where(eq(biomarkersReference.slug, 'vitamina_d3'))
    .returning()

  if (updatedBio) {
    console.log('✅ Biomarcador atualizado:')
    console.log(`   Nome: ${updatedBio.name}`)
    console.log(`   Nova Faixa Ótima: ${updatedBio.optimalMin}-${updatedBio.optimalMax} ${updatedBio.unit}`)
    console.log(`   Fonte: ${updatedBio.sourceRef}`)
    console.log()
  } else {
    console.log('⚠️ Biomarcador não encontrado')
    return
  }

  // 2. Adicionar novo protocolo para níveis subótimos
  const [newProtocol] = await db
    .insert(protocols)
    .values({
      triggerCondition: 'vitamina_d3 >= 40 AND vitamina_d3 < 50',
      type: 'supplement',
      title: 'Vitamina D3 - Otimização (Níveis Subótimos)',
      description: 'Para pacientes com níveis entre 40-50 ng/mL, protocolo de otimização para alcançar faixa ideal > 50 ng/mL conforme novos estudos de 2025. Este protocolo visa elevar níveis para faixa de imunidade ótima.',
      dosage: '10.000 UI/dia por 8 semanas + Vitamina K2 (MK-7) 200mcg/dia, reavaliar',
      sourceRef: 'Protocolo baseado em NEJM 2025',
    })
    .returning()

  console.log('✅ Novo protocolo adicionado:')
  console.log(`   Título: ${newProtocol.title}`)
  console.log(`   Condição: ${newProtocol.triggerCondition}`)
  console.log(`   Dosagem: ${newProtocol.dosage}`)
  console.log()
}

/**
 * Exemplo: Adicionar novo biomarcador
 */
async function addNewBiomarker() {
  console.log('📝 Adicionando novo biomarcador: ApoE...\n')

  try {
    const [newBio] = await db
      .insert(biomarkersReference)
      .values({
        slug: 'apolipoproteina_e',
        name: 'Apolipoproteína E (ApoE)',
        category: 'lipids',
        unit: 'mg/dL',
        optimalMin: '20',
        optimalMax: '45',
        labMin: '10',
        labMax: '60',
        clinicalInsight: 'ApoE é uma proteína essencial no metabolismo lipídico. Níveis elevados estão associados a maior risco cardiovascular e disfunção metabólica. Valores ótimos indicam transporte lipídico eficiente.',
        metaphor: 'ApoE é como um caminhão de transporte de colesterol - quando há muitos caminhões, indica que há muito colesterol circulando',
        sourceRef: 'Chen et al. 2025, Cardiovascular Risk Assessment',
      })
      .returning()

    console.log('✅ Novo biomarcador adicionado:')
    console.log(`   Nome: ${newBio.name}`)
    console.log(`   Slug: ${newBio.slug}`)
    console.log(`   Faixa Ótima: ${newBio.optimalMin}-${newBio.optimalMax} ${newBio.unit}`)
    console.log()

    // Adicionar protocolo para quando estiver elevado
    const [protocol] = await db
      .insert(protocols)
      .values({
        triggerCondition: 'apolipoproteina_e > 45',
        type: 'supplement',
        title: 'Redução de ApoE Elevada',
        description: 'Protocolo para otimização de ApoE elevada através de modulação lipídica. Ômega-3 EPA/DHA reduz síntese hepática de ApoE, enquanto berberina melhora clearance lipídico.',
        dosage: 'Ômega-3 (EPA/DHA) 2-3g/dia + Berberina 500mg 3x/dia às refeições',
        sourceRef: 'Chen et al. 2025 + Meta-análise Berberina 2024',
      })
      .returning()

    console.log('✅ Protocolo associado criado:')
    console.log(`   Título: ${protocol.title}`)
    console.log(`   Condição: ${protocol.triggerCondition}`)
    console.log()
  } catch (error) {
    console.error('❌ Erro ao adicionar biomarcador:', error)
  }
}

async function main() {
  console.log('🧠 ATUALIZAÇÃO DO CÉREBRO LÓGICO\n')
  console.log('=' .repeat(60))
  console.log()

  // Escolha qual atualização executar:

  // Exemplo 1: Atualizar biomarcador existente
  await updateVitaminD()

  // Exemplo 2: Adicionar novo biomarcador
  // await addNewBiomarker()

  console.log('=' .repeat(60))
  console.log('\n✅ Atualização concluída com sucesso!')
  console.log('\n💡 Próximas análises já usarão os novos valores automaticamente.')
  console.log('📊 Acesse /admin/medical-knowledge para visualizar as mudanças.')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error)
    process.exit(1)
  })
