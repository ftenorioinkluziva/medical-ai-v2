# 🔄 Plano de Implementação: Sistema de Sincronização Automática

**Objetivo:** Criar um sistema completo e profissional para sincronizar automaticamente a Base de Conhecimento com o Cérebro Lógico, eliminando a necessidade de scripts manuais e SQL direto.

**Status:** 📋 Planejamento
**Início:** 09/01/2026
**Previsão:** ~8 horas de desenvolvimento

---

## 📊 Visão Geral

### Problema Atual
- Cérebro Lógico pode ficar desatualizado em relação à Base de Conhecimento
- Processo manual de auditoria e atualização
- Sem rastreabilidade de mudanças
- Sem aprovação estruturada

### Solução Proposta
Sistema automático que:
1. ✅ Analisa artigos automaticamente quando adicionados
2. ✅ Detecta discrepâncias e biomarcadores ausentes
3. ✅ Cria sugestões de atualização
4. ✅ Permite aprovação/rejeição via interface
5. ✅ Mantém histórico completo de mudanças
6. ✅ Aplica atualizações com rastreabilidade

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL                               │
│              /admin/knowledge-sync                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Sugestões   │  │  Discrepân-  │  │  Biomarcado- │     │
│  │  Pendentes   │  │  cias        │  │  res Ausentes│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │  Diff Visual: Atual vs Sugerido                 │       │
│  │  [Aprovar] [Rejeitar] [Modificar]               │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                 │
│                                                              │
│  POST /api/admin/knowledge-sync/analyze                     │
│  GET  /api/admin/knowledge-sync/suggestions                 │
│  POST /api/admin/knowledge-sync/suggestions/:id/approve     │
│  POST /api/admin/knowledge-sync/suggestions/:id/reject      │
│  POST /api/admin/knowledge-sync/suggestions/:id/modify      │
│  GET  /api/admin/knowledge-sync/history                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER                              │
│                                                              │
│  knowledge_update_suggestions                                │
│  biomarkers_reference                                        │
│  protocols                                                   │
│  knowledge_articles                                          │
│  sync_audit_log (novo)                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               AI ANALYSIS ENGINE                             │
│                                                              │
│  lib/ai/knowledge/analyzer.ts                               │
│  - Extrai biomarcadores e protocolos                        │
│  - Compara com Cérebro Lógico                               │
│  - Gera sugestões inteligentes                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Schema de Banco de Dados

### 1. Tabela: `knowledge_update_suggestions`

```sql
CREATE TABLE knowledge_update_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Origem da sugestão
  article_id UUID REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  article_title VARCHAR(500),

  -- Tipo de sugestão
  suggestion_type VARCHAR(50) NOT NULL,
  -- 'biomarker_update' | 'biomarker_create' | 'protocol_update' | 'protocol_create'

  -- Alvo da atualização
  target_type VARCHAR(50) NOT NULL, -- 'biomarker' | 'protocol'
  target_slug VARCHAR(100), -- slug do biomarcador/protocolo (se existir)
  target_id UUID, -- ID do protocolo (se for update de protocolo)

  -- Dados sugeridos pela IA
  suggested_data JSONB NOT NULL,
  /* Estrutura para biomarker:
  {
    "slug": "vitamina_d3",
    "name": "Vitamina D3",
    "optimalMin": 70,
    "optimalMax": 90,
    "labMin": 20,
    "labMax": 100,
    "unit": "ng/mL",
    "clinicalInsight": "...",
    "sourceRef": "..."
  }
  */

  -- Dados atuais (para comparação)
  current_data JSONB,
  /* Mesma estrutura, null se for criação */

  -- Metadados da IA
  ai_confidence VARCHAR(10) NOT NULL, -- 'high' | 'medium' | 'low'
  ai_reasoning TEXT, -- Explicação da IA sobre por que sugerir
  extraction_metadata JSONB, -- Detalhes da extração (modelo usado, etc)

  -- Priorização
  priority VARCHAR(10) NOT NULL DEFAULT 'medium',
  -- 'critical' | 'high' | 'medium' | 'low'
  is_conflict BOOLEAN DEFAULT false, -- true se há valores conflitantes

  -- Status e aprovação
  status VARCHAR(20) DEFAULT 'pending',
  -- 'pending' | 'approved' | 'rejected' | 'applied' | 'modified'

  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,

  applied_by UUID REFERENCES users(id),
  applied_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_suggestions_status ON knowledge_update_suggestions(status);
CREATE INDEX idx_suggestions_priority ON knowledge_update_suggestions(priority);
CREATE INDEX idx_suggestions_article ON knowledge_update_suggestions(article_id);
CREATE INDEX idx_suggestions_target ON knowledge_update_suggestions(target_slug);
CREATE INDEX idx_suggestions_type ON knowledge_update_suggestions(suggestion_type);
```

