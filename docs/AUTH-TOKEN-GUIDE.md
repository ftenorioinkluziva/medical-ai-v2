# Guia: Como Obter Token de Autenticação para N8N

## 🎯 Problema

O endpoint `/api/admin/knowledge/auto-upload` requer autenticação de **admin**. Para usar no N8N, você precisa de um **token de sessão**.

## ⚠️ Importante

O token **NÃO** vem do arquivo `.env`!

O valor no `.env` é:
```bash
NEXTAUTH_SECRET=372a2dc25486ff0db99be6ff0cd09ce49eb06390f2c539974cd3f191c75eec0d
```

Mas esse é o **secret** usado para **criptografar** os tokens, não é o token em si.

## ✅ Solução 1: Script Automático (RECOMENDADO)

Use o script que criei para obter o token automaticamente:

```bash
node scripts/get-auth-token.mjs seu-email@example.com sua-senha
```

**Exemplo:**
```bash
node scripts/get-auth-token.mjs admin@example.com senha123
```

**Output:**
```
✅ Login realizado com sucesso!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 COPIE ESTE VALOR PARA O N8N:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

authjs.session-token=eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyMy...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Copie esse valor completo e use no N8N!

## ✅ Solução 2: Manual via Browser

Se preferir fazer manualmente:

### Passo 1: Login

1. Acesse: `http://localhost:3000/login`
2. Entre com credenciais de admin
3. Verifique que está logado

### Passo 2: Copiar Token

1. Pressione **F12** (DevTools)
2. Vá em: **Application** (ou **Storage**)
3. Expanda: **Cookies** → `http://localhost:3000`
4. Localize: `authjs.session-token`
5. Copie o **Value** (todo o texto)

### Passo 3: Usar no N8N

No nó HTTP Request:
- Header Name: `Cookie`
- Header Value: `authjs.session-token=<valor-copiado>`

## 🔐 Credenciais de Admin

Se você não tem um usuário admin, pode:

### Opção A: Verificar usuários existentes

```bash
# Conectar ao banco
psql "postgresql://neondb_owner:npg_vF4qIaGC9jWm@ep-frosty-credit-acmws8bi-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"

# Listar admins
SELECT email, name, role FROM users WHERE role = 'admin';
```

### Opção B: Criar um admin via SQL

```sql
-- Mudar um usuário existente para admin
UPDATE users
SET role = 'admin'
WHERE email = 'seu-email@example.com';
```

### Opção C: Registrar novo admin

1. Registre-se em: `http://localhost:3000/register`
2. Depois, promova para admin via SQL (Opção B)

## 📝 Formato Completo do Header

No N8N, o header deve ser:

```
Name: Cookie
Value: authjs.session-token=eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyMzQ1Njc4LTkwYWItY2RlZi0xMjM0LTU2Nzg5MGFiY2RlZiIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJuYW1lIjoiQWRtaW4iLCJpYXQiOjE3MDQ1MDAwMDAsImV4cCI6MTcwNzA5MjAwMCwianRpIjoiYWJjZGVmZ2gtMTIzNC01Njc4LTkwYWItY2RlZjEyMzQ1Njc4In0.x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2
```

**NÃO** coloque só o token sem o prefixo `authjs.session-token=`!

## ⏰ Validade do Token

- **Duração**: 30 dias (configurado em `lib/auth/config.ts`)
- **Renovação**: Faça login novamente quando expirar
- **Verificação**: Use o script `get-auth-token.mjs` para testar

## 🧪 Testando o Token

Teste se o token está funcionando:

```bash
curl -X GET http://localhost:3000/api/admin/agents \
  -H "Cookie: authjs.session-token=SEU_TOKEN_AQUI"
```

**Sucesso:**
```json
{
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": "admin"
  },
  "agents": [...]
}
```

**Erro (não autenticado):**
```json
{
  "error": "Não autenticado"
}
```

**Erro (não é admin):**
```json
{
  "error": "Acesso negado"
}
```

## 🔄 Automatizando Renovação

Para workflows de longa duração, você pode:

### Opção 1: Workflow N8N com Login

```
[Schedule: Todo dia]
    ↓
[HTTP Request: Login]
  POST /api/auth/callback/credentials
  Body: { email, password }
    ↓
[Extract Cookie from Headers]
    ↓
[Save to N8N Variable]
    ↓
[Use in Upload Requests]
```

### Opção 2: API Key System (Futuro)

Posso criar um sistema de API Keys permanentes que não expiram. Isso seria:

```
Authorization: Bearer <api-key-permanente>
```

Me avise se quiser que eu implemente isso!

## 🎯 Exemplo Completo para N8N

**Workflow Testado:**

1. **Nó 1: Read Binary File**
   - File Path: `/path/to/test.pdf`
   - Property Name: `data`

2. **Nó 2: HTTP Request - Upload**
   - Method: `POST`
   - URL: `http://localhost:3000/api/admin/knowledge/auto-upload`
   - Headers:
     - Name: `Cookie`
     - Value: `authjs.session-token=<TOKEN-DO-SCRIPT>`
   - Send Body: ON
   - Body Content Type: `Form-Data Multipart`
   - Specify Body: `Using Binary Property`
   - Parameter Name: `file`
   - Input Data Field Name: `data`

3. **Execute** → Deve retornar `success: true`

## ❓ FAQ

**P: Posso usar o NEXTAUTH_SECRET diretamente?**
R: Não! O NEXTAUTH_SECRET é usado para criptografar, não é o token.

**P: O token expira?**
R: Sim, após 30 dias. Faça login novamente.

**P: Precisa ser admin?**
R: Sim, apenas admins podem fazer upload de artigos.

**P: Posso usar email/senha direto no N8N?**
R: Não atualmente. Use o token de sessão. Se quiser, posso criar um endpoint que aceita credenciais básicas.

**P: Como renovar automaticamente?**
R: Use o script `get-auth-token.mjs` antes de cada upload, ou implemente um workflow de login no N8N.

## 🆘 Troubleshooting

### Erro: "Não autenticado"
- Token expirado → Gere novo token
- Token incorreto → Verifique se copiou completo
- Servidor reiniciado → Token pode ter invalidado

### Erro: "Acesso negado"
- Usuário não é admin → Promova para admin via SQL
- Token de outro usuário → Use token de admin

### Script não funciona
- Servidor não está rodando → `pnpm dev`
- Credenciais erradas → Verifique email/senha
- URL errada → Verifique se é `http://localhost:3000`

## 📞 Precisa de Ajuda?

Se ainda tiver problemas:
1. Execute: `node scripts/get-auth-token.mjs seu-email senha`
2. Me mostre o erro completo
3. Verifique os logs do servidor (`pnpm dev`)
