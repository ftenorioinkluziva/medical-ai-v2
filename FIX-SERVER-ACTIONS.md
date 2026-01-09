# Fix: Server Action "x" Not Found Error

## Problema
```
Error: Failed to find Server Action "x". This request might be from an older or newer deployment.
```

Este erro acontece após deployments quando há incompatibilidade entre código do cliente e servidor.

## Soluções (em ordem de prioridade)

### 1. Rebuild Completo (MAIS IMPORTANTE)

```bash
# Limpe completamente o build cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstale dependências (opcional mas recomendado)
pnpm install --force

# Build novo
pnpm build

# Verifique se não há erros no build
# Faça o deployment da nova build
```

### 2. Vercel/Plataforma de Deploy

Se você está usando Vercel ou similar:

```bash
# Force redeploy sem cache
vercel --force

# Ou no dashboard do Vercel:
# Settings → General → Ignore Build Cache: Enable
```

### 3. Cache do Browser

Oriente usuários a:
- Fazer hard refresh: `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
- Limpar cache do site
- Usar modo anônimo para testar

### 4. Verificação de Rotas

O erro aparece após a análise ser concluída. Verifique se há:

```typescript
// components/complete-analysis/analysis-progress.tsx:68-92
// Este componente faz polling a cada 3 segundos
// Certifique-se de que a rota /api/analyses/complete/${analysisId} está funcionando
```

### 5. Next.js Config

Adicione ao `next.config.ts`:

```typescript
export default {
  // ... outras configs

  // Desabilita server actions inline para evitar problemas de cache
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    }
  }
}
```

## Prevenção Futura

### Durante Development:

1. **Sempre teste build local antes de deploy:**
   ```bash
   pnpm build
   pnpm start
   ```

2. **Evite Server Actions inline:** Sempre coloque em arquivos separados com `'use server'`

3. **Use API Routes para operações críticas:** Server Actions são ótimas para forms, mas operações complexas devem usar API Routes

### Durante Deployment:

1. **Deploy completo, não incremental** quando houver mudanças em Server Actions
2. **Monitore logs** após deploy para detectar problemas rapidamente
3. **Tenha rollback plan** para voltar versão anterior se necessário

## Verificação Pós-Fix

Após aplicar o fix:

1. Verifique que não há mais erros no console
2. Teste o fluxo completo de análise
3. Verifique que o polling funciona corretamente
4. Confirme que o redirect após análise completa funciona

## Avisos Adicionais

O log também mostra:
```
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
```

Este é um aviso de acessibilidade. Adicione descrição aos dialogs:

```tsx
<DialogContent aria-describedby="dialog-description">
  <DialogDescription id="dialog-description">
    Descrição do dialog aqui
  </DialogDescription>
</DialogContent>
```

E também:
```
Input elements should have autocomplete attributes
```

Adicione atributo autocomplete aos inputs de login:
```tsx
<Input
  type="text"
  autoComplete="username" // ou "email"
/>
<Input
  type="password"
  autoComplete="current-password"
/>
```
