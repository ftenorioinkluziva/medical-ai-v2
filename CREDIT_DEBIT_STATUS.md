# Status do Débito de Créditos

## ✅ Operações COM Débito de Créditos

### 1. Análise com Agente
- **Arquivo:** `app/api/agents/[agentId]/analyze/route.ts`
- **Status:** ✅ COMPLETO
- **Débito:** Real (baseado em tokens usados)
- **Logs:** `💰 [ANALYSIS-API] Debited X credits for Y tokens`

### 2. Geração de Recomendações
- **Arquivo:** `app/api/recommendations/generate/route.ts`
- **Status:** ✅ COMPLETO
- **Débito:** Real (baseado em tokens usados)
- **Estimativa pré-geração:** 100 créditos (100k tokens)
- **Logs:** `💰 [RECOMMENDATIONS-API] Debited X credits for Y tokens`
- **Mudanças:**
  - Modificado `lib/ai/recommendations/generate.ts` para retornar `usage`
  - Adicionada verificação de créditos ANTES da geração (402 se insuficiente)
  - Adicionado débito DEPOIS da geração
  - Retorna `creditsDebited` na resposta

### 3. Geração de Plano Semanal
- **Arquivo:** `app/api/weekly-plan/generate/route.ts`
- **Status:** ✅ IMPLEMENTADO (estimativa)
- **Débito:** Estimado (80k tokens = 80 créditos)
- **Logs:** `💰 [WEEKLY-PLAN] Debited X credits (estimated)`
- **Mudanças:**
  - Adicionada verificação de créditos ANTES da geração (402 se insuficiente)
  - Adicionado débito DEPOIS da geração (usando estimativa)
  - Retorna `creditsDebited` na resposta
- **TODO:** Modificar generators para retornar usage real

---

## ⏳ Operações SEM Débito de Créditos (Menor Prioridade)

### 4. Estruturação de Documentos (Upload)
- **Arquivo:** `lib/documents/structuring.ts::structureMedicalDocument()`
- **Quando:** Durante upload de documento (opcional)
- **Estimativa:** ~10 créditos (~10k tokens)
- **Status:** ❌ NÃO IMPLEMENTADO
- **Motivo:** Operação menos frequente, pode ser implementada depois

### 5. OCR de Imagens (Vision API)
- **Arquivo:** `lib/documents/vision-processor.ts::extractTextFromImage()`
- **Quando:** Durante upload de imagem
- **Estimativa:** ~5 créditos (~5k tokens)
- **Status:** ❌ NÃO IMPLEMENTADO
- **Motivo:** Operação menos frequente, pode ser implementada depois

### 6. Embeddings para RAG
- **Arquivo:** `lib/ai/core/embeddings.ts::generateEmbedding()`
- **Quando:** Durante análise, recomendações, planos
- **Custo:** Muito baixo (~$0.01875 por 1M tokens)
- **Status:** ❌ NÃO IMPLEMENTADO
- **Decisão:** Incluído no custo da operação principal (ignorado)

---

## 📊 Cobertura Atual

### Operações do Usuário
- ✅ **Análise** - 100% coberto (débito real)
- ✅ **Recomendações** - 100% coberto (débito real)
- ✅ **Plano Semanal** - 100% coberto (débito estimado)
- ⏳ **Upload de Documento** - 0% coberto (baixa prioridade)

### Percentual de Tokens Cobertos
- **Estimativa:** ~90-95% dos tokens usados estão sendo debitados
- **Não coberto:** Estruturação de documentos (~5-10%)

---

## 🧪 Como Testar

### Teste 1: Recomendações
```bash
# 1. Ver saldo atual
pnpm tsx --env-file=.env.local scripts/debug-payment.ts

# 2. Gerar recomendações via interface
# - Fazer análise se necessário
# - Clicar em "Gerar Recomendações"
# - Ver logs no terminal do dev server

# 3. Verificar débito
pnpm tsx --env-file=.env.local scripts/debug-payment.ts
# Deve mostrar:
# - Balance diminuído
# - Total Used aumentado
# - Nova transação tipo "debit" com operation "generate_recommendations"
```

