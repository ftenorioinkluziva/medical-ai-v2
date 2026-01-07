# Schema-Driven UI Implementation Guide

Este guia documenta a implementação do sistema de **UI Dinâmica baseada em Schema JSON** que permite ao front-end se adaptar automaticamente a mudanças nos schemas dos geradores de produtos.

## 📋 Visão Geral

O sistema permite que:
1. **Schemas JSON** definam a estrutura dos dados gerados pela IA
2. **Display Configs** definam como esses dados devem ser exibidos
3. **ProductRenderer** renderize automaticamente qualquer schema
4. **Zero código** seja necessário quando schemas mudam

## 🗃️ Passo 1: Migração do Banco de Dados

### SQL a Executar Manualmente

Execute o seguinte SQL no seu banco de dados PostgreSQL:

```sql
-- Migration 0016: Add display_config column to health_agents
-- Adds UI configuration metadata for dynamic rendering of product outputs

ALTER TABLE "health_agents"
ADD COLUMN "display_config" jsonb;

COMMENT ON COLUMN "health_agents"."display_config" IS 'UI configuration for dynamic rendering: layout, field labels, icons, colors, display types';
```

### Verificar Migração

Após executar, verifique que a coluna foi criada:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'health_agents'
AND column_name = 'display_config';
```

## 🎨 Passo 2: Popular Display Configs

Execute o script que adiciona configurações de exibição aos geradores existentes:

```bash
node scripts/populate-display-configs.mjs
```

Isso irá adicionar `display_config` para:
- `meals` (Plano de Refeições)
- `workouts` (Plano de Treinos)
- `supplementation` (Suplementação)
- `shopping` (Lista de Compras)
- `recommendations` (Recomendações)

## 🧩 Passo 3: Estrutura dos Componentes

### Arquivos Criados

```
components/
└── dynamic-renderer/
    └── product-renderer.tsx          # Componente dinâmico universal

components/weekly-plan/
└── dynamic-weekly-plan-widget.tsx    # Exemplo de uso

lib/db/schema/
└── agents.ts                         # Tipos TypeScript adicionados

lib/db/migrations/
└── 0016_add_display_config.sql       # Migração SQL

scripts/
└── populate-display-configs.mjs      # Script de população
```

## 📐 Estrutura do Display Config

### Exemplo Completo (meals)

```typescript
{
  title: "Plano de Refeições",
  description: "Seu plano nutricional semanal personalizado",
  layout: "timeline",
  fields: {
    overview: {
      label: "Visão Geral",
      displayType: "text",
      order: 1,
      visible: true
    },
    daily_calories_avg: {
      label: "Média de Calorias Diárias",
      icon: "Flame",
      color: "orange",
      displayType: "badge",
      order: 2
    },
    weekly_plan: {
      label: "Plano Semanal",
      displayType: "timeline",
      order: 3,
      nested: {
        day: {
          label: "Dia da Semana",
          displayType: "text",
          visible: false  // Usado apenas como label da tab
        },
        meals: {
          label: "Refeições do Dia",
          layout: "grid",
          columns: 2,
          nested: {
            breakfast: {
              label: "Café da Manhã",
              icon: "Sunrise",
              color: "amber",
              displayType: "card",
              order: 1,
              nested: {
                name: { label: "Prato", displayType: "text", order: 1 },
                calories: { label: "Calorias", icon: "Flame", displayType: "badge", color: "orange", order: 2 },
                ingredients: { label: "Ingredientes", displayType: "list", order: 3 },
                instructions: { label: "Modo de Preparo", displayType: "text", order: 4 }
              }
            },
            // ... outras refeições
          }
        }
      }
    }
  }
}
```

## 🎯 DisplayType Options

| DisplayType | Descrição | Uso |
|------------|-----------|-----|
| `text` | Texto simples | Descrições, parágrafos |
| `list` | Lista com bullets | Arrays de strings |
| `card` | Card com borda colorida | Objetos estruturados |
| `timeline` | Tabs navegáveis | Arrays com dias/etapas |
| `pills` | Badges inline | Tags, categorias |
| `badge` | Badge único | Status, valores curtos |
| `grid` | Grid de 2+ colunas | Objetos com múltiplos campos |

## 🔌 Passo 4: Uso no Front-End

### Exemplo Básico

```tsx
import { ProductRenderer } from '@/components/dynamic-renderer/product-renderer'

function MyComponent({ data, displayConfig }) {
  return (
    <ProductRenderer
      data={data}
      displayConfig={displayConfig}
    />
  )
}
```

### Exemplo com API

```tsx
'use client'

import { useEffect, useState } from 'react'
import { ProductRenderer } from '@/components/dynamic-renderer/product-renderer'