### 2. Tabela: `sync_audit_log`

```sql
CREATE TABLE sync_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referência
  suggestion_id UUID REFERENCES knowledge_update_suggestions(id) ON DELETE SET NULL,

  -- Ação realizada
  action VARCHAR(50) NOT NULL,
  -- 'suggestion_created' | 'suggestion_approved' | 'suggestion_rejected' |
  -- 'biomarker_updated' | 'biomarker_created' | 'protocol_updated' | 'protocol_created'

  -- Dados da ação
  target_type VARCHAR(50), -- 'biomarker' | 'protocol'
  target_slug VARCHAR(100),
  target_id UUID,

  -- Mudanças realizadas
  changes JSONB, -- { before: {...}, after: {...} }

  -- Quem fez
  performed_by UUID REFERENCES users(id),

  -- Contexto
  source_article_id UUID REFERENCES knowledge_articles(id) ON DELETE SET NULL,
  notes TEXT,

  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_audit_action ON sync_audit_log(action);
CREATE INDEX idx_audit_target ON sync_audit_log(target_slug);
CREATE INDEX idx_audit_user ON sync_audit_log(performed_by);
CREATE INDEX idx_audit_date ON sync_audit_log(created_at DESC);
```

### 3. Alterações em Tabelas Existentes

```sql
-- Adicionar tracking de última sincronização
ALTER TABLE knowledge_articles
ADD COLUMN last_analyzed_at TIMESTAMP,
ADD COLUMN analysis_version VARCHAR(50); -- Track versão do analyzer

-- Adicionar metadados de sincronização
ALTER TABLE biomarkers_reference
ADD COLUMN last_synced_from UUID REFERENCES knowledge_articles(id),
ADD COLUMN sync_metadata JSONB; -- { suggestedBy, approvedBy, confidence, etc }

ALTER TABLE protocols
ADD COLUMN last_synced_from UUID REFERENCES knowledge_articles(id),
ADD COLUMN sync_metadata JSONB;
```

---

## 🔌 APIs Backend

### Estrutura de Diretórios

```
app/api/admin/knowledge-sync/
├── analyze/
│   └── route.ts                  # POST - Analisar artigo(s)
├── suggestions/
│   ├── route.ts                  # GET - Listar sugestões
│   └── [id]/
│       ├── approve/
│       │   └── route.ts          # POST - Aprovar sugestão
│       ├── reject/
│       │   └── route.ts          # POST - Rejeitar sugestão
│       └── modify/
│           └── route.ts          # POST - Modificar e aprovar
├── history/
│   └── route.ts                  # GET - Histórico de mudanças
└── stats/
    └── route.ts                  # GET - Estatísticas

lib/ai/knowledge/
├── analyzer.ts                   # Motor de análise
├── suggestion-generator.ts       # Gerador de sugestões
├── conflict-detector.ts          # Detector de conflitos
└── applier.ts                    # Aplicador de mudanças
```

### API 1: Analisar Artigo(s)

**Endpoint:** `POST /api/admin/knowledge-sync/analyze`

