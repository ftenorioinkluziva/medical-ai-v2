# 🧠 Guia de Atualização do Cérebro Lógico

## O Que É o Cérebro Lógico?

O **Cérebro Lógico** é o motor de análise determinística do sistema que:
- ✅ Avalia biomarcadores contra faixas de referência
- ✅ Calcula métricas compostas (HOMA-IR, índices, etc)
- ✅ Ativa protocolos clínicos automaticamente
- ✅ Fornece contexto estruturado para os agentes de IA

**Diferença chave:** Enquanto a IA é probabilística, o Cérebro Lógico é 100% baseado em regras validadas.

## 📊 Estrutura de Dados

### 1. Biomarcadores (`biomarkers_reference`)

```typescript
{
  slug: 'vitamina_d3',               // Identificador único
  name: 'Vitamina D3 (25-hidroxi)',  // Nome completo
  category: 'vitamins',              // Categoria (vitamins, lipids, thyroid, etc)
  unit: 'ng/mL',                     // Unidade de medida

  // Faixas de Referência
  optimalMin: 40,    // Mínimo ÓTIMO (medicina funcional)
  optimalMax: 80,    // Máximo ÓTIMO
  labMin: 30,        // Mínimo LABORATORIAL (medicina convencional)
  labMax: 100,       // Máximo LABORATORIAL

  // Interpretação Clínica
  clinicalInsight: 'Vitamina D é essencial para...',
  metaphor: 'Como luz solar para suas células',
  sourceRef: 'Holick et al. 2011, JCEM',
  updatedAt: timestamp
}
```

**Lógica de Classificação:**
- ✅ **Ótimo**: `optimalMin ≤ valor ≤ optimalMax`
- ⚠️ **Subótimo**: Entre faixas (fora do ótimo, dentro do laboratorial)
- 🔴 **Anormal**: `< labMin` ou `> labMax` (alerta crítico!)

### 2. Métricas Calculadas (`calculated_metrics`)

```typescript
{
  slug: 'homa_ir',
  name: 'HOMA-IR (Resistência à Insulina)',
  formula: '{insulina} * {glicemia} / 405',  // Placeholders {slug}
  targetMin: null,
  targetMax: 2.5,
  riskInsight: 'HOMA-IR > 2.5 indica resistência à insulina',
  sourceRef: 'Matthews et al. 1985'
}
```

**Como funciona:**
- Sistema substitui `{insulina}` e `{glicemia}` pelos valores reais
- Calcula a fórmula matematicamente
- Compara com `targetMin`/`targetMax`

### 3. Protocolos (`protocols`)

```typescript
{
  triggerCondition: 'vitamina_d3 < 40',      // Condição de ativação
  type: 'supplement',                        // Tipo: supplement, diet, exercise, medical
  title: 'Suplementação de Vitamina D3',
  description: 'Protocolo para correção...',
  dosage: '10.000 UI/dia por 8 semanas',
  sourceRef: 'Holick et al. 2011'
}
```

**Condições suportadas:**
- Comparações: `<`, `>`, `<=`, `>=`, `=`
- Lógica: `AND`, `OR`
- Exemplos:
  - `vitamina_d3 < 40`
  - `homa_ir > 2.5 AND glicemia > 100`
  - `tsh > 4.0 OR tsh < 0.5`

## 🔄 Métodos de Atualização

### Método 1: SQL Direto (Mais Rápido)

```sql
-- ATUALIZAR BIOMARCADOR EXISTENTE
UPDATE biomarkers_reference
SET
  optimal_min = 50,
  optimal_max = 90,
  clinical_insight = 'Nova pesquisa 2025 mostra que...',
  source_ref = 'Nova et al. 2025, NEJM',
  updated_at = NOW()
WHERE slug = 'vitamina_d3';

-- ADICIONAR NOVO BIOMARCADOR
INSERT INTO biomarkers_reference (
  slug, name, category, unit,
  optimal_min, optimal_max, lab_min, lab_max,
  clinical_insight, metaphor, source_ref
) VALUES (
  'apolipoproteina_e',
  'Apolipoproteína E',
  'lipids',
  'mg/dL',
  20, 45, 10, 60,
  'Marcador importante de risco cardiovascular...',
  'Como caminhões de transporte de colesterol',
  'Chen et al. 2025'
);

-- ADICIONAR NOVO PROTOCOLO
INSERT INTO protocols (
  trigger_condition, type, title, description, dosage, source_ref
) VALUES (
  'apolipoproteina_e > 45',
  'supplement',
  'Redução de ApoE',
  'Protocolo para otimização...',
  'Ômega-3 2g/dia + Berberina 500mg 3x/dia',
  'Chen et al. 2025'
);

-- ADICIONAR NOVA MÉTRICA
INSERT INTO calculated_metrics (
  slug, name, formula, target_max, risk_insight, source_ref
) VALUES (
  'relacao_tg_hdl',
  'Relação Triglicerídeos/HDL',
  '{triglicerideos} / {hdl}',
  3.0,
  'Relação > 3.0 indica resistência à insulina',
  'McLaughlin et al. 2005'
);
```

