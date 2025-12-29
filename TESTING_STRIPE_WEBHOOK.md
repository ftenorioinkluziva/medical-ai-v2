# Testando Stripe Webhook

## Problema Identificado

O webhook do Stripe NÃO está processando pagamentos porque:
- Stripe CLI não está rodando OU
- Webhook não está recebendo eventos

## Solução: 3 Opções de Teste

### Opção 1: Usar Stripe CLI (Recomendado)

**Passo a Passo:**

1. **Abrir um novo terminal** (deixar rodando durante os testes)

2. **Rodar o Stripe CLI:**
   ```bash
   cd C:\projetos\medical-ai-v2\stripe-cli
   .\stripe.exe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```

3. **Deixar o terminal aberto** - você verá os eventos chegando em tempo real

4. **Em outro terminal, rodar o dev server:**
   ```bash
   pnpm run dev
   ```

5. **Fazer uma compra de teste:**
   - Acessar: http://localhost:3000/dashboard/credits
   - Clicar em "Comprar" em qualquer pacote
   - Usar cartão de teste: `4242 4242 4242 4242`
   - Data: qualquer data futura
   - CVC: qualquer 3 dígitos
   - CEP: qualquer

6. **Verificar os logs:**
   - No terminal do Stripe CLI: você verá `checkout.session.completed`
   - No terminal do Next.js: você verá logs como:
     ```
     🔔 [WEBHOOK] Received request
     ✅ [WEBHOOK] Signature verified, event type: checkout.session.completed
     💳 [WEBHOOK-HANDLER] Starting payment success handler
     ✅ [WEBHOOK-HANDLER] Credits added successfully
     ```

7. **Verificar se os créditos foram adicionados:**
   ```bash
   pnpm tsx --env-file=.env.local scripts/debug-payment.ts
   ```

---

### Opção 2: Trigger Manual via Stripe CLI

Se você já fez a compra mas o webhook não processou:

```bash
# Criar um evento de teste
cd stripe-cli
.\stripe.exe trigger checkout.session.completed
```

Isso criará um evento fake e enviará para o webhook.

---

### Opção 3: Processar Pagamento Manualmente (Sem Webhook)

Se você NÃO quer usar Stripe CLI, pode processar manualmente:

1. **Encontrar o Session ID no Stripe Dashboard:**
   - https://dashboard.stripe.com/test/payments
   - Copiar o Session ID (começa com `cs_test_...`)

2. **Criar script para processar manualmente:**
   ```bash
   pnpm tsx --env-file=.env.local scripts/process-stripe-session.ts <SESSION_ID>
   ```

(Script será criado se necessário)

---

## Como Saber Se Está Funcionando

### ✅ Sinais de Sucesso:

1. **Stripe CLI mostra:**
   ```
   [200] POST http://localhost:3000/api/webhooks/stripe [evt_xxx]
   ```

2. **Next.js mostra:**
   ```
   🔔 [WEBHOOK] Received request
   ✅ [WEBHOOK] Signature verified
   💳 [WEBHOOK-HANDLER] Starting payment success handler
   ✅ [WEBHOOK-HANDLER] Credits added successfully: 100 credits to user xxx
   ```

3. **Banco de dados atualizado:**
   - Rodar: `pnpm tsx --env-file=.env.local scripts/debug-payment.ts`
   - Ver: Balance > 0, transações listadas

### ❌ Sinais de Problema:

1. **Stripe CLI NÃO mostra nada:**
   - Stripe CLI não está rodando
   - Solução: Iniciar Stripe CLI

2. **Next.js mostra erro de signature:**
   ```
   ❌ [WEBHOOK] Signature verification failed
   ```
   - STRIPE_WEBHOOK_SECRET está errado
   - Solução: Copiar novo secret do Stripe CLI

3. **Next.js mostra erro de metadata:**
   ```
   ❌ [WEBHOOK-HANDLER] Missing metadata
   ```
   - Session foi criada sem metadata correto
   - Solução: Verificar código de criação da sessão

---

## Próximos Passos

**Para o usuário atual (2b2f1392-c098-49cb-be90-676dfa4c49ce):**

1. Rodar Stripe CLI em um terminal separado
2. Fazer nova compra de teste
3. Verificar logs do webhook
4. Confirmar créditos adicionados

**OU:**

Processar manualmente o pagamento que já foi feito (se soubermos o Session ID).

---

## Comandos Úteis

```bash
# Ver saldo atual
pnpm tsx --env-file=.env.local scripts/debug-payment.ts

# Listar usuários
pnpm tsx --env-file=.env.local scripts/list-users.ts

# Adicionar créditos manualmente (bypass webhook)
pnpm tsx --env-file=.env.local scripts/add-test-credits.ts test@paridaderisco.com 100

# Ver logs do Stripe CLI
cd stripe-cli
.\stripe.exe logs tail
```