**Request Body:**
```typescript
{
  articleIds?: string[], // Específicos ou null para todos
  mode?: 'full' | 'incremental', // full = todos, incremental = não analisados
  options?: {
    minConfidence?: 'low' | 'medium' | 'high',
    autoApprove?: boolean, // Auto-aprovar high confidence
  }
}
```

**Response:**
```typescript
{
  success: true,
  analyzed: number,
  suggestionsCreated: number,
  suggestions: Suggestion[],
  summary: {
    biomarkerUpdates: number,
    biomarkerCreates: number,
    protocolUpdates: number,
    protocolCreates: number,
  }
}
```

**Fluxo:**
1. Carrega artigos do banco
2. Para cada artigo:
   - Extrai biomarcadores e protocolos com IA
   - Compara com Cérebro Lógico atual
   - Detecta discrepâncias e ausências
   - Gera sugestões com prioridade
3. Salva sugestões no banco
4. Retorna resumo

---

### API 2: Listar Sugestões

**Endpoint:** `GET /api/admin/knowledge-sync/suggestions`

**Query Params:**
```typescript
{
  status?: 'pending' | 'approved' | 'rejected' | 'applied',
  priority?: 'critical' | 'high' | 'medium' | 'low',
  type?: 'biomarker_update' | 'biomarker_create' | 'protocol_update' | 'protocol_create',
  limit?: number,
  offset?: number,
  sortBy?: 'priority' | 'created_at' | 'confidence',
}
```

**Response:**
```typescript
{
  suggestions: Array<{
    id: string,
    suggestionType: string,
    targetType: string,
    targetSlug: string | null,
    currentData: any | null,
    suggestedData: any,
    aiConfidence: 'high' | 'medium' | 'low',
    aiReasoning: string,
    priority: string,
    isConflict: boolean,
    status: string,
    articleTitle: string,
    createdAt: string,
  }>,
  pagination: {
    total: number,
    limit: number,
    offset: number,
  },
  summary: {
    pending: number,
    approved: number,
    rejected: number,
    byPriority: { critical: number, high: number, ... },
  }
}
```

---

### API 3: Aprovar Sugestão

**Endpoint:** `POST /api/admin/knowledge-sync/suggestions/:id/approve`

**Request Body:**
```typescript
{
  notes?: string, // Notas do reviewer
  applyImmediately?: boolean, // Aplicar agora ou apenas aprovar
}
```

**Response:**
```typescript
{
  success: true,
  suggestion: Suggestion,
  applied: boolean,
  changes?: {
    target: 'biomarker' | 'protocol',
    slug: string,
    before: any,
    after: any,
  }
}
```

**Fluxo:**
1. Valida permissão (admin only)
2. Carrega sugestão
3. Atualiza status para 'approved'
4. Se `applyImmediately`:
   - Aplica mudança ao Cérebro Lógico
   - Registra em audit log
   - Atualiza status para 'applied'
5. Retorna resultado

---

### API 4: Rejeitar Sugestão

**Endpoint:** `POST /api/admin/knowledge-sync/suggestions/:id/reject`

**Request Body:**
```typescript
{
  reason: string, // Obrigatório: motivo da rejeição
  notes?: string,
}
```

**Response:**
```typescript
{
  success: true,
  suggestion: Suggestion,
}
```

**Fluxo:**
1. Valida permissão
2. Atualiza status para 'rejected'
3. Salva motivo e notas
4. Registra em audit log
5. Retorna resultado

---

### API 5: Modificar e Aprovar

**Endpoint:** `POST /api/admin/knowledge-sync/suggestions/:id/modify`

**Request Body:**
```typescript
{
  modifiedData: any, // Dados modificados pelo admin
  notes?: string,
  applyImmediately?: boolean,
}
```

**Response:**
```typescript
{
  success: true,
  suggestion: Suggestion,
  applied: boolean,
}
```