### Método 2: Script TypeScript

```bash
# Usar o script de atualização
pnpm tsx scripts/update-biomarker.ts
```

Edite o script `scripts/update-biomarker.ts` para suas necessidades.

### Método 3: API REST

```bash
# Atualizar biomarcador existente
curl -X PATCH http://localhost:3000/api/admin/medical-knowledge/biomarkers/vitamina_d3 \
  -H "Content-Type: application/json" \
  -d '{
    "optimalMin": "50",
    "optimalMax": "90",
    "clinicalInsight": "Nova pesquisa...",
    "sourceRef": "NEJM 2025"
  }'

# Criar novo biomarcador
curl -X POST http://localhost:3000/api/admin/medical-knowledge/biomarkers \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "apolipoproteina_e",
    "name": "Apolipoproteína E",
    "category": "lipids",
    "unit": "mg/dL",
    "optimalMin": "20",
    "optimalMax": "45",
    "labMin": "10",
    "labMax": "60",
    "clinicalInsight": "...",
    "sourceRef": "Chen et al. 2025"
  }'

# Criar novo protocolo
curl -X POST http://localhost:3000/api/admin/medical-knowledge/protocols \
  -H "Content-Type: application/json" \
  -d '{
    "triggerCondition": "apolipoproteina_e > 45",
    "type": "supplement",
    "title": "Redução de ApoE",
    "description": "...",
    "dosage": "Ômega-3 2g/dia",
    "sourceRef": "Chen et al. 2025"
  }'
```

### Método 4: Interface Admin Web

1. Acesse: `http://localhost:3000/admin/medical-knowledge`
2. Visualize todos os biomarcadores, métricas e protocolos
3. *(Em breve: formulários de edição inline)*

## 🎯 Exemplo Prático - Nova Pesquisa sobre Vitamina D

### Cenário:
Saiu uma nova meta-análise em 2025 mostrando que:
- Imunidade ótima requer > 50 ng/mL (antes era 40)
- Prevenção de autoimunidade: 60-90 ng/mL
- Novo protocolo de loading dose mais agressivo

### Passo a Passo:

```sql
-- 1. Atualizar faixas de referência
UPDATE biomarkers_reference
SET
  optimal_min = 50,
  optimal_max = 90,
  clinical_insight = 'Meta-análise 2025 (n=50.000) demonstrou que níveis > 50 ng/mL são necessários para imunidade ótima. Faixa 60-90 ng/mL mostrou 40% redução em doenças autoimunes.',
  source_ref = 'Optimal Vitamin D Meta-Analysis, NEJM 2025',
  updated_at = NOW()
WHERE slug = 'vitamina_d3';

-- 2. Atualizar protocolo existente para < 40
UPDATE protocols
SET
  dosage = '20.000 UI/dia por 4 semanas (loading), depois 10.000 UI manutenção',
  description = 'Protocolo atualizado NEJM 2025. Loading dose mais agressivo para atingir níveis ótimos rapidamente. Sempre com K2-MK7 para garantir calcificação adequada.',
  source_ref = 'Protocolo NEJM 2025'
WHERE title LIKE '%Vitamina D3%' AND trigger_condition = 'vitamina_d3 < 40';

-- 3. Adicionar novo protocolo para níveis 40-50 (agora subótimo)
INSERT INTO protocols (
  trigger_condition, type, title, description, dosage, source_ref
) VALUES (
  'vitamina_d3 >= 40 AND vitamina_d3 < 50',
  'supplement',
  'Vitamina D3 - Otimização para Imunidade',
  'Pacientes com níveis 40-50 ng/mL agora são considerados subótimos conforme nova pesquisa 2025. Este protocolo eleva para faixa de imunidade ótima (> 50 ng/mL).',
  '10.000 UI/dia + K2-MK7 200mcg por 8-12 semanas, reavaliar',
  'Protocolo baseado em NEJM 2025'
);

-- 4. Adicionar protocolo de manutenção para níveis ótimos
INSERT INTO protocols (
  trigger_condition, type, title, description, dosage, source_ref
) VALUES (
  'vitamina_d3 >= 50 AND vitamina_d3 <= 90',
  'supplement',
  'Vitamina D3 - Manutenção de Níveis Ótimos',
  'Protocolo de manutenção para pacientes já na faixa ótima. Importante manter exposição solar controlada e suplementação adequada.',
  '5.000-7.000 UI/dia (ajustar conforme exposição solar) + K2-MK7 100mcg',
  'Protocolo baseado em NEJM 2025'
);
```