### Teste 2: Plano Semanal
```bash
# 1. Ver saldo atual
pnpm tsx --env-file=.env.local scripts/debug-payment.ts

# 2. Gerar plano semanal via interface
# - Fazer análise se necessário
# - Clicar em "Gerar Plano Semanal"
# - Ver logs no terminal do dev server

# 3. Verificar débito
pnpm tsx --env-file=.env.local scripts/debug-payment.ts
# Deve mostrar:
# - Balance diminuído em ~80 créditos
# - Nova transação com operation "generate_weekly_plan"
```

### Teste 3: Créditos Insuficientes
```bash
# 1. Reduzir saldo para 10 créditos
pnpm tsx --env-file=.env.local scripts/add-test-credits.ts test@paridaderisco.com -90

# 2. Tentar gerar recomendações ou plano
# Deve retornar erro 402 com detalhes:
# {
#   "error": "Créditos insuficientes",
#   "details": {
#     "required": 100,
#     "current": 10,
#     "shortfall": 90
#   }
# }
```

---

## 📝 Logs Esperados

### Recomendações (Success)
```
💰 [RECOMMENDATIONS-API] Credit check: required=100, current=150
💡 [RECOMMENDATIONS-API] Generating recommendations for analysis: xxx
💡 [RECOMMENDATIONS] Generating for analysis: xxx
🧠 [RECOMMENDATIONS] Searching knowledge base...
🤖 [RECOMMENDATIONS] Generating AI recommendations...
📊 [RECOMMENDATIONS] Token usage: 45123 tokens
✅ [RECOMMENDATIONS] Generated 8 exam recommendations
💾 [RECOMMENDATIONS] Saved to database: xxx
✅ [RECOMMENDATIONS-API] Recommendations generated: xxx
💰 [RECOMMENDATIONS-API] Debited 45 credits for 45123 tokens
```

### Recomendações (Insuficiente)
```
💰 [RECOMMENDATIONS-API] Credit check: required=100, current=10
❌ Retorna 402 Payment Required
```

### Plano Semanal (Success)
```
💰 [WEEKLY-PLAN] Credit check: required=80, current=150
🤖 [WEEKLY-PLAN] Generating all plans in parallel...
✅ [WEEKLY-PLAN] All plans generated successfully
💾 [WEEKLY-PLAN] Saving to database...
✅ [WEEKLY-PLAN] Plan saved: xxx
💰 [WEEKLY-PLAN] Debited 80 credits (estimated)
```

---

## 🔮 Próximos Passos (Opcional)

### Melhorias Futuras
1. **Plano Semanal:** Modificar generators para retornar usage real (em vez de estimativa)
2. **Document Structuring:** Adicionar débito durante upload
3. **OCR:** Adicionar débito durante processamento de imagem
4. **Dashboard:** Mostrar breakdown de gastos por tipo de operação
5. **Alertas:** Notificar usuário quando créditos < 20

### Otimizações
1. **Ajustar Estimativas:** Coletar dados reais de uso e ajustar ESTIMATED_TOKENS
2. **Cache:** Implementar cache de embeddings para reduzir custos
3. **Tiers:** Criar planos com créditos incluídos (ex: Professional = 500 créditos/mês)

---

## 📊 Resumo

| Operação | Status | Tipo Débito | Prioridade |
|----------|--------|-------------|------------|
| Análise | ✅ | Real | Alta |
| Recomendações | ✅ | Real | Alta |
| Plano Semanal | ✅ | Estimado | Alta |
| Estruturação Doc | ❌ | - | Baixa |
| OCR Imagem | ❌ | - | Baixa |
| Embeddings | ❌ | Incluído | N/A |

**Cobertura Atual:** ~90-95% dos tokens usados estão sendo debitados corretamente.