**Fluxo:**
1. Valida permissão
2. Valida dados modificados
3. Atualiza sugestão com dados modificados
4. Marca como 'modified'
5. Se `applyImmediately`, aplica mudanças
6. Retorna resultado

---

### API 6: Histórico

**Endpoint:** `GET /api/admin/knowledge-sync/history`

**Query Params:**
```typescript
{
  targetSlug?: string, // Filtrar por biomarcador/protocolo
  action?: string,
  userId?: string,
  startDate?: string,
  endDate?: string,
  limit?: number,
  offset?: number,
}
```

**Response:**
```typescript
{
  history: Array<{
    id: string,
    action: string,
    targetType: string,
    targetSlug: string,
    changes: { before: any, after: any },
    performedBy: { id: string, name: string },
    sourceArticle?: { id: string, title: string },
    notes: string,
    createdAt: string,
  }>,
  pagination: { ... },
}
```

---

### API 7: Estatísticas

**Endpoint:** `GET /api/admin/knowledge-sync/stats`

**Response:**
```typescript
{
  suggestions: {
    total: number,
    pending: number,
    approved: number,
    rejected: number,
    applied: number,
  },
  byPriority: {
    critical: number,
    high: number,
    medium: number,
    low: number,
  },
  byType: {
    biomarkerUpdate: number,
    biomarkerCreate: number,
    protocolUpdate: number,
    protocolCreate: number,
  },
  recentActivity: Array<{
    date: string,
    approved: number,
    rejected: number,
  }>,
  topContributors: Array<{
    userId: string,
    userName: string,
    actionsCount: number,
  }>,
}
```

---

## 🎨 Componentes Frontend

### Estrutura de Diretórios

```
app/(dashboard)/admin/knowledge-sync/
├── page.tsx                      # Página principal
├── layout.tsx                    # Layout do painel
└── components/
    ├── suggestion-list.tsx       # Lista de sugestões
    ├── suggestion-card.tsx       # Card de sugestão individual
    ├── diff-viewer.tsx           # Visualizador de diferenças
    ├── approval-dialog.tsx       # Dialog de aprovação
    ├── rejection-dialog.tsx      # Dialog de rejeição
    ├── modification-dialog.tsx   # Dialog de modificação
    ├── stats-dashboard.tsx       # Dashboard de estatísticas
    ├── history-table.tsx         # Tabela de histórico
    └── filters.tsx               # Filtros de busca
```

### Componente 1: Página Principal

**Arquivo:** `app/(dashboard)/admin/knowledge-sync/page.tsx`

**Estrutura:**
```tsx
export default function KnowledgeSyncPage() {
  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1>Sincronização de Conhecimento</h1>
        <p>Gerencie sugestões de atualização do Cérebro Lógico</p>
        <Button onClick={triggerAnalysis}>
          Analisar Artigos Novos
        </Button>
      </div>

      {/* Stats Dashboard */}
      <StatsDashboard />

      {/* Tabs */}
      <Tabs>
        <TabsList>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="approved">Aprovadas</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Filters />
          <SuggestionList status="pending" />
        </TabsContent>

        {/* ... outras tabs */}
      </Tabs>
    </div>
  )
}
```

---

### Componente 2: Suggestion Card

**Arquivo:** `components/suggestion-card.tsx`