export function DynamicWidget() {
  const [data, setData] = useState(null)
  const [config, setConfig] = useState(null)

  useEffect(() => {
    async function load() {
      // Buscar com includeConfig=true
      const res = await fetch('/api/weekly-plan?includeConfig=true')
      const json = await res.json()

      setData(json.plans[0].mealPlan)
      setConfig(json.displayConfigs.meals)
    }
    load()
  }, [])

  if (!data || !config) return <div>Carregando...</div>

  return <ProductRenderer data={data} displayConfig={config} />
}
```

## 🔄 Como Mudar Schemas

### 1. Adicionar Novo Campo ao Schema JSON

```json
{
  "type": "object",
  "properties": {
    "overview": { "type": "string" },
    "weekly_plan": { ... },
    "daily_calories_avg": { "type": "string" },

    // NOVO CAMPO
    "nutritional_tips": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

### 2. Atualizar Display Config

```sql
UPDATE health_agents
SET display_config = jsonb_set(
  display_config,
  '{fields,nutritional_tips}',
  '{"label": "Dicas Nutricionais", "displayType": "list", "icon": "Lightbulb", "color": "yellow", "order": 4}'
)
WHERE generator_key = 'meals';
```

### 3. Pronto! ✅

O front-end irá **automaticamente**:
- Detectar o novo campo
- Renderizá-lo conforme o displayType
- Aplicar ícone, cor e ordenação
- Exibir no local correto

## 🎨 Personalizando Cores e Ícones

### Ícones Disponíveis

Todos os ícones do [Lucide React](https://lucide.dev/icons/):
- `Sunrise`, `Sun`, `Moon` - Refeições
- `Flame`, `Apple` - Nutrição
- `Dumbbell`, `Target` - Exercícios
- `Pill`, `Syringe` - Suplementos
- `ShoppingCart`, `Package` - Compras

### Cores Tailwind

Use nomes de cores Tailwind:
- `orange`, `amber`, `yellow`
- `green`, `emerald`, `teal`
- `blue`, `sky`, `indigo`, `violet`
- `purple`, `pink`, `red`

## 🧪 Testando

### Verificar Display Configs no Banco

```sql
SELECT
  generator_key,
  display_config->>'title' as title,
  jsonb_array_length(display_config->'fields'::jsonb) as field_count
FROM health_agents
WHERE agent_type = 'product_generator';
```

### Testar API

```bash
curl http://localhost:3000/api/weekly-plan?includeConfig=true
```

Deve retornar:
```json
{
  "success": true,
  "plans": [...],
  "displayConfigs": {
    "meals": { "title": "Plano de Refeições", ... },
    "workouts": { "title": "Plano de Treinos", ... },
    ...
  }
}
```

## 📚 Próximos Passos

### Opcional: Migrar Componentes Existentes

Você pode substituir gradualmente os componentes hardcoded:

1. **weekly-plan-widget.tsx** → Usar `DynamicWeeklyPlanWidget`
2. **meal-plan-navigator.tsx** → Substituir por `ProductRenderer`
3. **workout-plan-navigator.tsx** → Substituir por `ProductRenderer`

### Opcional: Admin UI para Display Config

Criar interface de admin para editar display configs visualmente:
- Drag & drop para reordenar campos
- Color picker para cores
- Icon selector para ícones
- Preview em tempo real

## ❓ FAQ

### Como adicionar uma nova refeição (ex: "second_breakfast")?

1. Adicione ao schema JSON do gerador `meals`
2. Adicione ao display_config:

```sql
UPDATE health_agents
SET display_config = jsonb_set(
  display_config,
  '{fields,weekly_plan,nested,meals,nested,second_breakfast}',
  '{
    "label": "Segundo Café",
    "icon": "Coffee",
    "color": "yellow",
    "displayType": "card",
    "order": 2
  }'::jsonb
)
WHERE generator_key = 'meals';
```

### Como esconder um campo?

```sql
UPDATE health_agents
SET display_config = jsonb_set(
  display_config,
  '{fields,some_field,visible}',
  'false'
)
WHERE generator_key = 'meals';
```

### Como mudar a ordem de exibição?

```sql
UPDATE health_agents
SET display_config = jsonb_set(
  display_config,
  '{fields,some_field,order}',
  '1'  -- Número menor = aparece primeiro
)
WHERE generator_key = 'meals';
```

## ✅ Checklist de Implementação

- [x] Criar migração SQL (0016_add_display_config.sql)
- [x] Atualizar schema Drizzle (agents.ts)
- [x] Criar ProductRenderer component
- [x] Criar script de população (populate-display-configs.mjs)
- [x] Atualizar API para retornar configs
- [x] Criar exemplo de uso (dynamic-weekly-plan-widget.tsx)
- [ ] **Executar migração SQL manualmente**
- [ ] **Executar script de população**
- [ ] **Testar API com ?includeConfig=true**
- [ ] **Testar ProductRenderer com dados reais**
- [ ] (Opcional) Migrar componentes existentes
- [ ] (Opcional) Criar Admin UI para editar configs

## 🎉 Benefícios

✅ **Zero código** quando schemas mudam
✅ **Totalmente flexível** - suporta qualquer estrutura
✅ **Personalização total** - cores, ícones, layouts
✅ **Reutilizável** - mesmo componente para todos produtos
✅ **Admin-friendly** - configuração via banco de dados
✅ **Mostra tudo** - nenhum campo fica escondido
✅ **Versionamento** - schemas antigos continuam funcionando
