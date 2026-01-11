# 📋 Changelog - Sistema de Auditoria de Conhecimento

## ✅ Atualizações Realizadas - Janeiro 2026

### 🤖 Atualização de Modelo IA

**Mudança:** `gemini-2.0-flash-exp` → `gemini-2.5-pro`

**Razões:**
- ✅ `gemini-2.5-pro` é versão **estável** (não experimental)
- ✅ Melhor para **raciocínio avançado** e análise complexa
- ✅ Saída estruturada nativa otimizada
- ✅ 1M tokens de contexto (processa artigos médicos longos)
- ✅ Recomendado oficialmente para tarefas críticas

**Impacto:**
- 🎯 Maior precisão na extração de valores de referência
- 🎯 Melhor identificação de protocolos em textos complexos
- 🎯 Menos erros e alucinações
- ⚠️ Custo moderado (mas justificado pela criticidade)

---

### ⚙️ Configurações Centralizadas

**Novo bloco de configuração** no início do script:

```typescript
const CONFIG = {
  model: 'gemini-2.5-pro',     // Modelo IA configurável
  articleLimit: 10,             // Limite de artigos (0 = todos)
  delayBetweenCalls: 1000,      // Delay entre chamadas (ms)
  temperature: 0.1,             // Temperatura da IA (0.0-1.0)
}
```

**Benefícios:**
- ✅ Fácil trocar modelo sem buscar código
- ✅ Ajustar limite para testes rápidos
- ✅ Controlar rate limiting
- ✅ Temperatura configurável (conservador vs criativo)

---

### 📊 Relatório Aprimorado

**Adicionado ao relatório:**
- Modelo IA usado
- Temperatura configurada
- Timestamp detalhado

**Antes:**
```markdown
# Relatório de Auditoria
Data: 09/01/2026
```

**Depois:**
```markdown
# Relatório de Auditoria
Data: 09/01/2026
Modelo IA: gemini-2.5-pro
Temperatura: 0.1
```

**Benefício:** Rastreabilidade completa para auditoria futura

---

### 📚 Documentação Criada

#### 1. `docs/MODELOS-GEMINI-COMPARACAO.md`
Guia completo de modelos Gemini:
- Comparação detalhada de todos os modelos
- Recomendações por caso de uso
- Matriz de decisão (precisão vs velocidade vs custo)
- Estratégias de otimização de custos
- Plano de migração entre modelos

#### 2. `scripts/README-AUDITORIA.md`
Guia passo a passo:
- Como executar auditoria
- Configurações disponíveis
- Interpretação de resultados
- Aplicação de atualizações
- Resolução de problemas

#### 3. `ESTRATEGIA-SINCRONIZACAO-CONHECIMENTO.md`
Estratégia de longo prazo:
- 4 estratégias diferentes
- Recomendação: abordagem híbrida
- Plano de implementação em fases
- Sistema de sugestões automáticas (Fase 2)

#### 4. `scripts/audit-knowledge-sync.ts`
Script de auditoria automática:
- Análise de artigos com IA
- Extração estruturada de valores
- Comparação com Cérebro Lógico
- Geração de relatório markdown

---

## 🎯 Como Usar Agora

### Teste Rápido (10 artigos)
```bash
# Configuração padrão já está otimizada
pnpm tsx scripts/audit-knowledge-sync.ts
```

### Auditoria Completa (todos os artigos)
```typescript
// Editar scripts/audit-knowledge-sync.ts
const CONFIG = {
  model: 'gemini-2.5-pro',
  articleLimit: 0, // ← Mudar para 0
  delayBetweenCalls: 1000,
  temperature: 0.1,
}
```

```bash
pnpm tsx scripts/audit-knowledge-sync.ts
```

### Modo Econômico (para testes)
```typescript
// Editar scripts/audit-knowledge-sync.ts
const CONFIG = {
  model: 'gemini-2.5-flash', // ← Usar Flash
  articleLimit: 5,
  delayBetweenCalls: 500,
  temperature: 0.1,
}
```

---

## 📈 Próximos Passos

### Fase 1: Implementada ✅
- [x] Script de auditoria automática
- [x] Extração com IA de valores de referência
- [x] Comparação com Cérebro Lógico
- [x] Relatório de discrepâncias
- [x] Documentação completa

### Fase 2: Planejada 🔄
- [ ] Tabela `knowledge_update_suggestions`
- [ ] Worker de processamento em background
- [ ] Painel admin `/admin/knowledge-sync`
- [ ] Aprovação/rejeição de sugestões
- [ ] Trigger automático em novos artigos
- [ ] Histórico de mudanças (audit log)

### Fase 3: Futuro 🔮
- [ ] Sistema de versionamento de biomarcadores
- [ ] Múltiplas versões (conservador vs funcional)
- [ ] A/B testing de modelos
- [ ] Dashboard de métricas de qualidade

---

## 🔍 Monitoramento Recomendado

### Métricas para Acompanhar
```sql
-- Biomarcadores desatualizados (>1 ano)
SELECT COUNT(*) FROM biomarkers_reference
WHERE updated_at < NOW() - INTERVAL '1 year';

-- Artigos não processados
SELECT COUNT(*) FROM knowledge_articles
WHERE is_verified = 'verified'
  AND id NOT IN (SELECT DISTINCT article_id FROM knowledge_update_suggestions);

-- Taxa de aprovação de sugestões (futuro)
SELECT
  COUNT(*) FILTER (WHERE status = 'approved') * 100.0 / COUNT(*) as approval_rate
FROM knowledge_update_suggestions;
```

### Alertas Sugeridos
- ⚠️ Se biomarcadores sem atualização > 2 anos → revisar urgente
- ⚠️ Se artigos novos > 30 dias sem processar → executar auditoria
- ⚠️ Se discrepâncias críticas (ex: limites anormais) → priorizar

---

## 🛠️ Resolução de Problemas

### Erro: "Rate limit exceeded"
**Solução:**
```typescript
CONFIG.delayBetweenCalls = 2000 // Aumentar delay
```

### Erro: "Model not found"
**Solução:** Verificar se modelo existe
```typescript
// Usar modelo estável
CONFIG.model = 'gemini-2.5-pro' // não 'gemini-2.0-flash-exp'
```

### IA extrai valores incorretos
**Solução 1:** Aumentar temperatura conservadorismo
```typescript
CONFIG.temperature = 0.05 // Mais conservador
```

**Solução 2:** Melhorar prompt (adicionar exemplos)

**Solução 3:** Usar modelo mais capaz
```typescript
CONFIG.model = 'gemini-2.5-pro' // Upgrade de flash para pro
```

---

## 📞 Suporte

**Documentação:**
- `scripts/README-AUDITORIA.md` - Guia de uso
- `docs/MODELOS-GEMINI-COMPARACAO.md` - Comparação de modelos
- `ESTRATEGIA-SINCRONIZACAO-CONHECIMENTO.md` - Estratégia geral

**Issues:**
- Reportar bugs ou sugestões no repositório

---

**Última Atualização:** 09/01/2026
**Versão:** 1.0.0
**Status:** ✅ Pronto para uso
