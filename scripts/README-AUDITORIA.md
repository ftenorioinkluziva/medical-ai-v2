# 🔍 Como Auditar e Sincronizar Base de Conhecimento com Cérebro Lógico

## 📋 O Que Você Precisa Fazer

Você identificou corretamente que há uma **dessincronia** entre:
- **Base de Conhecimento:** Artigos médicos com valores de referência atualizados
- **Cérebro Lógico:** Sistema determinístico que pode estar desatualizado

## 🚀 Passo a Passo

### 1️⃣ Executar Auditoria Automática

```bash
# Analisar base de conhecimento e comparar com Cérebro Lógico
pnpm tsx scripts/audit-knowledge-sync.ts
```

**⚙️ Configurações Disponíveis** (editar em `scripts/audit-knowledge-sync.ts`):
```typescript
const CONFIG = {
  model: 'gemini-2.5-pro',     // Modelo IA (pro/flash/flash-lite)
  articleLimit: 10,             // 0 = todos, >0 = limitar para teste
  delayBetweenCalls: 1000,      // ms entre chamadas (evita rate limit)
  temperature: 0.1,             // 0.0-1.0 (menor = mais conservador)
}
```

**💡 Recomendações de Modelo:**
- `gemini-2.5-pro` - Máxima precisão (recomendado para auditoria crítica)
- `gemini-2.5-flash` - Mais rápido e econômico (bom para testes)
- `gemini-2.5-flash-lite` - Ultra-rápido (tarefas simples)

📖 Veja `docs/MODELOS-GEMINI-COMPARACAO.md` para comparação detalhada

**O que esse script faz:**
1. ✅ Carrega todos os artigos verificados da base de conhecimento
2. ✅ Usa IA (Gemini 2.5 Pro) para extrair valores de referência e protocolos
3. ✅ Compara com os valores do Cérebro Lógico
4. ✅ Identifica discrepâncias e biomarcadores ausentes
5. ✅ Gera relatório detalhado em `RELATORIO-AUDITORIA-CONHECIMENTO.md`

**Tempo estimado:** 5-10 minutos (dependendo do número de artigos)

### 2️⃣ Revisar Relatório Gerado

```bash
# Abrir relatório
code RELATORIO-AUDITORIA-CONHECIMENTO.md
```

**O relatório mostrará:**

#### Seção 1: Discrepâncias de Valores
```markdown
### Vitamina D3 (`vitamina_d3`)

**Cérebro Lógico (Atual):**
- Ótimo: 40 - 80 ng/mL
- Laboratorial: 30 - 100 ng/mL
- Fonte: Holick et al. 2011
- Última atualização: 2024-01-15

**Base de Conhecimento:**
- Ótimo: 50 - 90 ng/mL
- Fonte: Meta-análise NEJM 2025 (50.000 participantes)
- Confiança: HIGH

**Recomendação:** ATUALIZAR - Base de conhecimento tem pesquisa mais recente
```

#### Seção 2: Biomarcadores Ausentes
```markdown
### Apolipoproteína E (Sugestão: `apolipoproteina_e`)

**Referências encontradas:**
- Fonte: Chen et al. 2025, Cardiovascular Risk Assessment
  - Ótimo: 20 - 45 mg/dL
  - Laboratorial: 10 - 60 mg/dL

**Ação Sugerida:** Adicionar ao Cérebro Lógico
```

### 3️⃣ Decidir Ações

Para cada item do relatório, você deve:

- ✅ **ATUALIZAR:** Cérebro Lógico está desatualizado, base de conhecimento tem dados melhores
- ❌ **MANTER:** Base de conhecimento tem informação incorreta/descontextualizada
- 🔍 **INVESTIGAR:** Precisa revisão médica antes de decidir

### 4️⃣ Aplicar Atualizações

#### Opção A: SQL Direto (Recomendado para atualizações em lote)

```sql
-- Atualizar valores desatualizados
UPDATE biomarkers_reference
SET
  optimal_min = 50,
  optimal_max = 90,
  clinical_insight = 'Meta-análise 2025 (n=50.000) demonstrou que níveis > 50 ng/mL são necessários para imunidade ótima.',
  source_ref = 'NEJM Meta-analysis 2025',
  updated_at = NOW()
WHERE slug = 'vitamina_d3';

-- Adicionar novo biomarcador
INSERT INTO biomarkers_reference (
  slug, name, category, unit,
  optimal_min, optimal_max, lab_min, lab_max,
  clinical_insight, source_ref
) VALUES (
  'apolipoproteina_e',
  'Apolipoproteína E',
  'lipids',
  'mg/dL',
  20, 45, 10, 60,
  'Marcador importante de risco cardiovascular...',
  'Chen et al. 2025'
);
```

