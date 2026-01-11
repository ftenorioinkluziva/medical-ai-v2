# 🔄 Estratégia de Sincronização: Base de Conhecimento ↔ Cérebro Lógico

## 🎯 Objetivo

Garantir que o **Cérebro Lógico** (análise determinística) esteja sempre atualizado com as informações mais recentes da **Base de Conhecimento** (artigos médicos).

## 🔍 Problema Identificado

### Situação Atual
- **Base de Conhecimento:** Contém artigos médicos atualizados com novos valores de referência e protocolos
- **Cérebro Lógico:** Pode estar desatualizado, com valores fixos dessincrônicos
- **Risco:** Análises baseadas em dados desatualizados, perda de credibilidade clínica

### Exemplo de Discrepância
```
Base de Conhecimento (2025):
- Vitamina D3 ótima: 50-90 ng/mL (pesquisa recente)

Cérebro Lógico (atual):
- Vitamina D3 ótima: 40-80 ng/mL (desatualizado)

Resultado: Paciente com 45 ng/mL é classificado como "ótimo"
           quando deveria ser "subótimo" segundo dados recentes
```

## 📊 Estratégias Propostas

### 🚀 Estratégia 1: Auditoria e Sincronização Manual (Curto Prazo)

**Quando usar:** Agora, para resolver imediatamente

**Processo:**
1. Executar script de auditoria que analisa artigos da base de conhecimento
2. IA extrai valores de referência e protocolos dos artigos
3. Compara com Cérebro Lógico e gera relatório de discrepâncias
4. Admin revisa relatório e decide quais atualizações aplicar
5. Executa SQL para atualizar Cérebro Lógico

**Como executar:**
```bash
# 1. Rodar auditoria
pnpm tsx scripts/audit-knowledge-sync.ts

# 2. Revisar relatório gerado
# RELATORIO-AUDITORIA-CONHECIMENTO.md

# 3. Aplicar atualizações via SQL (gerado automaticamente)
psql $DATABASE_URL -f update-logical-brain.sql
```

**Prós:**
- ✅ Controle total sobre mudanças
- ✅ Admin valida cada atualização
- ✅ Implementação rápida

**Contras:**
- ❌ Processo manual e trabalhoso
- ❌ Precisa ser repetido periodicamente

---

### 🤖 Estratégia 2: Sistema de Sugestões Automáticas (Médio Prazo)

**Quando usar:** Após primeira auditoria, para manter sincronização contínua

**Arquitetura:**
```
1. Trigger no banco: Quando artigo é adicionado/atualizado
   ↓
2. Worker processa artigo em background
   ↓
3. IA extrai valores de referência e protocolos
   ↓
4. Compara com Cérebro Lógico
   ↓
5. Cria "Sugestão de Atualização" na tabela update_suggestions
   ↓
6. Admin vê sugestões no painel e aprova/rejeita
   ↓
7. Atualização aplicada ao Cérebro Lógico
```

**Nova Tabela: `knowledge_update_suggestions`**
```sql
CREATE TABLE knowledge_update_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Origem
  article_id UUID REFERENCES knowledge_articles(id),
  article_title VARCHAR(500),

  -- Tipo de atualização
  update_type VARCHAR(50), -- 'biomarker_update', 'new_biomarker', 'protocol_update', 'new_protocol'

  -- Dados extraídos pela IA
  target_slug VARCHAR(100), -- slug do biomarcador afetado
  suggested_changes JSONB, -- { optimalMin: 50, optimalMax: 90, source: "..." }

  -- Comparação com estado atual
  current_values JSONB,

  -- IA Confidence
  confidence VARCHAR(10), -- 'high', 'medium', 'low'
  ai_reasoning TEXT, -- Explicação da IA sobre por que sugerir

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);
```

**Fluxo Admin:**
```typescript
// Painel: /admin/knowledge-sync
// Lista sugestões pendentes com:
// - Diff visual (valores atuais vs sugeridos)
// - Confiança da IA
// - Artigo fonte
// - Botões: Aprovar / Rejeitar / Modificar
```

**Prós:**
- ✅ Sincronização contínua e automática
- ✅ Admin mantém controle (aprovação necessária)
- ✅ Auditoria completa de mudanças

**Contras:**
- ❌ Requer desenvolvimento adicional
- ❌ Admin precisa revisar sugestões regularmente

---

### 🔀 Estratégia 3: Priorização Dinâmica por Agente (Avançado)

**Quando usar:** Quando diferentes agentes precisam usar diferentes "versões" dos valores

**Conceito:**
- Alguns agentes podem preferir valores **conservadores** (medicina convencional)
- Outros podem preferir valores **funcionais/otimizados** (medicina funcional)
- Cérebro Lógico mantém **múltiplas versões** de cada biomarcador

**Exemplo:**
```typescript
// Tabela: biomarker_versions
{
  slug: 'vitamina_d3',
  version: 'conservative',
  optimalMin: 30,
  optimalMax: 80,
  source: 'ASBMR Guidelines 2020'
}

{
  slug: 'vitamina_d3',
  version: 'functional',
  optimalMin: 50,
  optimalMax: 100,
  source: 'Holick et al. 2025'
}

// Agente escolhe versão
agent.biomarkerVersion = 'functional' // ou 'conservative'
```

**Prós:**
- ✅ Flexibilidade máxima
- ✅ Suporta diferentes escolas médicas
- ✅ Não força consenso onde há debate

**Contras:**
- ❌ Mais complexo de implementar e manter
- ❌ Pode confundir usuários (múltiplas verdades?)

---

### 🧠 Estratégia 4: IA como "Source of Truth" Híbrida (Experimental)

