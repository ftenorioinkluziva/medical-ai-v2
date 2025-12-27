/**
 * Seed script for Medical Knowledge Base
 * Populates the Logical Brain with functional medicine data
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from '../lib/db/client'
import { biomarkersReference, calculatedMetrics, protocols } from '../lib/db/schema'
import { sql } from 'drizzle-orm'

const biomarkersData = [
  {
    slug: 'insulina',
    name: 'Insulina em Jejum',
    category: 'Metabólico',
    unit: 'uUI/mL',
    optimalMax: '8.0',
    labMax: '23.0',
    clinicalInsight: 'Marcador principal de resistência insulínica. Valores acima de 8 indicam que o pâncreas está sobrecarregado.',
    metaphor: 'A insulina é a carriola que leva o açúcar. Se tem muitas carriolas, o trânsito está engarrafado.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'glicemia',
    name: 'Glicemia de Jejum',
    category: 'Metabólico',
    unit: 'mg/dL',
    optimalMin: '70.0',
    optimalMax: '85.0',
    labMax: '99.0',
    clinicalInsight: 'Acima de 90 já indica excesso de carboidratos recentes. É um parâmetro facilmente mascarado por jejum curto.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'hba1c',
    name: 'Hemoglobina Glicada',
    category: 'Metabólico',
    unit: '%',
    optimalMax: '5.4',
    labMax: '5.7',
    clinicalInsight: 'Média glicêmica dos últimos 3 meses. Indica o grau de "caramelização" (glicação) das proteínas.',
    metaphor: 'Mede o quanto seu sangue virou "cola plástica".',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'tsh',
    name: 'TSH',
    category: 'Tireoide',
    unit: 'uUI/mL',
    optimalMin: '1.0',
    optimalMax: '2.0',
    labMax: '4.5',
    clinicalInsight: 'Hormônio cerebral. Valores acima de 2.0 já sugerem hipotireoidismo tecidual ou dificuldade de conversão.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 't3_livre',
    name: 'T3 Livre',
    category: 'Tireoide',
    unit: 'pg/mL',
    optimalMin: '3.3',
    optimalMax: '4.2',
    clinicalInsight: 'Hormônio da vida e beleza. Níveis baixos causam depressão, queda de cabelo e metabolismo lento.',
    metaphor: 'O T3 é o cirurgião plástico do corpo.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 't3_reverso',
    name: 'T3 Reverso',
    category: 'Tireoide',
    unit: 'ng/dL',
    optimalMax: '12.0',
    clinicalInsight: 'Bloqueador metabólico. Aumenta em estresse, jejum prolongado ou inflamação.',
    metaphor: 'Hormônio da hibernação. O corpo acha que é inverno e guarda gordura.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'ferritina',
    name: 'Ferritina',
    category: 'Hematológico',
    unit: 'ng/mL',
    optimalMin: '70.0',
    optimalMax: '150.0',
    labMin: '15.0',
    clinicalInsight: 'Reserva de ferro. Abaixo de 70 impede a conversão de T4 em T3 na tireoide. Acima de 200 oxida o fígado.',
    metaphor: 'Bateria do corpo. Sem carga, o corpo desliga a "decoração" (cabelo/unha).',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'gama_gt',
    name: 'Gama GT',
    category: 'Hepático',
    unit: 'U/L',
    optimalMax: '16.0',
    labMax: '40.0',
    clinicalInsight: 'Marcador mais sensível de agressão hepática (álcool/toxinas). Acima de 16 já indica sofrimento.',
    metaphor: 'O fígado inchado deixa o "estômago alto" e o corpo em formato de maçã.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'tgo',
    name: 'TGO (AST)',
    category: 'Hepático',
    unit: 'U/L',
    optimalMax: '18.0',
    clinicalInsight: 'Indica morte celular (hepatólise). Deve ser baixo.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'triglicerideos',
    name: 'Triglicerídeos',
    category: 'Lipídico',
    unit: 'mg/dL',
    optimalMax: '80.0',
    clinicalInsight: 'Estoque de energia vindo de carboidratos simples e álcool. Principal vilão cardiovascular.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'hdl',
    name: 'HDL Colesterol',
    category: 'Lipídico',
    unit: 'mg/dL',
    optimalMin: '60.0',
    clinicalInsight: 'Proteção cardiovascular. Abaixo de 50 é risco.',
    metaphor: 'O caminhão de lixo que limpa as artérias.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'creatinina',
    name: 'Creatinina',
    category: 'Renal',
    unit: 'mg/dL',
    optimalMin: '0.7',
    optimalMax: '0.9',
    clinicalInsight: 'Acima de 1.0 indica sobrecarga renal ou desidratação crônica.',
    metaphor: 'O filtro de café sujo. Precisa de água constante para lavar.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'homocisteina',
    name: 'Homocisteína',
    category: 'Inflamação',
    unit: 'umol/L',
    optimalMax: '7.0',
    clinicalInsight: 'Marcador de metilação. Alta correlaciona com risco de AVC, Alzheimer e infarto.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'pcr_us',
    name: 'PCR Ultra-Sensível',
    category: 'Inflamação',
    unit: 'mg/L',
    optimalMax: '0.5',
    clinicalInsight: 'Inflamação vascular. Deve ser próximo de zero.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'vo2_max',
    name: 'VO2 Máximo',
    category: 'Fisiologia',
    unit: 'ml/kg/min',
    optimalMin: '35.0',
    clinicalInsight: 'O mais forte preditor de longevidade. Valores baixos têm risco de mortalidade maior que tabagismo.',
    sourceRef: 'Dr. Guilherme Freccia'
  },
  {
    slug: 'forca_preensao',
    name: 'Força de Preensão Manual',
    category: 'Fisiologia',
    unit: 'kg',
    clinicalInsight: 'Marcador de funcionalidade e robustez em idosos. Baixa força indica sarcopenia e fragilidade.',
    sourceRef: 'Dr. Guilherme Freccia'
  },
  {
    slug: 'vitamina_d3',
    name: 'Vitamina D3',
    category: 'Imunidade',
    unit: 'ng/mL',
    optimalMin: '50.0',
    optimalMax: '80.0',
    labMin: '20.0',
    metaphor: 'O maestro da imunidade e proteção anticâncer.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'vitamina_b12',
    name: 'Vitamina B12',
    category: 'Cérebro',
    unit: 'pg/mL',
    optimalMin: '600.0',
    metaphor: 'Combustível da cognição e da bainha de mielina.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'lipoproteina_a',
    name: 'Lipoproteína (a)',
    category: 'Cardiovascular',
    unit: 'nmol/L',
    optimalMax: 30.0, // Meta funcional estrita
    labMax: 75.0,
    clinicalInsight: 'Marcador genético de risco cardíaco e trombose. Não responde bem a dieta/estatinas. Valores altos exigem controle rigoroso de outros fatores (inflamação/oxidação).',
    sourceRef: 'Medicina Funcional'
  },
  {
    slug: 'acido_urico',
    name: 'Ácido Úrico',
    category: 'Metabólico',
    unit: 'mg/dL',
    optimalMax: 4.5, // Meta funcional (acima disso já indica estresse oxidativo/metabólico)
    labMax: 7.0,
    clinicalInsight: 'Não é só gota. É um marcador de estresse oxidativo e resistência à insulina (frutose). Valores acima de 5.0 já indicam risco cardiovascular aumentado.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'fibrinogenio',
    name: 'Fibrinogênio',
    category: 'Inflamação/Coagulação',
    unit: 'mg/dL',
    optimalMin: 200.0,
    optimalMax: 300.0,
    labMax: 393.0,
    clinicalInsight: 'Marcador de viscosidade do sangue e inflamação. Valores altos aumentam risco de trombose e infarto ("sangue grosso").',
    sourceRef: 'Medicina Funcional'
  },
  {
    slug: 'apo_b',
    name: 'Apolipoproteína B',
    category: 'Cardiovascular',
    unit: 'mg/dL',
    optimalMax: 80.0,
    labMax: 100.0, // Laboratórios variam, mas funcional busca < 80
    clinicalInsight: 'Conta o número real de partículas aterogênicas (LDL, VLDL). Mais preciso que o colesterol LDL calculado.',
    sourceRef: 'Medicina de Precisão'
  },

  // --- NOVO: HORMÔNIOS SEXUAIS (MASCULINO) ---
  {
    slug: 'testosterona_total',
    name: 'Testosterona Total',
    category: 'Hormônios',
    unit: 'ng/dL',
    optimalMin: 600.0, // Alvo de performance/longevidade
    optimalMax: 900.0,
    labMin: 249.0, // O laboratório aceita valores muito baixos como "normal"
    clinicalInsight: 'Vitalidade, força e proteção cardíaca. Valores de laboratório "normais" (ex: 300) são insuficientes para saúde ótima em homens.',
    sourceRef: 'Dr. Guilherme Freccia'
  },
  {
    slug: 'testosterona_livre',
    name: 'Testosterona Livre',
    category: 'Hormônios',
    unit: 'ng/dL',
    optimalMin: 12.0, // Estimativa funcional
    clinicalInsight: 'A fração que realmente funciona. Se a SHBG for alta, a livre cai, causando sintomas mesmo com Total normal.',
    sourceRef: 'Dr. Guilherme Freccia'
  },
  {
    slug: 'estradiol',
    name: 'Estradiol (E2)',
    category: 'Hormônios',
    unit: 'pg/mL',
    optimalMin: 20.0,
    optimalMax: 30.0, // Homens precisam de um pouco, mas não muito
    clinicalInsight: 'Em homens, o excesso causa gordura abdominal e perda de libido. A falta causa risco ósseo e cardíaco. O equilíbrio é chave.',
    sourceRef: 'Medicina Funcional'
  },
  {
    slug: 'shbg',
    name: 'SHBG',
    category: 'Hormônios',
    unit: 'nmol/L',
    optimalMin: 20.0,
    optimalMax: 40.0,
    clinicalInsight: 'Proteína que "prende" a testosterona. Se estiver muito alta (ex: insulina baixa demais ou envelhecimento), rouba a testosterona livre.',
    sourceRef: 'Medicina Funcional'
  },
  {
    slug: 'progesterona',
    name: 'Progesterona',
    category: 'Hormônios',
    unit: 'ng/mL',
    optimalMax: 0.15, // Para homens
    clinicalInsight: 'Em homens, níveis elevados podem inibir a testosterona ou indicar conversão adrenal alterada.',
    sourceRef: 'Medicina Funcional'
  },
  {
    slug: 'cortisol_manha',
    name: 'Cortisol (Manhã)',
    category: 'Hormônios/Estresse',
    unit: 'ug/dL',
    optimalMin: 10.0,
    optimalMax: 18.0,
    clinicalInsight: 'Hormônio da vida. Baixo demais = burnout/fadiga adrenal. Alto demais = estresse agudo/catabolismo muscular.',
    sourceRef: 'Medicina Funcional'
  },

  // --- NOVO: HEMATOLOGIA E IMUNIDADE ---
  {
    slug: 'leucocitos',
    name: 'Leucócitos Totais',
    category: 'Imunidade',
    unit: '/mm3',
    optimalMin: 5000.0,
    optimalMax: 7500.0,
    clinicalInsight: 'Sistema de defesa. Abaixo de 5000 pode indicar baixa reserva imunológica ou infecções virais crônicas. Acima de 10000, infecção aguda.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'vcm',
    name: 'VCM (Volume Corpuscular Médio)',
    category: 'Hematológico',
    unit: 'fL',
    optimalMin: 88.0,
    optimalMax: 92.0,
    labMin: 80.0,
    labMax: 98.0,
    clinicalInsight: 'Tamanho da hemácia. < 88 tende a deficiência de ferro. > 92 tende a deficiência de B12/Folato (Metilação) ou hipotireoidismo.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'rdw',
    name: 'RDW',
    category: 'Hematológico',
    unit: '%',
    optimalMax: 12.0, // Dra. Katia é bem estrita aqui
    labMax: 14.0,
    clinicalInsight: 'Variação do tamanho das células. Marcador de "controle de qualidade" da medula. Valores altos (>13%) indicam deficiência nutricional e inflamação.',
    sourceRef: 'Dra. Katia Haranaka'
  },

  // --- NOVO: MINERAIS E ELETRÓLITOS ---
  {
    slug: 'magnesio',
    name: 'Magnésio',
    category: 'Mineral',
    unit: 'mg/dL',
    optimalMin: 2.2, // Funcional busca o quartil superior
    labMin: 1.6,
    clinicalInsight: 'Essencial para 300+ enzimas. No sangue é pouco representativo (melhor no eritrócito), mas se estiver baixo no sangue, a deficiência tecidual é grave.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'zinco',
    name: 'Zinco Sérico',
    category: 'Mineral',
    unit: 'ug/dL',
    optimalMin: 90.0,
    optimalMax: 120.0,
    clinicalInsight: 'Vital para testosterona, imunidade e conversão da tireoide. Baixo zinco = baixa testosterona e T3.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'acido_folico',
    name: 'Ácido Fólico (Folato)',
    category: 'Vitamina',
    unit: 'ng/mL',
    optimalMin: 10.0, // Funcional busca > 10 ou > 15
    labMin: 3.0,
    clinicalInsight: 'Essencial para metilação e redução da homocisteína. Deficiência causa danos ao DNA.',
    sourceRef: 'Medicina Funcional'
  }
]

const metricsData = [
  {
    slug: 'ratio_tg_hdl',
    name: 'Relação Triglicerídeos / HDL',
    formula: '{triglicerideos} / {hdl}',
    targetMax: '2.0',
    riskInsight: 'Principal preditor de risco cardíaco (LDL pequeno e denso). Ideal < 2.0 (ou < 1.0 para excelência).',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'ratio_t3l_t3r',
    name: 'Eficiência Tireoidiana (T3L/T3R)',
    formula: '{t3_livre} / {t3_reverso}',
    targetMin: '20.0',
    riskInsight: 'Se baixo, indica que o corpo está convertendo hormônio ativo em inativo (hibernação).',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    slug: 'tfg_estimada',
    name: 'Taxa de Filtração Glomerular (Estimada)',
    formula: 'Variável (CKD-EPI)', // O agente deve identificar o valor pronto do exame
    targetMin: 90.0,
    riskInsight: 'Abaixo de 90 indica perda de função renal leve. Abaixo de 60 é insuficiência renal moderada. Monitorar hidratação e creatinina.',
    sourceRef: 'Nefrologia Funcional'
  }
]

const protocolsData = [
  {
    triggerCondition: 'insulina > 8 OR triglicerideos > 100',
    type: 'Dieta',
    title: 'Protocolo Jantar Limpo',
    description: 'Eliminar carboidratos (arroz, macarrão, pão) após as 18h. Jantar apenas "Prato de Mato" (verduras) + Proteína.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    triggerCondition: 'ferritina < 70',
    type: 'Suplementação',
    title: 'Recuperação de Ferro',
    description: 'Investigar fluxo menstrual intenso (cortar lácteos/glúten). Suplementar Ferro Quelado + Vitamina C. Em casos graves, avaliar ferro endovenoso.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    triggerCondition: 'homocisteina > 7',
    type: 'Suplementação',
    title: 'Protocolo de Metilação',
    description: 'Uso de Metilcobalamina (B12), Metilfolato (B9) e B6 (P5P). Evitar vitaminas sintéticas não metiladas.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    triggerCondition: 'creatinina > 1.0',
    type: 'Hábito',
    title: 'Hidratação Programada',
    description: 'Beber 1 copo de água (300ml) por hora, das 8h às 19h. Não beber tudo de uma vez.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    triggerCondition: 't3_livre < 2.3 OR t3_reverso > 0.25',
    type: 'Suplementação',
    title: 'Kit Conversão Tireoide',
    description: 'Suplementar Zinco, Selênio e Magnésio para ativar a enzima deiodinase.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    triggerCondition: 'gama_gt > 16 OR tgo > 20',
    type: 'Estilo de Vida',
    title: 'Detox Hepático',
    description: 'Zero álcool e açúcar. Evitar analgésicos desnecessários. Aumentar ingestão de crucíferos e água.',
    sourceRef: 'Dra. Katia Haranaka'
  },
  {
    triggerCondition: 'ferritina < 70 OR hemoglobina < 13',
    type: 'Treino',
    title: 'Construção de Base Aeróbia',
    description: 'Focar em cardio de Zona 2 (baixa intensidade, longa duração) para aumentar densidade mitocondrial e capacidade de transporte de oxigênio.',
    sourceRef: 'Dr. Guilherme Freccia'
  },
  {
    triggerCondition: 'creatinina > 1.2',
    type: 'Treino',
    title: 'Treino de Potência para Preservação Muscular',
    description: 'Realizar movimentos com intenção de velocidade (mesmo com carga leve) para recrutar fibras tipo 2 e evitar perda muscular.',
    sourceRef: 'Dr. Guilherme Freccia'
  },
  {
    triggerCondition: 'vitamina_d3 < 50',
    type: 'Suplementação',
    title: 'Otimização de Vitamina D',
    description: 'Suplementar D3 com TCM (gordura) pela manhã. Associar K2 e Magnésio para direcionar o cálcio.',
    sourceRef: 'Dra. Katia Haranaka'
  }
]

async function seed() {
  console.log('🌱 Starting Medical Knowledge Base Seed...\n')

  try {
    console.log('💉 Seeding Biomarkers Reference...')
    for (const bio of biomarkersData) {
      await db.insert(biomarkersReference)
        .values(bio as any)
        .onConflictDoUpdate({
          target: biomarkersReference.slug,
          set: bio as any
        })
    }
    console.log(`   ✅ Inserted/updated ${biomarkersData.length} biomarkers`)

    console.log('\n🧮 Seeding Calculated Metrics...')
    for (const metric of metricsData) {
      await db.insert(calculatedMetrics)
        .values(metric as any)
        .onConflictDoUpdate({
          target: calculatedMetrics.slug,
          set: metric as any
        })
    }
    console.log(`   ✅ Inserted/updated ${metricsData.length} metrics`)

    console.log('\n📋 Seeding Protocols...')
    // First, delete all old protocols to ensure clean state
    await db.delete(protocols)
    console.log('   🗑️ Cleared existing protocols')

    // Insert all protocols fresh
    for (const proto of protocolsData) {
      await db.insert(protocols).values(proto as any)
    }
    const protocolCount = protocolsData.length
    console.log(`   ✅ Inserted ${protocolCount} new protocols`)

    console.log('\n✅ Medical Knowledge Seed completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Biomarkers: ${biomarkersData.length}`)
    console.log(`   - Metrics: ${metricsData.length}`)
    console.log(`   - Protocols: ${protocolCount}`)
  } catch (error) {
    console.error('\n❌ Error seeding knowledge base:', error)
    process.exit(1)
  }
}

seed()
  .then(() => {
    console.log('\n🎉 Seed process finished!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