**Visual:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔴 CRÍTICO  •  Vitamina D3                                  │
│ Atualização de Biomarcador  •  High Confidence              │
├─────────────────────────────────────────────────────────────┤
│ Fonte: Otimização de Vitamina D3, B12 e Cálcio             │
│                                                              │
│ ┌─── ATUAL ────────┐  ┌─── SUGERIDO ─────┐                │
│ │ Ótimo: 50-80     │  │ Ótimo: 70-90     │                │
│ │ Lab: 20-?        │  │ Lab: 20-100      │                │
│ └──────────────────┘  └──────────────────┘                │
│                                                              │
│ 💡 IA Reasoning:                                            │
│ "Base de conhecimento indica níveis mínimos mais altos     │
│  para imunidade ótima (70 ng/mL vs 50 ng/mL atual)"       │
│                                                              │
│ [Ver Diff Completo]  [Aprovar]  [Rejeitar]  [Modificar]   │
└─────────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface SuggestionCardProps {
  suggestion: Suggestion
  onApprove: () => void
  onReject: () => void
  onModify: () => void
}
```

---

### Componente 3: Diff Viewer

**Arquivo:** `components/diff-viewer.tsx`

**Visual:**
```
┌─────────────────────────────────────────────────────────────┐
│                   COMPARAÇÃO DETALHADA                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Campo: optimalMin                                            │
│ - Atual: 50                                                  │
│ + Sugerido: 70     [Diferença: +20 (40% aumento)]          │
│                                                              │
│ Campo: optimalMax                                            │
│ - Atual: 80                                                  │
│ + Sugerido: 90     [Diferença: +10 (12.5% aumento)]        │
│                                                              │
│ Campo: labMax                                                │
│ - Atual: (não definido)                                      │
│ + Sugerido: 100    [NOVO VALOR]                             │
│                                                              │
│ Campo: clinicalInsight                                       │
│ - Atual: "Vitamina D é essencial..."                        │
│ + Sugerido: "Nível mínimo de 70 ng/mL necessário..."       │
│                                                              │
│ Campo: sourceRef                                             │
│ - Atual: "Dra. Katia Haranaka"                             │
│ + Sugerido: "Otimização de Vitamina D3 - Dra. Katia"       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### Componente 4: Approval Dialog

**Arquivo:** `components/approval-dialog.tsx`

**Visual:**
```
┌─────────────────────────────────────────────────────────────┐
│ Aprovar Sugestão                                        [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Você está prestes a aprovar:                                │
│ • Atualização de Vitamina D3                                │
│ • Confiança: High                                            │
│ • Prioridade: Crítica                                        │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Notas (opcional):                                     │   │
│ │ ┌────────────────────────────────────────────────┐   │   │
│ │ │ Aprovado após validação com pesquisas recentes │   │   │
│ │ └────────────────────────────────────────────────┘   │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ☑ Aplicar imediatamente ao Cérebro Lógico                  │
│                                                              │
│ ⚠️ Esta ação irá:                                           │
│ • Atualizar biomarkers_reference                            │
│ • Registrar mudança no audit log                            │
│ • Notificar outros administradores                          │
│                                                              │
│              [Cancelar]  [Confirmar Aprovação]              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxos de Trabalho

### Fluxo 1: Adicionar Novo Artigo

```
1. Admin adiciona artigo via /admin/medical-knowledge
   ↓
2. Artigo salvo com is_verified = 'verified'
   ↓
3. [TRIGGER AUTOMÁTICO] Sistema detecta novo artigo
   ↓
4. Background job: Analisar artigo com IA
   ↓
5. IA extrai biomarcadores e protocolos
   ↓
6. Sistema compara com Cérebro Lógico
   ↓
7. Se encontrar diferenças/ausências:
   → Cria sugestões em knowledge_update_suggestions
   → Calcula prioridade baseada em impacto
   → Marca conflitos se houver
   ↓
8. Notificação para admin: "3 novas sugestões pendentes"
   ↓
9. Admin abre /admin/knowledge-sync
   ↓
10. Admin revisa, aprova/rejeita/modifica
```

### Fluxo 2: Revisão e Aprovação

```
1. Admin abre /admin/knowledge-sync
   ↓
2. Vê lista de sugestões pendentes (ordenadas por prioridade)
   ↓
3. Clica em uma sugestão para ver detalhes
   ↓
4. Visualiza diff completo (atual vs sugerido)
   ↓
5. Lê reasoning da IA
   ↓