**Quando usar:** Quando quiser máxima automatização e confiança na IA

**Conceito:**
- IA consulta base de conhecimento em **tempo real** durante análise
- Não há "cache" no Cérebro Lógico para valores de referência
- IA decide valores baseado em múltiplas fontes com pesos

**Fluxo:**
```typescript
// Durante análise
async function evaluateBiomarker(slug: string, value: number) {
  // 1. Buscar artigos relevantes
  const articles = await searchKnowledgeBase(`valores de referência ${slug}`)

  // 2. IA sintetiza consenso
  const referenceValues = await ai.synthesize({
    biomarker: slug,
    sources: articles,
    preference: agent.medicalPhilosophy // 'conservative' | 'functional'
  })

  // 3. Avaliar com valores sintetizados
  return evaluate(value, referenceValues)
}
```

**Prós:**
- ✅ Sempre usa dados mais recentes
- ✅ Considera múltiplas fontes automaticamente
- ✅ Adapta-se a novas pesquisas instantaneamente

**Contras:**
- ❌ Muito dependente da IA (risco de alucinações)
- ❌ Performance (mais lento)
- ❌ Custo (mais tokens por análise)
- ❌ Difícil auditoria (valores não são fixos)

---

## 🎯 Recomendação: Abordagem Híbrida

Sugiro combinar **Estratégia 1 + Estratégia 2**:

### Fase 1: Resolver Agora (Estratégia 1)
1. Executar auditoria manual
2. Gerar relatório de discrepâncias
3. Revisar e atualizar Cérebro Lógico com valores mais recentes
4. Documentar fontes e datas das atualizações

### Fase 2: Manter Atualizado (Estratégia 2)
1. Implementar sistema de sugestões automáticas
2. Quando novo artigo é adicionado → IA analisa e sugere atualizações
3. Admin aprova/rejeita no painel
4. Histórico completo de mudanças

### Fase 3: Otimizar (Opcional)
- Se múltiplos agentes precisarem de valores diferentes → Estratégia 3
- Se quiser experimentar IA híbrida → Estratégia 4

---

## 📋 Implementação Fase 1 (Imediato)

### Passo 1: Executar Auditoria
```bash
pnpm tsx scripts/audit-knowledge-sync.ts
```

### Passo 2: Revisar Relatório
Abrir `RELATORIO-AUDITORIA-CONHECIMENTO.md` e revisar:
- Discrepâncias de valores
- Biomarcadores ausentes
- Protocolos desatualizados

### Passo 3: Preparar Atualizações
Para cada discrepância, decidir:
- **Manter atual:** Base de conhecimento está errada/desatualizada
- **Atualizar:** Base de conhecimento tem dados mais recentes
- **Investigar:** Precisa de revisão médica antes de decidir

### Passo 4: Aplicar Atualizações
```sql
-- Exemplo de atualização
UPDATE biomarkers_reference
SET
  optimal_min = 50,
  optimal_max = 90,
  clinical_insight = 'Nova meta-análise 2025...',
  source_ref = 'NEJM 2025',
  updated_at = NOW()
WHERE slug = 'vitamina_d3';
```

---

## 📋 Implementação Fase 2 (Próxima Semana)

### 1. Criar Tabela de Sugestões
```bash
pnpm db:generate
pnpm db:migrate
```

### 2. Criar Worker de Análise
```typescript
// lib/knowledge/sync-worker.ts
export async function analyzeArticleForUpdates(articleId: string) {
  // Implementar lógica de extração e comparação
}
```

### 3. Criar Painel Admin
```typescript
// app/admin/knowledge-sync/page.tsx
// Lista sugestões pendentes com aprovação
```

### 4. Trigger Automático
```sql
-- Trigger que chama worker quando artigo é adicionado
CREATE OR REPLACE FUNCTION notify_new_article()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar sistema para processar artigo
  PERFORM pg_notify('new_article', NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎓 Boas Práticas

### 1. Rastreabilidade
- Sempre incluir `sourceRef` com referência científica
- Manter `updated_at` atualizado
- Considerar adicionar tabela de histórico (audit log)

### 2. Revisão por Pares
- Atualizações críticas (ex: faixas anormais) precisam aprovação médica
- Sugestões de IA são apenas sugestões, não verdades

### 3. Versionamento
- Considerar adicionar `version` aos biomarcadores
- Possibilitar rollback de atualizações problemáticas

### 4. Comunicação
- Notificar equipe quando Cérebro Lógico é atualizado
- Documentar mudanças em changelog

---

## 📊 Monitoramento Contínuo

### Métricas para Acompanhar
```sql
-- Biomarcadores sem atualização recente (> 1 ano)
SELECT slug, name, source_ref, updated_at
FROM biomarkers_reference
WHERE updated_at < NOW() - INTERVAL '1 year'
ORDER BY updated_at;

-- Sugestões pendentes há muito tempo
SELECT COUNT(*) as pending_suggestions
FROM knowledge_update_suggestions
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '7 days';

-- Taxa de aprovação de sugestões
SELECT
  COUNT(*) FILTER (WHERE status = 'approved') * 100.0 / COUNT(*) as approval_rate
FROM knowledge_update_suggestions;
```

---

## 🚦 Próximos Passos Recomendados

1. **Agora:** Executar `scripts/audit-knowledge-sync.ts` e revisar relatório
2. **Esta semana:** Atualizar Cérebro Lógico com valores críticos
3. **Próxima semana:** Implementar sistema de sugestões automáticas
4. **Próximo mês:** Estabelecer processo de revisão mensal

---

**Atualizado:** Janeiro 2026
**Responsável:** Equipe Medical AI v2
