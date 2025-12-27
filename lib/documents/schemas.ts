/**
 * Zod Schemas for Structured Medical Documents
 * Used with Gemini's native structured output for guaranteed JSON validation
 */

import { z } from 'zod'

/**
 * Parameter within a medical module (e.g., Hemoglobina, Glicose)
 */
export const ParameterSchema = z.object({
  name: z.string().describe('Nome do parâmetro médico'),
  value: z.union([z.string(), z.number()]).describe('Valor medido'),
  unit: z.string().optional().describe('Unidade de medida (mg/dL, g/dL, etc)'),
  referenceRange: z.string().optional().describe('Faixa de referência normal'),
  status: z.enum(['normal', 'high', 'low', 'borderline']).optional().describe('Status em relação à faixa de referência'),
})

/**
 * Medical module (e.g., Hemograma Completo, Lipidograma)
 */
export const ModuleSchema = z.object({
  moduleName: z.string().describe('Nome do módulo (ex: Hemograma Completo, TSH, Bioimpedância)'),
  category: z.string().describe('Categoria médica (ex: Hematologia, Endocrinologia, Composição Corporal)'),
  status: z.enum(['normal', 'abnormal', 'high', 'low', 'borderline', 'n/a']).describe('Status geral do módulo'),
  summary: z.string().describe('Resumo dos principais achados deste módulo'),
  parameters: z.array(ParameterSchema).describe('Lista de parâmetros medidos'),
})

/**
 * Patient information
 */
export const PatientInfoSchema = z.object({
  name: z.string().optional().describe('Nome completo do paciente'),
  age: z.number().optional().describe('Idade do paciente'),
  sex: z.enum(['M', 'F']).optional().describe('Sexo do paciente'),
  id_cpf: z.string().optional().describe('CPF do paciente'),
  id_rg: z.string().optional().describe('RG do paciente'),
  dateOfBirth: z.string().optional().describe('Data de nascimento (YYYY-MM-DD)'),
})

/**
 * Provider/Laboratory information
 */
export const ProviderInfoSchema = z.object({
  name: z.string().optional().describe('Nome do laboratório ou clínica'),
  doctor: z.string().optional().describe('Médico solicitante'),
  address: z.string().optional().describe('Endereço do laboratório'),
})

/**
 * Complete structured medical document
 */
export const StructuredMedicalDocumentSchema = z.object({
  documentType: z.enum([
    'lab_report',
    'bioimpedance',
    'medical_report',
    'prescription',
    'imaging',
    'other'
  ]).describe('Tipo de documento médico'),

  patientInfo: PatientInfoSchema.describe('Informações do paciente'),

  providerInfo: ProviderInfoSchema.describe('Informações do laboratório/clínica'),

  examDate: z.string().optional().describe('Data do exame (YYYY-MM-DD)'),

  overallSummary: z.string().describe('Resumo geral dos achados em 2-3 frases'),

  modules: z.array(ModuleSchema).describe('Módulos de exames organizados por categoria'),
})

/**
 * TypeScript type inferred from schema
 */
export type StructuredMedicalDocument = z.infer<typeof StructuredMedicalDocumentSchema>
export type MedicalModule = z.infer<typeof ModuleSchema>
export type MedicalParameter = z.infer<typeof ParameterSchema>
export type PatientInfo = z.infer<typeof PatientInfoSchema>
export type ProviderInfo = z.infer<typeof ProviderInfoSchema>
