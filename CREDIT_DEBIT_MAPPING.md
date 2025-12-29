# Mapeamento de Débito de Créditos

## Operações que Usam API do Gemini

### ✅ JÁ IMPLEMENTADO

#### 1. Análise com Agente (`/api/agents/[agentId]/analyze`)
- **Arquivo:** `app/api/agents/[agentId]/analyze/route.ts`
- **Função:** `analyzeWithAgent()`
- **Status:** ✅ Implementado (linhas 54-74 e 342-359)
- **Débito:** Baseado em `result.usage.totalTokens`
- **Logs:** `💰 [ANALYSIS-API] Debited X credits`

---

### ❌ NÃO IMPLEMENTADO

#### 2. Geração de Recomendações (`/api/recommendations/generate`)
- **Arquivo:** `app/api/recommendations/generate/route.ts`
- **Função:** `generateRecommendations()` em `lib/ai/recommendations/generate.ts`
- **Uso de API:**
  - Embeddings para busca RAG: `lib/ai/core/embeddings.ts::generateEmbedding()`
  - Geração de texto: `lib/ai/core/generate.ts::generateMedicalAnalysis()`
- **Estimativa:** ~50,000-100,000 tokens (depende do contexto RAG)
- **Necessário:**
  1. Verificar créditos ANTES de gerar
  2. Debitar créditos DEPOIS de gerar
  3. Capturar `usage` da resposta

#### 3. Geração de Plano Semanal (`/api/weekly-plan/generate`)
- **Arquivo:** `app/api/weekly-plan/generate/route.ts`
- **Função:** `generateWeeklyPlan()` em `lib/ai/weekly-plans/generators.ts`
- **Uso de API:**
  - Embeddings para RAG (se usado)
  - Geração de texto: `generateObject()` ou `generateText()`
- **Estimativa:** ~30,000-80,000 tokens
- **Necessário:** Mesmo que recomendações

#### 4. Estruturação de Documentos (durante upload)
- **Arquivo:** `lib/documents/structuring.ts::structureMedicalDocument()`
- **Chamada em:** `lib/documents/processor.ts::processDocument()`
- **Uso de API:** `generateObject()` para extrair dados estruturados
- **Estimativa:** ~5,000-20,000 tokens (depende do tamanho do documento)
- **Necessário:**
  1. Passar `userId` para `processDocument()`
  2. Verificar/debitar créditos durante estruturação
  3. Opcional: Fazer estruturação opcional (usuário escolhe)

#### 5. Processamento de Imagens (OCR via Vision)
- **Arquivo:** `lib/documents/vision-processor.ts::extractTextFromImage()`
- **Chamada em:** `lib/documents/processor.ts`
- **Uso de API:** Gemini 2.5 Flash com visão multimodal
- **Estimativa:** ~2,000-10,000 tokens (depende do tamanho da imagem)
- **Necessário:** Débito durante processamento de imagem

#### 6. Embeddings para Busca RAG
- **Arquivo:** `lib/ai/core/embeddings.ts::generateEmbedding()`
- **Usado em:** Recomendações, análises, planos semanais
- **Custo:** Muito baixo (~$0.01875 por 1M tokens com Google)
- **Decisão:** Pode incluir no custo da operação principal OU ignorar

---

## Estratégia de Implementação

### Opção 1: Débito Individual (Mais Preciso)
Debitar créditos em cada operação separadamente:
- ✅ Mais preciso
- ✅ Usuário vê exatamente o que gastou
- ❌ Mais complexo de implementar

### Opção 2: Débito Agregado (Mais Simples)
Debitar créditos apenas nas APIs principais (análise, recomendações, plano semanal):
- ✅ Mais simples
- ✅ Inclui embeddings no custo da operação
- ❌ Menos granular

**RECOMENDAÇÃO:** Opção 2 (Débito Agregado)

---

## Prioridade de Implementação

### Alta Prioridade (Usuário Usa Frequentemente)
1. **Geração de Recomendações** - Usuário gera após cada análise
2. **Geração de Plano Semanal** - Usuário gera periodicamente

### Média Prioridade
3. **Estruturação de Documentos** - Durante upload (opcional)
4. **Processamento de Imagens** - Durante upload de imagens

### Baixa Prioridade
5. **Embeddings** - Incluir no custo da operação principal

---

## Implementação Necessária

### 1. Recommendations API (`app/api/recommendations/generate/route.ts`)

**ANTES da geração:**
```typescript
import { getUserCredits, calculateCreditsFromTokens } from '@/lib/billing/credits'

const ESTIMATED_TOKENS = 100000
const estimatedCredits = calculateCreditsFromTokens(ESTIMATED_TOKENS)
const userCreditsData = await getUserCredits(session.user.id)

if (userCreditsData.balance < estimatedCredits) {
  return NextResponse.json(
    { error: 'Insufficient credits', details: { ... } },
    { status: 402 }
  )
}
```

**DEPOIS da geração:**
```typescript
const tokensUsed = result.usage?.totalTokens || 0
if (tokensUsed > 0) {
  await debitCredits(session.user.id, tokensUsed, {
    recommendationId: recommendation.id,
    operation: 'generate_recommendations',
    ...
  })
}
```

### 2. Weekly Plan API (`app/api/weekly-plan/generate/route.ts`)
- Mesmo padrão que recomendações

### 3. Document Processing (`lib/documents/processor.ts`)
- Passar `userId` como parâmetro
- Debitar após estruturação/OCR

---

## Estimativas de Custo

### Por Operação (em créditos)
- **Análise com Agente:** ~100 créditos (~100k tokens)
- **Recomendações:** ~75 créditos (~75k tokens)
- **Plano Semanal:** ~50 créditos (~50k tokens)
- **Estruturação de Documento:** ~10 créditos (~10k tokens)
- **OCR de Imagem:** ~5 créditos (~5k tokens)

### Fluxo Completo do Usuário
Upload documento → Estruturar → Analisar → Recomendações → Plano Semanal
= ~10 + ~100 + ~75 + ~50 = **~235 créditos** (R$ 0.50 cada = **R$ 117.50**)

**Custo real da API Google:**
- ~235k tokens × $0.075/1M = ~$0.018 (~R$ 0.09)
- **Margem:** ~1300x

---

## Próximos Passos

1. ✅ Mapear todas as operações
2. ⏳ Implementar débito em `/api/recommendations/generate`
3. ⏳ Implementar débito em `/api/weekly-plan/generate`
4. ⏳ Implementar débito em document processing
5. ⏳ Testar fluxo completo
6. ⏳ Atualizar estimativas de créditos (podem estar muito altas)
