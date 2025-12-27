# 🔧 Guia de Solução - Erros Encontrados no Teste Playwright

## 📌 Resumo dos Erros

| ID | Erro | Severidade | Status | Solução |
|---|---|---|---|---|
| #1 | API `/api/recommendations` retorna 404 | 🟡 Média | Comportamento Esperado | Ver seção 1 |
| #2 | Agente "Andrew Huberman" incorreto | 🔴 Alta | Requer Ação | Ver seção 2 |
| #3 | Falta `autocomplete` em password fields | 🟢 Baixa | Quick Fix | Ver seção 3 |

---

## 🟡 ERRO #1: API `/api/recommendations` retorna 404

### Análise do Problema

**Causa:** Não é um BUG, é comportamento ESPERADO.

O usuário criado durante teste (João Silva Test) ainda não fez análise médica. Por isso:
1. Dashboard tenta carregar recomendações
2. API `/api/recommendations` retorna 404 (sem recomendações)
3. Widget mostra "Erro ao carregar plano"

**Código relevante:**
```typescript
// app/api/recommendations/route.ts (linha 91-93)
if (!latestRec) {
  return NextResponse.json({
    success: false,
    error: 'Nenhuma recomendação encontrada. Realize uma análise médica primeiro.',
  }, { status: 404 })
}
```

### Solução

**Opção A: Melhorar tratamento de erro no Widget** (Recomendado)

Modificar `components/weekly-plan/weekly-plan-widget.tsx` para diferenciar "nenhum plano" de "erro":

```tsx
const loadPlan = async () => {
  try {
    setIsLoading(true)
    setError(null)

    const endpoint = patientId
      ? `/api/weekly-plan?patientId=${patientId}`
      : '/api/weekly-plan'

    const response = await fetch(endpoint)
    
    // ✅ Diferenciar 404 (nenhum plano) de erro real (500)
    if (response.status === 404) {
      setError('Nenhum plano semanal disponível. Faça sua primeira análise!')
      return
    }
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Erro ao carregar plano')
    }

    const data = await response.json()
    if (data.plans && data.plans.length > 0) {
      setPlan(data.plans[0])
    }
  } catch (err) {
    // ...
  }
}
```

**Opção B: Retornar dados vazios em vez de 404**

Modificar `app/api/weekly-plan/route.ts`:

```typescript
// Retornar estrutura vazia em vez de 404
if (!latestPlan) {
  return NextResponse.json({
    success: true,
    plans: [],
    message: 'Nenhum plano disponível. Realize uma análise médica primeiro.',
  })
}
```

### Teste da Solução

```bash
# 1. Fazer upload de documento
# 2. Realizar análise com agente
# 3. Recarregar dashboard
# 4. Widget deve mostrar recomendações geradas
```

---

## 🔴 ERRO #2: Agente "Andrew Huberman" na lista de especialistas

### Análise do Problema

**Causa:** Agente adicionado manualmente no banco, não faz parte do seed oficial.

O seed (`scripts/seed-agents.ts`) define apenas 4 agentes:
1. ✅ Medicina Integrativa (agentKey: `integrativa`)
2. ✅ Endocrinologia Funcional (agentKey: `endocrinologia`)
3. ✅ Metabolismo e Nutrição (agentKey: `nutricao`)
4. ✅ Fisiologia do Exercício (agentKey: `exercicio`)

MAS aparece um 5º agente: "Andrew Huberman" (agentKey: `AndrewHuberman`)

### Raiz do Problema

Possíveis causas:
1. ❌ Agente adicionado manualmente via `db:studio` em desenvolvimento
2. ❌ Agente criado por script de teste anterior
3. ❌ Agente nunca foi removido de versão anterior

### Solução

**Passo 1: Verificar agentes no banco**

```bash
pnpm db:studio
# Navegar para tabela "health_agents"
# Procurar por agentKey = "AndrewHuberman"
# Anotar o ID
```

**Passo 2: Deletar agente incorreto**

Opção A - Via SQL direto:
```sql
DELETE FROM health_agents WHERE agentKey = 'AndrewHuberman';
```

Opção B - Via `db:studio`:
1. Abrir Drizzle Studio: `pnpm db:studio`
2. Navegar para tabela `health_agents`
3. Procurar linha com `agentKey = 'AndrewHuberman'`
4. Clicar "Delete"
5. Confirmar

**Passo 3: Re-seed dos agentes corretos**

```bash
# Apagar todas os agentes
pnpm db:studio
# Navegar para health_agents > Delete all rows

# Re-seed com agentes corretos
pnpm db:seed
```

Ou criar script de limpeza:
```bash
# scripts/clean-agents.ts
import { db } from '../lib/db/client'
import { healthAgents } from '../lib/db/schema'

async function clean() {
  // Deletar agentes inativos ou incorretos
  await db.delete(healthAgents)
    .where((agents) => agents.agentKey.not.in(['integrativa', 'endocrinologia', 'nutricao', 'exercicio']))
  
  console.log('✅ Agentes incorretos removidos')
}

clean()
```