6. Decisão:

   OPÇÃO A: Aprovar
   → Clica "Aprovar"
   → Adiciona notas (opcional)
   → Marca "Aplicar imediatamente"
   → Confirma
   → Sistema atualiza biomarkers_reference
   → Registra em audit_log
   → Status → 'applied'

   OPÇÃO B: Rejeitar
   → Clica "Rejeitar"
   → Escreve motivo (obrigatório)
   → Confirma
   → Status → 'rejected'
   → Registra em audit_log

   OPÇÃO C: Modificar
   → Clica "Modificar"
   → Edita valores sugeridos
   → Adiciona notas explicando modificação
   → Confirma e aplica
   → Status → 'modified' + 'applied'
   → Registra em audit_log
```

### Fluxo 3: Análise Manual (Bulk)

```
1. Admin clica "Analisar Artigos Novos"
   ↓
2. Modal: "Analisar quantos artigos?"
   → Apenas não analisados (incremental)
   → Todos os artigos (full)
   → Artigos específicos (seleção)
   ↓
3. Sistema inicia análise em background
   ↓
4. Progress bar: "Analisando 47 artigos... 12/47"
   ↓
5. Ao finalizar:
   → "Análise completa! 23 sugestões criadas"
   → Lista atualiza automaticamente
```

### Fluxo 4: Auditoria e Rollback

```
1. Admin abre tab "Histórico"
   ↓
2. Vê lista de todas as mudanças aplicadas
   ↓
3. Filtros:
   → Por biomarcador
   → Por data
   → Por quem aplicou
   ↓
4. Clica em uma mudança para ver detalhes
   ↓
5. Vê diff completo (before/after)
   ↓
