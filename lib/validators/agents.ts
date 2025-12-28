import { z } from 'zod'

export const generatePromptRequestSchema = z.object({
  promptType: z
    .enum(['system', 'analysis'], {
      errorMap: () => ({ message: 'promptType inválido. Use "system" ou "analysis".' }),
    }),
  agentData: z.object({
    name: z.string().min(1, 'name é obrigatório'),
    title: z.string().min(1, 'title é obrigatório'),
    description: z.string().min(1, 'description é obrigatório'),
    knowledgeAccessType: z.enum(['full', 'restricted']).default('full'),
    allowedCategories: z.array(z.string()).default([]),
  }),
})

export type GeneratePromptRequest = z.infer<typeof generatePromptRequestSchema>
