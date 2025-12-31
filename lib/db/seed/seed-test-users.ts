/**
 * Seed script to create 20 test users with varied medical profiles
 * Each user will have different lab reports and bioimpedance data
 * to test AI agents with diverse medical scenarios
 */

import { db } from '../client'
import { users, medicalProfiles, documents } from '../schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

// Helper to generate CPF (fake but formatted)
function generateCPF(index: number): string {
  const base = String(index).padStart(9, '0')
  return `${base.slice(0, 3)}.${base.slice(3, 6)}.${base.slice(6, 9)}-${String(index % 100).padStart(2, '0')}`
}

// Helper to generate lab report document
function generateLabReport(
  name: string,
  age: number,
  sex: 'M' | 'F',
  cpf: string,
  adjustments: any
): any {
  const examDate = new Date()
  examDate.setDate(examDate.getDate() - Math.floor(Math.random() * 30)) // Random date within last 30 days

  // Base template structure
  const report = {
    documentType: 'lab_report',
    patientInfo: {
      name,
      age,
      sex,
      id_cpf: cpf,
      id_rg: `${Math.floor(Math.random() * 9000000) + 1000000} DF`,
      dateOfBirth: new Date(new Date().getFullYear() - age, 5, 15).toISOString().split('T')[0],
    },
    providerInfo: {
      name: 'Sabin Diagnóstico e Saúde',
      doctor: 'LUCAS DE ALBUQUERQUE FONSECA',
      address: 'Av. Comercial n°2081 Loja 02.',
    },
    examDate: examDate.toISOString().split('T')[0],
    overallSummary: '',
    modules: [] as any[],
  }

  // Helper to determine status
  const getStatus = (value: number, min: number, max: number) => {
    if (value < min) return 'low'
    if (value > max) return 'high'
    return 'normal'
  }

  // Hemograma module
  const hemoglobin = adjustments.hemoglobin || (sex === 'M' ? 15.4 : 13.5)
  const hemoglobinStatus = getStatus(hemoglobin, sex === 'M' ? 13.5 : 12.0, sex === 'M' ? 17.5 : 15.5)

  report.modules.push({
    moduleName: 'HEMOGRAMA COMPLETO',
    category: 'Hematologia',
    status: hemoglobinStatus === 'normal' ? 'normal' : 'abnormal',
    summary: hemoglobinStatus === 'normal'
      ? 'Todos os parâmetros do hemograma completo estão dentro das faixas de referência normais.'
      : `Hemoglobina ${hemoglobinStatus === 'low' ? 'baixa' : 'elevada'}, outros parâmetros normais.`,
    parameters: [
      { name: 'HEMÁCIAS', value: sex === 'M' ? 4.9 : 4.3, unit: 'milhões/mm3' },
      { name: 'HEMOGLOBINA', value: hemoglobin, unit: 'g/dL' },
      { name: 'HEMATÓCRITO', value: sex === 'M' ? 44.1 : 39.5, unit: '%' },
      { name: 'VCM', value: 90, unit: 'fl' },
      { name: 'HCM', value: 31.4, unit: 'pg' },
      { name: 'CHCM', value: 34.9, unit: 'g/dl' },
      { name: 'RDW', value: 11.9, unit: '%' },
      { name: 'LEUCÓCITOS', value: 5810, unit: '/mm3' },
      { name: 'PLAQUETAS', value: 204, unit: 'x 10³/mm3' },
    ],
  })

  // Ferro Sérico
  const ironSerum = adjustments.ironSerum || 111
  report.modules.push({
    moduleName: 'FERRO SÉRICO',
    category: 'Bioquímica',
    status: getStatus(ironSerum, 65, 175) === 'normal' ? 'normal' : 'abnormal',
    summary: `O nível de ferro sérico está ${getStatus(ironSerum, 65, 175) === 'normal' ? 'dentro da faixa de referência normal' : 'alterado'}.`,
    parameters: [{ name: 'FERRO SÉRICO', value: ironSerum, unit: 'μg/dL' }],
  })

  // Ferritina
  const ferritin = adjustments.ferritin
  const ferritinStatus = getStatus(ferritin, sex === 'M' ? 30 : 15, sex === 'M' ? 400 : 150)
  report.modules.push({
    moduleName: 'FERRITINA',
    category: 'Bioquímica',
    status: ferritinStatus === 'normal' ? 'normal' : 'abnormal',
    summary: `O nível de ferritina está ${ferritinStatus === 'normal' ? 'dentro da faixa de referência normal' : ferritinStatus === 'low' ? 'baixo' : 'elevado'}.`,
    parameters: [{ name: 'FERRITINA', value: ferritin, unit: 'ng/mL' }],
  })

  // Glicose
  const glucose = adjustments.glucose
  const glucoseStatus = getStatus(glucose, 70, 99)
  report.modules.push({
    moduleName: 'GLICOSE',
    category: 'Bioquímica',
    status: glucoseStatus === 'normal' ? 'normal' : 'abnormal',
    summary: `O nível de glicose em jejum está ${glucoseStatus === 'normal' ? 'dentro da faixa de referência normal' : glucoseStatus === 'high' ? 'elevado' : 'baixo'}.`,
    parameters: [{ name: 'GLICOSE', value: glucose, unit: 'mg/dL' }],
  })

  // Insulina Basal
  const homaIr = adjustments.homaIr
  const homaStatus = homaIr <= 2.5 ? 'normal' : 'abnormal'
  report.modules.push({
    moduleName: 'INSULINA BASAL',
    category: 'Endocrinologia',
    status: homaStatus,
    summary: homaStatus === 'normal'
      ? 'A insulina basal e o índice HOMA IR estão normais.'
      : 'O índice HOMA IR está elevado, indicando possível resistência à insulina.',
    parameters: [
      { name: 'INSULINA BASAL', value: homaIr <= 2.5 ? 12.5 : 19.8, unit: 'μUI/mL' },
      { name: 'HOMA IR', value: homaIr, unit: 'n/a' },
    ],
  })

  // HbA1c
  const hba1c = adjustments.hba1c
  const hba1cStatus = getStatus(hba1c, 4.0, 5.6)
  report.modules.push({
    moduleName: 'HEMOGLOBINA GLICADA - HbA1c',
    category: 'Endocrinologia',
    status: hba1cStatus === 'normal' ? 'normal' : 'abnormal',
    summary: `A hemoglobina glicada (HbA1c) está ${hba1cStatus === 'normal' ? 'dentro dos valores considerados normais' : hba1cStatus === 'high' ? 'elevada' : 'baixa'}.`,
    parameters: [
      { name: 'HEMOGLOBINA GLICADA - HbA1c', value: hba1c, unit: '%' },
      { name: 'GLICEMIA MÉDIA ESTIMADA', value: Math.round((hba1c * 28.7) - 46.7), unit: 'mg/dL' },
    ],
  })

  // Lipidograma
  const cholesterolTotal = adjustments.cholesterolTotal
  const triglycerides = adjustments.triglycerides
  const hdl = adjustments.hdl
  const ldl = adjustments.ldl

  const lipidAbnormal = cholesterolTotal > 200 || triglycerides > 150 || hdl < 40 || ldl > 130

  report.modules.push({
    moduleName: 'LIPIDOGRAMA',
    category: 'Bioquímica',
    status: lipidAbnormal ? 'abnormal' : 'normal',
    summary: lipidAbnormal
      ? 'O lipidograma apresenta alterações no perfil lipídico.'
      : 'O lipidograma está dentro dos valores de referência normais.',
    parameters: [
      { name: 'COLESTEROL TOTAL', value: cholesterolTotal, unit: 'mg/dL' },
      { name: 'TRIGLICERÍDEOS', value: triglycerides, unit: 'mg/dL' },
      { name: 'COLESTEROL HDL', value: hdl, unit: 'mg/dL' },
      { name: 'COLESTEROL LDL', value: ldl, unit: 'mg/dL' },
      { name: 'COLESTEROL NÃO HDL', value: cholesterolTotal - hdl, unit: 'mg/dL' },
    ],
  })

  // Creatinina e Função Renal
  const creatinine = adjustments.creatinine
  const gfr = adjustments.gfr || Math.round(175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203) * (sex === 'F' ? 0.742 : 1))
  const renalStatus = creatinine > 1.2 || gfr < 60 ? 'abnormal' : 'normal'

  report.modules.push({
    moduleName: 'CREATININA',
    category: 'Função Renal',
    status: renalStatus,
    summary: renalStatus === 'normal'
      ? 'A creatinina e a taxa de filtração glomerular estão normais.'
      : 'A creatinina está elevada e/ou a taxa de filtração glomerular indica redução da função renal.',
    parameters: [
      { name: 'CREATININA', value: creatinine, unit: 'mg/dL' },
      { name: 'ESTIMATIVA DA TAXA DE FILTRAÇÃO GLOMERULAR', value: gfr, unit: 'mL/min/1.73m2' },
    ],
  })

  // Ureia
  if (adjustments.urea) {
    report.modules.push({
      moduleName: 'UREIA',
      category: 'Função Renal',
      status: getStatus(adjustments.urea, 10, 50) === 'normal' ? 'normal' : 'abnormal',
      summary: `O nível de ureia está ${getStatus(adjustments.urea, 10, 50) === 'normal' ? 'normal' : 'elevado'}.`,
      parameters: [{ name: 'UREIA', value: adjustments.urea, unit: 'mg/dL' }],
    })
  }

  // TGO (AST)
  const tgo = 16 + Math.floor(Math.random() * 15) // 16-30
  report.modules.push({
    moduleName: 'TRANSAMINASE OXALACÉTICA TGO (AST)',
    category: 'Função Hepática',
    status: getStatus(tgo, 0, sex === 'M' ? 40 : 32) === 'normal' ? 'normal' : 'abnormal',
    summary: `O nível de TGO (AST) está ${getStatus(tgo, 0, sex === 'M' ? 40 : 32) === 'normal' ? 'dentro da faixa de referência normal' : 'elevado'}.`,
    parameters: [{ name: 'TRANSAMINASE OXALACÉTICA TGO (AST)', value: tgo, unit: 'U/L' }],
  })

  // TGP (ALT)
  const tgp = 18 + Math.floor(Math.random() * 20) // 18-38
  report.modules.push({
    moduleName: 'TRANSAMINASE PIRÚVICA TGP (ALT)',
    category: 'Função Hepática',
    status: getStatus(tgp, 0, sex === 'M' ? 41 : 33) === 'normal' ? 'normal' : 'abnormal',
    summary: `O nível de TGP (ALT) está ${getStatus(tgp, 0, sex === 'M' ? 41 : 33) === 'normal' ? 'dentro da faixa de referência normal' : 'elevado'}.`,
    parameters: [{ name: 'TRANSAMINASE PIRÚVICA TGP (ALT)', value: tgp, unit: 'U/L' }],
  })

  // Gama GT
  const gamaGT = 20 + Math.floor(Math.random() * 15) // 20-35
  report.modules.push({
    moduleName: 'GAMA GLUTAMIL TRANSFERASE',
    category: 'Função Hepática',
    status: getStatus(gamaGT, 0, sex === 'M' ? 55 : 38) === 'normal' ? 'normal' : 'abnormal',
    summary: `O nível de Gama Glutamil Transferase está ${getStatus(gamaGT, 0, sex === 'M' ? 55 : 38) === 'normal' ? 'dentro da faixa de referência normal' : 'elevado'}.`,
    parameters: [{ name: 'GAMA GLUTAMIL TRANSFERASE', value: gamaGT, unit: 'U/L' }],
  })

  // TSH
  const tsh = adjustments.tsh
  const tshStatus = getStatus(tsh, 0.4, 4.0)
  report.modules.push({
    moduleName: 'TSH - TIREOESTIMULANTE',
    category: 'Hormônios Tireoidianos',
    status: tshStatus === 'normal' ? 'normal' : tshStatus === 'high' ? 'high' : 'low',
    summary: `O TSH está ${tshStatus === 'normal' ? 'dentro da faixa normal' : tshStatus === 'high' ? 'elevado' : 'baixo'}.`,
    parameters: [{ name: 'TSH - TIREOESTIMULANTE', value: tsh, unit: 'μUI/mL' }],
  })

  // T4 Livre
  if (adjustments.t4Livre) {
    const t4Status = getStatus(adjustments.t4Livre, 0.9, 1.7)
    report.modules.push({
      moduleName: 'T4 LIVRE',
      category: 'Hormônios Tireoidianos',
      status: t4Status === 'normal' ? 'normal' : 'abnormal',
      summary: `O nível de T4 Livre está ${t4Status === 'normal' ? 'normal' : t4Status === 'low' ? 'baixo' : 'elevado'}.`,
      parameters: [{ name: 'T4 LIVRE', value: adjustments.t4Livre, unit: 'ng/dL' }],
    })
  }

  // Anti-TPO
  if (adjustments.antiTPO) {
    report.modules.push({
      moduleName: 'ANTICORPOS ANTIPEROXIDASE (ANTI-TPO)',
      category: 'Autoimunidade Tireoidiana',
      status: adjustments.antiTPO > 34 ? 'abnormal' : 'normal',
      summary: `O nível de Anticorpos Anti-TPO está ${adjustments.antiTPO > 34 ? 'elevado, indicando possível tireoidite autoimune' : 'normal'}.`,
      parameters: [{ name: 'ANTICORPOS ANTIPEROXIDASE (ANTI-TPO)', value: adjustments.antiTPO, unit: 'UI/mL' }],
    })
  }

  // Anti-TG
  if (adjustments.antiTG) {
    report.modules.push({
      moduleName: 'ANTICORPOS ANTITIREOGLOBULINA (ANTI-TG)',
      category: 'Autoimunidade Tireoidiana',
      status: adjustments.antiTG > 115 ? 'abnormal' : 'normal',
      summary: `O nível de Anticorpos Antitireoglobulina está ${adjustments.antiTG > 115 ? 'elevado' : 'normal'}.`,
      parameters: [{ name: 'ANTICORPOS ANTITIREOGLOBULINA (ANTI-TG)', value: adjustments.antiTG, unit: 'UI/mL' }],
    })
  }

  // Testosterona
  if (adjustments.testosterone) {
    const testStatus = getStatus(adjustments.testosterone, 300, 1000)
    report.modules.push({
      moduleName: 'TESTOSTERONA TOTAL',
      category: 'Hormônios Sexuais',
      status: testStatus === 'normal' ? 'normal' : 'abnormal',
      summary: `O nível de Testosterona Total está ${testStatus === 'normal' ? 'normal' : testStatus === 'low' ? 'baixo' : 'elevado'}.`,
      parameters: [{ name: 'TESTOSTERONA TOTAL', value: adjustments.testosterone, unit: 'ng/dL' }],
    })
  }

  // LH e FSH
  if (adjustments.lh) {
    report.modules.push({
      moduleName: 'LH - HORMÔNIO LUTEINIZANTE',
      category: 'Hormônios Sexuais',
      status: 'normal',
      summary: 'O nível de LH está dentro da faixa de referência.',
      parameters: [{ name: 'LH - HORMÔNIO LUTEINIZANTE', value: adjustments.lh, unit: 'mIU/mL' }],
    })
  }

  if (adjustments.fsh) {
    report.modules.push({
      moduleName: 'FSH - HORMÔNIO FOLÍCULO ESTIMULANTE',
      category: 'Hormônios Sexuais',
      status: 'normal',
      summary: 'O nível de FSH está dentro da faixa de referência.',
      parameters: [{ name: 'FSH - HORMÔNIO FOLÍCULO ESTIMULANTE', value: adjustments.fsh, unit: 'mIU/mL' }],
    })
  }

  // Estradiol
  if (adjustments.estradiol) {
    report.modules.push({
      moduleName: 'ESTRADIOL',
      category: 'Hormônios Sexuais',
      status: 'normal',
      summary: 'O nível de Estradiol está dentro da faixa de referência.',
      parameters: [{ name: 'ESTRADIOL', value: adjustments.estradiol, unit: 'pg/mL' }],
    })
  }

  // Vitamina D
  const vitaminD = adjustments.vitaminD
  const vitDStatus = vitaminD < 20 ? 'low' : vitaminD < 30 ? 'insufficient' : 'normal'
  report.modules.push({
    moduleName: 'VITAMINA D3 25-HIDROXI',
    category: 'Vitaminas',
    status: vitDStatus === 'normal' ? 'normal' : 'abnormal',
    summary: `O nível de Vitamina D está ${vitDStatus === 'normal' ? 'adequado' : vitDStatus === 'low' ? 'baixo (deficiência)' : 'insuficiente'}.`,
    parameters: [{ name: 'VITAMINA D3 25-HIDROXI', value: vitaminD, unit: 'ng/mL' }],
  })

  // Vitamina B12
  if (adjustments.vitaminB12) {
    const b12Status = getStatus(adjustments.vitaminB12, 200, 900)
    report.modules.push({
      moduleName: 'VITAMINA B12',
      category: 'Vitaminas',
      status: b12Status === 'normal' ? 'normal' : 'abnormal',
      summary: `O nível de Vitamina B12 está ${b12Status === 'normal' ? 'normal' : b12Status === 'low' ? 'baixo' : 'elevado'}.`,
      parameters: [{ name: 'VITAMINA B12', value: adjustments.vitaminB12, unit: 'pg/mL' }],
    })
  }

  // PCR
  if (adjustments.crp) {
    const crpStatus = adjustments.crp < 3 ? 'normal' : 'high'
    report.modules.push({
      moduleName: 'PROTEÍNA C REATIVA ULTRASSENSÍVEL',
      category: 'Inflamação',
      status: crpStatus === 'normal' ? 'normal' : 'abnormal',
      summary: `O nível de PCR-us está ${crpStatus === 'normal' ? 'normal' : 'elevado, indicando processo inflamatório'}.`,
      parameters: [{ name: 'PROTEÍNA C REATIVA ULTRASSENSÍVEL', value: adjustments.crp, unit: 'mg/L' }],
    })
  }

  // Fibrinogênio
  if (adjustments.fibrinogen) {
    report.modules.push({
      moduleName: 'FIBRINOGÊNIO',
      category: 'Coagulação',
      status: adjustments.fibrinogen > 400 ? 'abnormal' : 'normal',
      summary: `O fibrinogênio está ${adjustments.fibrinogen > 400 ? 'elevado' : 'normal'}.`,
      parameters: [{ name: 'FIBRINOGÊNIO', value: adjustments.fibrinogen, unit: 'mg/dL' }],
    })
  }

  // Generate overall summary
  const abnormalModules = report.modules.filter(m => m.status === 'abnormal' || m.status === 'high' || m.status === 'low')
  if (abnormalModules.length === 0) {
    report.overallSummary = `${name} apresenta resultados laboratoriais dentro dos valores de referência normais para a maioria dos exames realizados.`
  } else {
    const issues = abnormalModules.map(m => m.moduleName).join(', ')
    report.overallSummary = `${name} apresenta alterações em: ${issues}. Os demais exames estão dentro dos valores de referência normais.`
  }

  return report
}