Rodar com:
```bash
tsx --env-file=.env.local scripts/clean-agents.ts
```

**Passo 4: Verificar resultado**

```bash
pnpm dev
# Ir para http://localhost:3000/analyze
# Verificar se aparecem apenas 4 agentes
```

### Teste da Solução

```javascript
// Verificar via API
fetch('http://localhost:3000/api/agents')
  .then(r => r.json())
  .then(data => {
    console.log('Agentes:', data.agents.length)
    console.log('Nomes:', data.agents.map(a => a.name))
  })
```

Resultado esperado:
```
Agentes: 4
Nomes: [
  "Medicina Integrativa",
  "Endocrinologia Funcional", 
  "Metabolismo e Nutrição",
  "Fisiologia do Exercício"
]
```

---

## 🟢 ERRO #3: Falta `autocomplete` em campos de password

### Análise do Problema

**Causa:** HTML input missing standard attribute.

Browsers não conseguem sugerir senhas salvas porque falta o atributo `autocomplete`.

**Onde ocorre:**
- Página de registro (`/register`)
- Página de login (`/login`)

**Standards HTML:**
- `autocomplete="new-password"` - Para novos registros
- `autocomplete="current-password"` - Para login

### Solução

**Arquivo 1: Página de Login**

Encontrar: `app/(auth)/login/page.tsx` ou `components/auth/login-form.tsx`

Procurar por:
```tsx
<input type="password" placeholder="••••••••" />
```

Substituir por:
```tsx
<input 
  type="password" 
  placeholder="••••••••"
  autoComplete="current-password"
/>
```

**Arquivo 2: Página de Registro**

Encontrar: `app/(auth)/register/page.tsx` ou `components/auth/register-form.tsx`

Procurar por:
```tsx
// Campo "Senha"
<input type="password" placeholder="••••••••" />

// Campo "Confirmar Senha"  
<input type="password" placeholder="••••••••" />
```

Substituir por:
```tsx
// Campo "Senha"
<input 
  type="password" 
  placeholder="••••••••"
  autoComplete="new-password"
/>

// Campo "Confirmar Senha"
<input 
  type="password" 
  placeholder="••••••••"
  autoComplete="new-password"
/>
```

### Teste da Solução

```bash
# 1. pnpm dev
# 2. Abrir DevTools (F12)
# 3. Ir para /login
# 4. Inspeccionar campo password
# 5. Verificar atributo autocomplete="current-password"

# Resultado esperado:
# <input type="password" autocomplete="current-password" ... />
```

### Referência W3C

- Documentação: https://www.w3.org/TR/html52/sec-forms.html#autofilling-form-controls
- MDN: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete

---

## 📋 Checklist de Implementação

### Erro #1: API 404
- [ ] Implementar Opção A ou B
- [ ] Testar com usuário novo
- [ ] Testar após fazer análise

### Erro #2: Agente incorreto
- [ ] Verificar banco via `db:studio`
- [ ] Deletar agente "AndrewHuberman"
- [ ] Re-seed agentes: `pnpm db:seed`
- [ ] Verificar `/api/agents` retorna 4 agentes

### Erro #3: Autocomplete
- [ ] Adicionar `autoComplete="current-password"` em login
- [ ] Adicionar `autoComplete="new-password"` em registro
- [ ] Testar inspección de HTML

---

## 🧪 Teste Final Integrado

Após implementar todas as soluções:

```bash
# 1. Limpar histórico do navegador
# 2. pnpm dev
# 3. Recarregar http://localhost:3000

# 4. Fazer novo registro
  - Verificar autocomplete funciona

# 5. Fazer login
  - Verificar autocomplete funciona
  - Ir para /dashboard

# 6. Ir para /analyze
  - Verificar aparecem apenas 4 agentes
  - Nomes corretos

# 7. Re-verificar dashboard
  - Widget de recomendações mostra estado correto
  - Sem erros de console
```

### Verificação de Console

```bash
# Abrir DevTools > Console
# Não deve haver:
# ❌ [ERROR] Failed to load resource: the server responded with a status of 404
# ✅ Pode haver warnings normais de desenvolvimento
```

---

## 📞 Suporte

Se encontrar problemas durante a implementação:

1. **Erro na sintaxe**: Verificar `.tsx` vs `.ts`
2. **Agente ainda aparece**: Fazer `pnpm db:studio` e deletar manualmente
3. **Teste quebrado**: Limpar cache do navegador e cookies

---

**Data de Criação:** 3 de dezembro de 2025  
**Status:** Pronto para Implementação  
**Tempo Estimado:** 15-20 minutos