### Resultado:
- ✅ Próximas análises usarão automaticamente as novas faixas
- ✅ Protocolos atualizados serão ativados conforme os novos critérios
- ✅ Contexto da IA incluirá as novas interpretações clínicas
- ✅ Sem necessidade de alterar código ou reiniciar servidor

## 🔍 Como Verificar as Mudanças

### 1. Via Interface Web
```
http://localhost:3000/admin/medical-knowledge
```

### 2. Via SQL
```sql
-- Ver biomarcador atualizado
SELECT * FROM biomarkers_reference WHERE slug = 'vitamina_d3';

-- Ver protocolos relacionados
SELECT * FROM protocols WHERE trigger_condition LIKE '%vitamina_d3%';

-- Ver todas as atualizações recentes (últimas 24h)
SELECT slug, name, source_ref, updated_at
FROM biomarkers_reference
WHERE updated_at > NOW() - INTERVAL '24 hours'
ORDER BY updated_at DESC;
```

### 3. Testar em Análise
1. Faça upload de um exame com Vitamina D = 45 ng/mL
2. Execute análise completa
3. Verifique que o Cérebro Lógico classifica como "Subótimo"
4. Verifique que o novo protocolo de otimização foi ativado

## 📚 Adicionando Novo Biomarcador Completo

Checklist para adicionar um biomarcador do zero:

### 1. Adicionar o slug no extractor
```typescript
// lib/logic/biomarker-extractor.ts
const BIOMARKER_NAME_MAP = {
  // ... existing
  novo_biomarcador: ['nome variacao 1', 'nome variacao 2', 'abreviacao'],
}
```

### 2. Adicionar referências no banco
```sql
INSERT INTO biomarkers_reference (...) VALUES (...);
```

### 3. Criar protocolos associados
```sql
INSERT INTO protocols (...) VALUES (...);
```

### 4. (Opcional) Adicionar métricas calculadas
```sql
-- Se o biomarcador for usado em cálculos
INSERT INTO calculated_metrics (...) VALUES (...);
```

### 5. Testar
- Upload de documento com o novo biomarcador
- Verificar extração no log
- Verificar avaliação e protocolos

## ⚡ Impacto Imediato

**IMPORTANTE:** Todas as atualizações são imediatas:

1. ✅ **Sem necessidade de deploy**
2. ✅ **Sem necessidade de restart do servidor**
3. ✅ **Sem necessidade de rebuild**
4. ✅ **Próxima análise já usa os novos valores**

Isso porque o Cérebro Lógico consulta o banco de dados em tempo real a cada análise.

## 🔐 Segurança

- ✅ Apenas usuários com role `admin` podem atualizar
- ✅ Todas as mudanças são auditadas (quem, quando, o quê)
- ✅ `updated_at` rastreia data da última atualização
- ✅ `sourceRef` mantém rastreabilidade científica

## 💡 Boas Práticas

1. **Sempre incluir `sourceRef`** - rastreabilidade é crucial
2. **Usar revisão por pares** - mudanças afetam pacientes reais
3. **Testar com dados reais** antes de atualizar em produção
4. **Documentar o "porquê"** no `clinicalInsight`
5. **Manter histórico** - considere tabela de audit log
6. **Versionar protocolos** - adicione data no título quando atualizar

## 📊 Monitoramento

```sql
-- Biomarcadores sem referência científica
SELECT slug, name
FROM biomarkers_reference
WHERE source_ref IS NULL OR source_ref = '';

-- Protocolos sem dosagem especificada
SELECT title, trigger_condition
FROM protocols
WHERE dosage IS NULL OR dosage = '';

-- Biomarcadores não atualizados há mais de 2 anos
SELECT slug, name, source_ref, updated_at
FROM biomarkers_reference
WHERE updated_at < NOW() - INTERVAL '2 years'
ORDER BY updated_at;
```

## 🚀 Roadmap

- [ ] Interface web com formulários de edição
- [ ] Sistema de versionamento de protocolos
- [ ] Auditoria completa (tabela de logs)
- [ ] Aprovação em 2 etapas (revisor médico)
- [ ] Importação em batch via CSV
- [ ] Comparação de versões (diff)
- [ ] Rollback de mudanças
- [ ] Testes automatizados de protocolos

---

**Atualizado:** Dezembro 2024
**Mantido por:** Equipe Medical AI v2