// Helper to generate bioimpedance document
function generateBioimpedance(
  name: string,
  sex: 'M' | 'F',
  adjustments: any
): any {
  const examDate = new Date()
  examDate.setDate(examDate.getDate() - Math.floor(Math.random() * 30))

  const weight = adjustments.weight
  const bodyFat = adjustments.bodyFat
  const skeletalMuscle = adjustments.skeletalMuscle
  const bmi = adjustments.bmi
  const visceralFat = adjustments.visceralFat

  // Calculate derived values
  const fatMass = (weight * bodyFat) / 100
  const leanMass = weight - fatMass
  const protein = leanMass * 0.20
  const minerals = leanMass * 0.067
  const water = leanMass * 0.733

  // Determine statuses
  const bmiStatus = bmi < 18.5 ? 'low' : bmi < 25 ? 'normal' : bmi < 30 ? 'overweight' : 'obese'
  const bodyFatNormal = sex === 'M' ? (bodyFat >= 10 && bodyFat <= 20) : (bodyFat >= 18 && bodyFat <= 28)
  const visceralFatStatus = visceralFat <= 9 ? 'normal' : 'high'

  const bio = {
    documentType: 'bioimpedance',
    patientInfo: {
      name,
      sex,
    },
    providerInfo: {
      name: 'InBody Brasil',
    },
    examDate: examDate.toISOString().split('T')[0],
    overallSummary: '',
    modules: [
      {
        moduleName: 'Análise da Composição Corporal',
        category: 'Composição Corporal',
        status: 'normal',
        summary: 'A análise da composição corporal mostra distribuição de água, proteína, minerais e gordura.',
        parameters: [
          { name: 'Água corporal total', value: parseFloat(water.toFixed(1)), unit: 'L' },
          { name: 'Proteína', value: parseFloat(protein.toFixed(1)), unit: 'kg' },
          { name: 'Minerais', value: parseFloat(minerals.toFixed(1)), unit: 'kg' },
          { name: 'Massa de gordura', value: parseFloat(fatMass.toFixed(1)), unit: 'kg' },
          { name: 'Peso', value: weight, unit: 'kg' },
        ],
      },
      {
        moduleName: 'Análise Músculo-Gordura',
        category: 'Composição Corporal',
        status: bodyFatNormal ? 'normal' : 'abnormal',
        summary: bodyFatNormal
          ? 'A relação músculo-gordura está adequada.'
          : 'A massa de gordura está acima do recomendado.',
        parameters: [
          { name: 'Peso', value: weight, unit: 'kg' },
          { name: 'Massa Muscular Esquelética', value: skeletalMuscle, unit: 'kg' },
          { name: 'Massa de Gordura', value: parseFloat(fatMass.toFixed(1)), unit: 'kg' },
        ],
      },
      {
        moduleName: 'Análise de Obesidade',
        category: 'Composição Corporal',
        status: bmiStatus === 'normal' && bodyFatNormal ? 'normal' : 'abnormal',
        summary: bmiStatus === 'obese'
          ? 'IMC e percentual de gordura corporal indicam obesidade.'
          : bmiStatus === 'overweight'
          ? 'IMC indica sobrepeso.'
          : bodyFatNormal
          ? 'IMC e percentual de gordura corporal estão adequados.'
          : 'Percentual de gordura corporal está elevado.',
        parameters: [
          { name: 'IMC', value: bmi, unit: 'kg/m²' },
          { name: 'PGC', value: bodyFat, unit: '%' },
        ],
      },
      {
        moduleName: 'Pontuação InBody',
        category: 'Avaliação Geral',
        status: 'normal',
        summary: 'A pontuação InBody indica a avaliação geral da composição corporal.',
        parameters: [
          { name: 'Pontuação InBody', value: bmiStatus === 'normal' && bodyFatNormal ? 82 : bmiStatus === 'obese' ? 65 : 76, unit: 'pontos' },
        ],
      },
      {
        moduleName: 'Controle de Peso',
        category: 'Recomendação',
        status: bmiStatus === 'normal' ? 'normal' : 'abnormal',
        summary: bmiStatus === 'normal'
          ? 'Peso adequado, manter.'
          : 'Recomenda-se redução de peso e gordura corporal.',
        parameters: [
          { name: 'Peso Ideal', value: parseFloat(((bmi > 25 ? 22 : bmi) * Math.pow(sex === 'M' ? 1.75 : 1.65, 2)).toFixed(1)), unit: 'kg' },
          { name: 'Controle de Peso', value: parseFloat((bmi > 25 ? (22 * Math.pow(sex === 'M' ? 1.75 : 1.65, 2) - weight) : 0).toFixed(1)), unit: 'kg' },
          { name: 'Controle de Gordura', value: parseFloat((bmi > 25 ? (22 * Math.pow(sex === 'M' ? 1.75 : 1.65, 2) - weight) : 0).toFixed(1)), unit: 'kg' },
          { name: 'Controle Muscular', value: 0, unit: 'kg' },
        ],
      },
      {
        moduleName: 'Dados adicionais',
        category: 'Metabolismo e Risco',
        status: visceralFatStatus === 'normal' ? 'normal' : 'abnormal',
        summary: visceralFatStatus === 'high'
          ? 'Gordura visceral elevada, aumentando risco cardiovascular.'
          : 'Gordura visceral dentro da faixa normal.',
        parameters: [
          { name: 'Taxa metabólica basal', value: Math.round(weight * 24 * (sex === 'M' ? 1.0 : 0.9)), unit: 'kcal' },
          { name: 'Relação Cintura-Quadril', value: sex === 'M' ? 0.92 : 0.85, referenceRange: sex === 'M' ? '0.80~0.90' : '0.70~0.80', status: 'normal' },
          { name: 'Nível de Gordura Visceral', value: visceralFat, referenceRange: '1~9', status: visceralFatStatus },
          { name: 'Grau de Obesidade', value: Math.round((bmi / 22) * 100), unit: '%' },
        ],
      },
    ],
  }

  // Generate overall summary
  const issues = []
  if (bmiStatus === 'obese') issues.push('obesidade')
  else if (bmiStatus === 'overweight') issues.push('sobrepeso')
  if (!bodyFatNormal) issues.push('percentual de gordura elevado')
  if (visceralFatStatus === 'high') issues.push('gordura visceral elevada')

  if (issues.length === 0) {
    bio.overallSummary = `${name} apresenta composição corporal adequada, com IMC, percentual de gordura e gordura visceral dentro dos valores recomendados.`
  } else {
    bio.overallSummary = `${name} apresenta ${issues.join(', ')}.`
  }

  return bio
}