#### Opção B: Interface Admin (Em desenvolvimento)

```
http://localhost:3000/admin/medical-knowledge
```

### 5️⃣ Validar Mudanças

```bash
# Verificar se atualizações foram aplicadas
psql $DATABASE_URL -c "SELECT slug, name, optimal_min, optimal_max, source_ref, updated_at FROM biomarkers_reference WHERE slug = 'vitamina_d3';"
```

### 6️⃣ Testar com Análise Real

1. Fazer upload de um exame com os biomarcadores atualizados
2. Executar análise completa
3. Verificar que o Cérebro Lógico usa os novos valores
4. Confirmar que protocolos corretos são ativados

---

## 📊 Exemplo de Resultado Esperado

### Antes da Auditoria
```
Paciente com Vitamina D3 = 45 ng/mL
Cérebro Lógico: ✅ ÓTIMO (40-80)
Protocolo: Nenhum
```

### Depois da Auditoria e Atualização
```
Paciente com Vitamina D3 = 45 ng/mL
Cérebro Lógico: ⚠️ SUBÓTIMO (50-90)
Protocolo: Suplementação 10.000 UI/dia para otimização
```

---

## 🔄 Manutenção Contínua

### Frequência Recomendada
- **Auditoria completa:** 1x por mês
- **Revisão de novos artigos:** Sempre que adicionar artigos importantes
- **Atualização crítica:** Imediatamente quando houver mudança em guidelines

### Automatização Futura (Fase 2)
Após implementar o sistema de sugestões automáticas:
1. ✅ Trigger automático quando novo artigo é adicionado
2. ✅ IA analisa e sugere atualizações
3. ✅ Admin aprova no painel
4. ✅ Sincronização contínua sem esforço manual

---

## ⚠️ Avisos Importantes

### 1. Validação Médica
- ⚠️ **NÃO aplique atualizações automaticamente sem revisão**
- ⚠️ Valores de referência afetam diagnósticos e tratamentos
- ⚠️ Em caso de dúvida, consulte especialista

### 2. Rastreabilidade
- ✅ Sempre inclua `source_ref` com referência científica completa
- ✅ Atualize `updated_at` para NOW()
- ✅ Considere adicionar nota no `clinical_insight` explicando a mudança

### 3. Backup
```bash
# Fazer backup antes de atualizações em lote
pg_dump $DATABASE_URL -t biomarkers_reference > backup-biomarkers-$(date +%Y%m%d).sql
```

---

## 🐛 Resolução de Problemas

### Erro: "No articles found"
```bash
# Verificar se há artigos na base de conhecimento
psql $DATABASE_URL -c "SELECT COUNT(*) FROM knowledge_articles WHERE is_verified = 'verified';"
```

**Solução:** Adicione artigos primeiro via `/admin/medical-knowledge`

### Erro: "API rate limit"
- O script processa 10 artigos por vez para evitar sobrecarga
- Ajuste o `LIMIT` no script se necessário
- Adicione delay maior entre chamadas (`setTimeout`)

### IA não está extraindo valores corretamente
- Verifique que artigos têm valores numéricos claros
- Melhore prompts de extração no script
- Considere adicionar exemplos de formato esperado

---

## 📚 Documentação Relacionada

- `GUIA-ATUALIZACAO-CEREBRO-LOGICO.md` - Como atualizar Cérebro Lógico manualmente
- `ESTRATEGIA-SINCRONIZACAO-CONHECIMENTO.md` - Estratégias de longo prazo
- `CLAUDE.md` - Visão geral da arquitetura do projeto

---

## 🎯 Próximos Passos

1. ✅ **Agora:** Execute `pnpm tsx scripts/audit-knowledge-sync.ts`
2. ✅ **Hoje:** Revise relatório e decida atualizações críticas
3. ✅ **Esta semana:** Aplique atualizações e valide com testes
4. ✅ **Próxima semana:** Implemente sistema de sugestões automáticas (Fase 2)

---

**Criado:** Janeiro 2026
**Última atualização:** Janeiro 2026