6. [FUTURO] Botão "Reverter" para rollback
```

---

## ✅ Checklist de Implementação

### Fase 1: Backend - Database Schema ⏳

- [ ] Criar migration para `knowledge_update_suggestions`
- [ ] Criar migration para `sync_audit_log`
- [ ] Adicionar campos de tracking em `knowledge_articles`
- [ ] Adicionar campos de sync em `biomarkers_reference`
- [ ] Adicionar campos de sync em `protocols`
- [ ] Executar migrations
- [ ] Validar schema no banco

**Tempo estimado:** 30 minutos

---

### Fase 2: Backend - AI Analysis Engine ⏳

- [ ] Criar `lib/ai/knowledge/analyzer.ts`
  - [ ] Função `analyzeArticle()` - extrai biomarcadores/protocolos
  - [ ] Usar Gemini 2.5 Pro com Zod schema
  - [ ] Retornar estrutura padronizada

- [ ] Criar `lib/ai/knowledge/suggestion-generator.ts`
  - [ ] Função `generateSuggestions()` - compara com Cérebro Lógico
  - [ ] Detecta updates vs creates
  - [ ] Calcula prioridade
  - [ ] Detecta conflitos

- [ ] Criar `lib/ai/knowledge/conflict-detector.ts`
  - [ ] Função `detectConflicts()` - identifica valores conflitantes
  - [ ] Calcula severity

- [ ] Criar `lib/ai/knowledge/applier.ts`
  - [ ] Função `applySuggestion()` - aplica mudança ao banco
  - [ ] Registra em audit log
  - [ ] Atomic transactions

**Tempo estimado:** 2 horas

---

### Fase 3: Backend - APIs ⏳

- [ ] `POST /api/admin/knowledge-sync/analyze`
  - [ ] Validação de permissões (admin only)
  - [ ] Carregar artigos
  - [ ] Processar com analyzer
  - [ ] Gerar sugestões
  - [ ] Salvar no banco
  - [ ] Retornar resumo

- [ ] `GET /api/admin/knowledge-sync/suggestions`
  - [ ] Query params (filtros, paginação)
  - [ ] Carregar sugestões
  - [ ] Retornar com metadados

- [ ] `POST /api/admin/knowledge-sync/suggestions/:id/approve`
  - [ ] Validar permissões
  - [ ] Atualizar status
  - [ ] Aplicar se solicitado
  - [ ] Registrar em audit log

- [ ] `POST /api/admin/knowledge-sync/suggestions/:id/reject`
  - [ ] Validar permissões
  - [ ] Atualizar status
  - [ ] Salvar motivo
  - [ ] Registrar em audit log

- [ ] `POST /api/admin/knowledge-sync/suggestions/:id/modify`
  - [ ] Validar permissões
  - [ ] Validar dados modificados
  - [ ] Atualizar sugestão
  - [ ] Aplicar se solicitado

- [ ] `GET /api/admin/knowledge-sync/history`
  - [ ] Query params
  - [ ] Carregar histórico
  - [ ] Retornar com paginação

- [ ] `GET /api/admin/knowledge-sync/stats`
  - [ ] Calcular estatísticas
  - [ ] Retornar resumo

**Tempo estimado:** 2 horas

---

### Fase 4: Frontend - Componentes Base ⏳

- [ ] Criar `app/(dashboard)/admin/knowledge-sync/page.tsx`
  - [ ] Layout básico
  - [ ] Tabs (Pendentes/Aprovadas/Rejeitadas/Histórico)
  - [ ] Botão "Analisar Artigos"

- [ ] Criar `components/stats-dashboard.tsx`
  - [ ] Cards com contadores
  - [ ] Gráficos de prioridade
  - [ ] Atividade recente

- [ ] Criar `components/filters.tsx`
  - [ ] Filtro por status
  - [ ] Filtro por prioridade
  - [ ] Filtro por tipo
  - [ ] Busca por slug

- [ ] Criar `components/suggestion-card.tsx`
  - [ ] Visual com cores por prioridade
  - [ ] Preview de diff
  - [ ] Badges de confiança
  - [ ] Botões de ação

- [ ] Criar `components/suggestion-list.tsx`
  - [ ] Lista responsiva
  - [ ] Paginação
  - [ ] Loading states
  - [ ] Empty states

**Tempo estimado:** 2 horas

---

### Fase 5: Frontend - Componentes Avançados ⏳

- [ ] Criar `components/diff-viewer.tsx`
  - [ ] Comparação lado a lado
  - [ ] Highlight de diferenças
  - [ ] Cores visuais (verde/vermelho)
  - [ ] Cálculo de % de mudança

- [ ] Criar `components/approval-dialog.tsx`
  - [ ] Form de aprovação
  - [ ] Campo de notas
  - [ ] Checkbox "Aplicar imediatamente"
  - [ ] Confirmação

- [ ] Criar `components/rejection-dialog.tsx`
  - [ ] Form de rejeição
  - [ ] Campo obrigatório de motivo
  - [ ] Confirmação

- [ ] Criar `components/modification-dialog.tsx`
  - [ ] Form de edição
  - [ ] Campos editáveis
  - [ ] Validação
  - [ ] Preview de mudanças

- [ ] Criar `components/history-table.tsx`
  - [ ] Tabela com histórico
  - [ ] Filtros
  - [ ] Paginação
  - [ ] Dialog de detalhes

**Tempo estimado:** 1.5 horas

---

### Fase 6: Integração e Polimento ⏳

- [ ] Integrar todas as APIs com frontend
- [ ] Adicionar loading states
- [ ] Adicionar error handling
- [ ] Adicionar success notifications (toast)
- [ ] Adicionar confirmações antes de ações críticas
- [ ] Implementar refresh automático
- [ ] Adicionar keyboard shortcuts
- [ ] Mobile responsiveness
- [ ] Accessibility (ARIA labels)
- [ ] Testes manuais de fluxos completos

**Tempo estimado:** 1 hora

---

### Fase 7: Automação (Opcional - Pode ser depois) ⏳

- [ ] Criar trigger de banco para novos artigos
- [ ] Criar background job para análise
- [ ] Configurar notificações
- [ ] Email/webhook quando novas sugestões
- [ ] Auto-aprovação de high confidence (configurável)

**Tempo estimado:** 1 hora (se implementar agora)

---

## 📐 Critérios de Sucesso

### Funcionalidade Básica ✅
- [ ] Admin pode ver lista de sugestões pendentes
- [ ] Admin pode aprovar uma sugestão
- [ ] Admin pode rejeitar uma sugestão
- [ ] Sugestão aprovada atualiza Cérebro Lógico corretamente
- [ ] Mudanças são registradas em audit log

### Funcionalidade Avançada ✅
- [ ] Admin pode modificar sugestão antes de aprovar
- [ ] Admin pode ver diff visual claro
- [ ] Admin pode ver histórico completo de mudanças
- [ ] Sistema calcula prioridades corretamente
- [ ] Sistema detecta conflitos automaticamente

### UX/UI ✅
- [ ] Interface intuitiva e fácil de usar
- [ ] Feedback visual claro para todas as ações
- [ ] Loading states durante operações
- [ ] Error handling gracioso
- [ ] Responsivo em mobile

### Performance ✅
- [ ] Análise de artigo completa em < 5 segundos
- [ ] Lista de sugestões carrega em < 1 segundo
- [ ] Aplicação de mudança em < 2 segundos
- [ ] Paginação eficiente para muitas sugestões

### Segurança ✅
- [ ] Apenas admins podem acessar
- [ ] Todas as ações são auditadas
- [ ] Validação de dados em backend
- [ ] Transações atômicas para mudanças

---

## 🎯 Marcos (Milestones)

### Milestone 1: MVP Backend (2 horas)
- Schema criado
- APIs básicas funcionando
- Analyzer extraindo dados
- Sugestões sendo geradas

### Milestone 2: MVP Frontend (2 horas)
- Página principal
- Lista de sugestões
- Botões de aprovação/rejeição funcionando
- Mudanças sendo aplicadas

### Milestone 3: Polimento (2 horas)
- Diff viewer visual
- Dialogs de confirmação
- Histórico completo
- Stats dashboard

### Milestone 4: Produção (1 hora)
- Testes completos
- Bug fixes
- Documentação de uso
- Deploy

---

## 📝 Notas de Implementação

### Decisões Técnicas

1. **Por que Gemini 2.5 Pro?**
   - Melhor para análise complexa e extração estruturada
   - Saída estruturada nativa com Zod
   - 1M tokens de contexto

2. **Por que JSONB para dados?**
   - Flexibilidade para evoluir schema
   - Fácil comparação de before/after
   - Suporta campos opcionais

3. **Por que tabela separada de audit log?**
   - Não poluir tabela de sugestões
   - Permite queries eficientes de histórico
   - Mantém integridade mesmo se sugestão for deletada

4. **Por que priorização automática?**
   - Valores críticos (lab limits) = critical
   - Valores ótimos com grande diferença = high
   - Novos biomarcadores importantes = medium
   - Biomarcadores raros = low

### Melhorias Futuras (Post-MVP)

- [ ] Rollback de mudanças aplicadas
- [ ] Versionamento de biomarcadores
- [ ] Comparação entre múltiplas fontes
- [ ] Sistema de votação (múltiplos admins)
- [ ] Integration tests automatizados
- [ ] Dashboard de métricas de qualidade
- [ ] Export de relatórios em PDF
- [ ] API para integração com N8N

---

## 📚 Referências

- `GUIA-ATUALIZACAO-CEREBRO-LOGICO.md` - Como atualizar manualmente
- `ESTRATEGIA-SINCRONIZACAO-CONHECIMENTO.md` - Estratégia geral
- `scripts/audit-knowledge-sync.ts` - Script de auditoria original
- `docs/MODELOS-GEMINI-COMPARACAO.md` - Comparação de modelos

---

**Documento Criado:** 09/01/2026
**Última Atualização:** 09/01/2026
**Status:** 📋 Planejamento Completo - Pronto para Implementação
**Próximo Passo:** Iniciar Fase 1 - Database Schema