// Test user profiles with varying conditions
const testUserProfiles = [
  {
    name: 'Ana Silva Santos',
    email: 'ana.silva@test.com',
    age: 28,
    sex: 'F' as const,
    condition: 'Saudável Baseline',
    labAdjustments: {
      glucose: 85,
      hba1c: 5.0,
      homaIr: 1.2,
      cholesterolTotal: 170,
      triglycerides: 80,
      hdl: 65,
      ldl: 95,
      tsh: 2.0,
      vitaminD: 40,
      ferritin: 50,
      creatinine: 0.8,
    },
    bioAdjustments: {
      weight: 58,
      bodyFat: 22,
      skeletalMuscle: 24,
      bmi: 21.5,
      visceralFat: 3,
    }
  },
  {
    name: 'Carlos Mendes Oliveira',
    email: 'carlos.mendes@test.com',
    age: 42,
    sex: 'M' as const,
    condition: 'Pré-diabético',
    labAdjustments: {
      glucose: 110,
      hba1c: 5.9,
      homaIr: 3.8,
      cholesterolTotal: 210,
      triglycerides: 180,
      hdl: 38,
      ldl: 135,
      tsh: 2.5,
      vitaminD: 28,
      ferritin: 180,
      creatinine: 1.0,
    },
    bioAdjustments: {
      weight: 85,
      bodyFat: 26,
      skeletalMuscle: 34,
      bmi: 28.2,
      visceralFat: 11,
    }
  },
  {
    name: 'Beatriz Costa Lima',
    email: 'beatriz.costa@test.com',
    age: 55,
    sex: 'F' as const,
    condition: 'Diabético Tipo 2',
    labAdjustments: {
      glucose: 140,
      hba1c: 7.2,
      homaIr: 6.5,
      cholesterolTotal: 245,
      triglycerides: 220,
      hdl: 32,
      ldl: 160,
      tsh: 3.2,
      vitaminD: 22,
      ferritin: 35,
      creatinine: 1.1,
    },
    bioAdjustments: {
      weight: 78,
      bodyFat: 38,
      skeletalMuscle: 22,
      bmi: 31.5,
      visceralFat: 14,
    }
  },
  {
    name: 'Daniel Ferreira Rocha',
    email: 'daniel.ferreira@test.com',
    age: 38,
    sex: 'M' as const,
    condition: 'Hipotireoidismo',
    labAdjustments: {
      glucose: 92,
      hba1c: 5.2,
      homaIr: 2.1,
      cholesterolTotal: 225,
      triglycerides: 160,
      hdl: 42,
      ldl: 148,
      tsh: 6.8,
      t4Livre: 0.85,
      vitaminD: 25,
      ferritin: 110,
      creatinine: 1.0,
    },
    bioAdjustments: {
      weight: 92,
      bodyFat: 28,
      skeletalMuscle: 35,
      bmi: 29.8,
      visceralFat: 12,
    }
  },
  {
    name: 'Elena Rodrigues Souza',
    email: 'elena.rodrigues@test.com',
    age: 31,
    sex: 'F' as const,
    condition: 'Hipertireoidismo',
    labAdjustments: {
      glucose: 88,
      hba1c: 5.0,
      homaIr: 1.5,
      cholesterolTotal: 155,
      triglycerides: 75,
      hdl: 70,
      ldl: 75,
      tsh: 0.2,
      t4Livre: 1.95,
      vitaminD: 35,
      ferritin: 45,
      creatinine: 0.7,
    },
    bioAdjustments: {
      weight: 52,
      bodyFat: 18,
      skeletalMuscle: 22,
      bmi: 19.2,
      visceralFat: 2,
    }
  },
  {
    name: 'Fernando Alves Santos',
    email: 'fernando.alves@test.com',
    age: 48,
    sex: 'M' as const,
    condition: 'Colesterol Alto',
    labAdjustments: {
      glucose: 95,
      hba1c: 5.3,
      homaIr: 2.3,
      cholesterolTotal: 280,
      triglycerides: 240,
      hdl: 32,
      ldl: 180,
      tsh: 2.8,
      vitaminD: 30,
      ferritin: 200,
      creatinine: 1.1,
    },
    bioAdjustments: {
      weight: 87,
      bodyFat: 27,
      skeletalMuscle: 35,
      bmi: 28.5,
      visceralFat: 13,
    }
  },
  {
    name: 'Gabriela Martins Pereira',
    email: 'gabriela.martins@test.com',
    age: 26,
    sex: 'F' as const,
    condition: 'Deficiência Vitamina D',
    labAdjustments: {
      glucose: 87,
      hba1c: 4.9,
      homaIr: 1.3,
      cholesterolTotal: 175,
      triglycerides: 85,
      hdl: 62,
      ldl: 98,
      tsh: 2.2,
      vitaminD: 15,
      ferritin: 42,
      creatinine: 0.8,
    },
    bioAdjustments: {
      weight: 60,
      bodyFat: 24,
      skeletalMuscle: 23,
      bmi: 22.0,
      visceralFat: 4,
    }
  },
  {
    name: 'Henrique Barbosa Lima',
    email: 'henrique.barbosa@test.com',
    age: 34,
    sex: 'M' as const,
    condition: 'Anemia',
    labAdjustments: {
      glucose: 90,
      hba1c: 5.1,
      homaIr: 1.8,
      cholesterolTotal: 185,
      triglycerides: 95,
      hdl: 48,
      ldl: 118,
      tsh: 2.4,
      vitaminD: 32,
      hemoglobin: 11.5,
      ferritin: 18,
      ironSerum: 45,
      creatinine: 0.9,
    },
    bioAdjustments: {
      weight: 70,
      bodyFat: 20,
      skeletalMuscle: 32,
      bmi: 23.5,
      visceralFat: 5,
    }
  },
  {
    name: 'Isabela Gomes Nascimento',
    email: 'isabela.gomes@test.com',
    age: 52,
    sex: 'F' as const,
    condition: 'Problemas Renais',
    labAdjustments: {
      glucose: 98,
      hba1c: 5.4,
      homaIr: 2.5,
      cholesterolTotal: 205,
      triglycerides: 145,
      hdl: 45,
      ldl: 132,
      tsh: 3.0,
      vitaminD: 26,
      ferritin: 65,
      creatinine: 1.8,
      urea: 55,
      gfr: 42,
    },
    bioAdjustments: {
      weight: 72,
      bodyFat: 32,
      skeletalMuscle: 24,
      bmi: 27.8,
      visceralFat: 10,
    }
  },
  {
    name: 'João Pedro Carvalho',
    email: 'joao.carvalho@test.com',
    age: 45,
    sex: 'M' as const,
    condition: 'Obesidade Grau I',
    labAdjustments: {
      glucose: 105,
      hba1c: 5.7,
      homaIr: 4.2,
      cholesterolTotal: 220,
      triglycerides: 195,
      hdl: 36,
      ldl: 142,
      tsh: 3.5,
      vitaminD: 24,
      ferritin: 250,
      creatinine: 1.0,
    },
    bioAdjustments: {
      weight: 95,
      bodyFat: 30,
      skeletalMuscle: 36,
      bmi: 31.2,
      visceralFat: 15,
    }
  },
  {
    name: 'Karla Vieira Sousa',
    email: 'karla.vieira@test.com',
    age: 39,
    sex: 'F' as const,
    condition: 'Obesidade Grau II',
    labAdjustments: {
      glucose: 118,
      hba1c: 6.2,
      homaIr: 5.5,
      cholesterolTotal: 235,
      triglycerides: 210,
      hdl: 33,
      ldl: 155,
      tsh: 4.0,
      vitaminD: 20,
      ferritin: 28,
      creatinine: 1.0,
    },
    bioAdjustments: {
      weight: 98,
      bodyFat: 42,
      skeletalMuscle: 26,
      bmi: 37.5,
      visceralFat: 18,
    }
  },
  {
    name: 'Lucas Correia Dias',
    email: 'lucas.correia@test.com',
    age: 29,
    sex: 'M' as const,
    condition: 'Atlético/Fit',
    labAdjustments: {
      glucose: 82,
      hba1c: 4.8,
      homaIr: 0.9,
      cholesterolTotal: 165,
      triglycerides: 65,
      hdl: 72,
      ldl: 85,
      tsh: 1.8,
      vitaminD: 48,
      ferritin: 120,
      creatinine: 1.1,
      testosterone: 680,
    },
    bioAdjustments: {
      weight: 78,
      bodyFat: 12,
      skeletalMuscle: 42,
      bmi: 23.8,
      visceralFat: 2,
    }
  },
  {
    name: 'Maria Eduarda Pinto',
    email: 'maria.pinto@test.com',
    age: 50,
    sex: 'F' as const,
    condition: 'Síndrome Metabólica',
    labAdjustments: {
      glucose: 115,
      hba1c: 6.0,
      homaIr: 5.0,
      cholesterolTotal: 240,
      triglycerides: 230,
      hdl: 30,
      ldl: 165,
      tsh: 3.8,
      vitaminD: 21,
      ferritin: 40,
      creatinine: 1.1,
      crp: 4.5,
    },
    bioAdjustments: {
      weight: 85,
      bodyFat: 40,
      skeletalMuscle: 24,
      bmi: 33.2,
      visceralFat: 16,
    }
  },
  {
    name: 'Nicolas Azevedo Costa',
    email: 'nicolas.azevedo@test.com',
    age: 47,
    sex: 'M' as const,
    condition: 'Testosterona Baixa',
    labAdjustments: {
      glucose: 96,
      hba1c: 5.3,
      homaIr: 2.8,
      cholesterolTotal: 210,
      triglycerides: 170,
      hdl: 40,
      ldl: 136,
      tsh: 2.9,
      vitaminD: 27,
      ferritin: 180,
      creatinine: 1.0,
      testosterone: 245,
      lh: 2.1,
      fsh: 2.0,
    },
    bioAdjustments: {
      weight: 82,
      bodyFat: 28,
      skeletalMuscle: 32,
      bmi: 27.5,
      visceralFat: 11,
    }
  },
  {
    name: 'Olivia Teixeira Almeida',
    email: 'olivia.teixeira@test.com',
    age: 54,
    sex: 'F' as const,
    condition: 'Menopausa',
    labAdjustments: {
      glucose: 100,
      hba1c: 5.5,
      homaIr: 2.9,
      cholesterolTotal: 230,
      triglycerides: 165,
      hdl: 48,
      ldl: 150,
      tsh: 3.3,
      vitaminD: 23,
      ferritin: 125,
      creatinine: 0.9,
      fsh: 85,
      lh: 42,
      estradiol: 12,
    },
    bioAdjustments: {
      weight: 70,
      bodyFat: 35,
      skeletalMuscle: 22,
      bmi: 28.5,
      visceralFat: 12,
    }
  },
  {
    name: 'Pedro Henrique Ribeiro',
    email: 'pedro.ribeiro@test.com',
    age: 24,
    sex: 'M' as const,
    condition: 'Jovem Saudável',
    labAdjustments: {
      glucose: 84,
      hba1c: 4.9,
      homaIr: 1.1,
      cholesterolTotal: 160,
      triglycerides: 70,
      hdl: 65,
      ldl: 88,
      tsh: 1.9,
      vitaminD: 42,
      ferritin: 95,
      creatinine: 0.9,
      testosterone: 620,
    },
    bioAdjustments: {
      weight: 75,
      bodyFat: 16,
      skeletalMuscle: 38,
      bmi: 23.2,
      visceralFat: 3,
    }
  },
  {
    name: 'Quitéria Monteiro Silva',
    email: 'quiteria.monteiro@test.com',
    age: 68,
    sex: 'F' as const,
    condition: 'Idosa Múltiplas Condições',
    labAdjustments: {
      glucose: 125,
      hba1c: 6.5,
      homaIr: 5.2,
      cholesterolTotal: 250,
      triglycerides: 200,
      hdl: 35,
      ldl: 170,
      tsh: 5.5,
      t4Livre: 0.95,
      vitaminD: 18,
      vitaminB12: 280,
      ferritin: 32,
      creatinine: 1.4,
      gfr: 48,
      crp: 5.2,
    },
    bioAdjustments: {
      weight: 68,
      bodyFat: 38,
      skeletalMuscle: 18,
      bmi: 29.8,
      visceralFat: 13,
    }
  },
  {
    name: 'Rafael Castro Nunes',
    email: 'rafael.castro@test.com',
    age: 36,
    sex: 'M' as const,
    condition: 'Tireoidite Autoimune',
    labAdjustments: {
      glucose: 91,
      hba1c: 5.1,
      homaIr: 2.0,
      cholesterolTotal: 215,
      triglycerides: 150,
      hdl: 44,
      ldl: 145,
      tsh: 7.2,
      t4Livre: 0.88,
      antiTPO: 285,
      antiTG: 420,
      vitaminD: 28,
      ferritin: 130,
      creatinine: 1.0,
    },
    bioAdjustments: {
      weight: 84,
      bodyFat: 25,
      skeletalMuscle: 35,
      bmi: 27.8,
      visceralFat: 10,
    }
  },
  {
    name: 'Sofia Campos Araújo',
    email: 'sofia.campos@test.com',
    age: 41,
    sex: 'F' as const,
    condition: 'Inflamação Alta',
    labAdjustments: {
      glucose: 102,
      hba1c: 5.6,
      homaIr: 3.2,
      cholesterolTotal: 225,
      triglycerides: 185,
      hdl: 38,
      ldl: 148,
      tsh: 3.2,
      vitaminD: 25,
      ferritin: 45,
      creatinine: 0.9,
      crp: 8.5,
      fibrinogen: 420,
    },
    bioAdjustments: {
      weight: 76,
      bodyFat: 33,
      skeletalMuscle: 24,
      bmi: 29.2,
      visceralFat: 13,
    }
  },
  {
    name: 'Thiago Moreira Fonseca',
    email: 'thiago.moreira@test.com',
    age: 58,
    sex: 'M' as const,
    condition: 'Sarcopenia',
    labAdjustments: {
      glucose: 97,
      hba1c: 5.4,
      homaIr: 2.4,
      cholesterolTotal: 195,
      triglycerides: 125,
      hdl: 46,
      ldl: 125,
      tsh: 3.0,
      vitaminD: 22,
      vitaminB12: 325,
      ferritin: 155,
      creatinine: 1.2,
      testosterone: 320,
    },
    bioAdjustments: {
      weight: 68,
      bodyFat: 24,
      skeletalMuscle: 26,
      bmi: 24.5,
      visceralFat: 8,
    }
  },
]

async function main() {
  console.log('🌱 Starting seed of 20 test users with varied medical profiles...\n')

  // Delete existing test users first (emails ending with @test.com)
  console.log('🗑️  Checking for existing test users...')
  const existingTestUsers = await db.query.users.findMany({
    where: (users, { like }) => like(users.email, '%@test.com'),
  })

  if (existingTestUsers.length > 0) {
    console.log(`Found ${existingTestUsers.length} existing test users. Deleting...\n`)
    for (const user of existingTestUsers) {
      // Delete user's documents
      await db.delete(documents).where(eq(documents.userId, user.id))
      // Delete user's profile
      await db.delete(medicalProfiles).where(eq(medicalProfiles.userId, user.id))
      // Delete user
      await db.delete(users).where(eq(users.id, user.id))
    }
    console.log('✓ Existing test users deleted\n')
  } else {
    console.log('No existing test users found\n')
  }

  for (let i = 0; i < testUserProfiles.length; i++) {
    const profile = testUserProfiles[i]
    const cpf = generateCPF(i + 1)

    console.log(`Creating user ${i + 1}/20: ${profile.name} (${profile.condition})`)

    // Create user
    const hashedPassword = await bcrypt.hash('test123', 10)
    const [user] = await db.insert(users).values({
      email: profile.email,
      passwordHash: hashedPassword,
      name: profile.name,
      role: 'patient',
    }).returning()

    console.log(`  ✓ User created: ${user.email}`)

    // Create profile
    await db.insert(medicalProfiles).values({
      userId: user.id,
      age: profile.age,
      gender: profile.sex === 'M' ? 'Masculino' : 'Feminino',
      height: profile.sex === 'M' ? 175 : 165,
      weight: profile.bioAdjustments.weight,
      allergies: [],
      medicalConditions: [profile.condition],
      medications: [],
      familyHistory: 'Sem histórico familiar reportado',
    })

    console.log(`  ✓ Profile created`)

    // Create lab report document
    const labReport = generateLabReport(
      profile.name,
      profile.age,
      profile.sex,
      cpf,
      profile.labAdjustments
    )

    const labReportExtracted = `Documento: Exame Laboratorial
Paciente: ${labReport.patientInfo.name}
Data do Exame: ${labReport.examDate}

Resumo Geral:
${labReport.overallSummary}

Módulos Analisados:
${labReport.modules.map((m: any) => `
${m.moduleName} (${m.category}) - Status: ${m.status}
${m.summary}
Parâmetros:
${m.parameters.map((p: any) => `  - ${p.name}: ${p.value} ${p.unit}`).join('\n')}
`).join('\n')}
`

    await db.insert(documents).values({
      userId: user.id,
      fileName: `lab_report_${user.id}.json`,
      fileType: 'application/json',
      fileSize: JSON.stringify(labReport).length,
      documentType: 'lab_report',
      processingStatus: 'completed',
      extractedText: labReportExtracted,
      structuredData: labReport,
    })

    console.log(`  ✓ Lab report created`)

    // Create bioimpedance document
    const bioimpedance = generateBioimpedance(
      profile.name,
      profile.sex,
      profile.bioAdjustments
    )

    const bioExtracted = `Documento: Bioimpedância
Paciente: ${bioimpedance.patientInfo.name}
Data do Exame: ${bioimpedance.examDate}

Resumo Geral:
${bioimpedance.overallSummary}

Módulos Analisados:
${bioimpedance.modules.map((m: any) => `
${m.moduleName} (${m.category}) - Status: ${m.status}
${m.summary}
Parâmetros:
${m.parameters.map((p: any) => `  - ${p.name}: ${p.value} ${p.unit}`).join('\n')}
`).join('\n')}
`

    await db.insert(documents).values({
      userId: user.id,
      fileName: `bioimpedance_${user.id}.json`,
      fileType: 'application/json',
      fileSize: JSON.stringify(bioimpedance).length,
      documentType: 'bioimpedance',
      processingStatus: 'completed',
      extractedText: bioExtracted,
      structuredData: bioimpedance,
    })

    console.log(`  ✓ Bioimpedance document created`)

    console.log(`  ✓ User ${profile.name} completed\n`)
  }

  console.log('✅ Seed completed! 20 test users created successfully.')
  console.log('\nTest users login:')
  console.log('Email: [any user email above]')
  console.log('Password: test123')
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
