# Guia de API Keys - Medical AI V2

## 🎯 O Que São API Keys?

API Keys são tokens permanentes de autenticação que permitem acesso programático à API sem precisar de cookies de sessão. **Perfeitas para automação com N8N!**

## ✅ Vantagens sobre Cookies de Sessão

| Feature | Cookie de Sessão | API Key |
|---------|------------------|---------|
| Expiração | 30 dias | Nunca (ou customizável) |
| Renovação | Precisa fazer login | Não precisa |
| Uso em N8N | Complexo (Cookie header) | Simples (Bearer token) |
| Segurança | Boa | Melhor (pode revogar) |
| Múltiplas chaves | Não | Sim |

## 🚀 Como Usar

### Passo 1: Criar uma API Key

#### Opção A: Via cURL (Terminal)

```bash
curl -X POST http://localhost:3000/api/admin/api-keys \
  -H "Cookie: authjs.session-token=<seu-token-de-sessao>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "N8N Automation",
    "description": "Chave para upload automático de PDFs",
    "expiresInDays": 365
  }'
```

**Resposta:**
```json
{
  "success": true,
  "apiKey": "mav2_Xk7Jd9fP2qL5nR8tY3vW6zM4bN1",
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "keyPrefix": "mav2_Xk7Jd9",
  "name": "N8N Automation",
  "description": "Chave para upload automático de PDFs",
  "expiresAt": "2027-01-06T12:00:00.000Z",
  "createdAt": "2026-01-06T12:00:00.000Z",
  "warning": "Salve esta API key agora! Ela não será mostrada novamente."
}
```

#### Opção B: Via Script Node.js

Criei um script para facilitar:

```bash
# TODO: Criar script create-api-key.mjs
node scripts/create-api-key.mjs "N8N Automation"
```

#### ⚠️ IMPORTANTE

**Salve a API key agora!** Ela só é mostrada uma vez. Se perder, precisará criar uma nova.

---

### Passo 2: Usar no N8N

#### Configuração do Nó HTTP Request

```
┌──────────────────────────────────────────┐
│ HTTP Request                             │
├──────────────────────────────────────────┤
│ Method: POST                             │
│ URL: http://localhost:3000/api/admin/    │
│      knowledge/auto-upload               │
├──────────────────────────────────────────┤
│ Authentication: Generic Credential Type  │
│   OU                                     │
│ ☑ Send Headers                           │
│   Name: Authorization                    │
│   Value: Bearer mav2_Xk7Jd9fP2qL5nR8t... │
├──────────────────────────────────────────┤
│ ☑ Send Body                              │
│ Body Content Type: Form-Data Multipart   │
│ Specify Body: Using Binary Property      │
│ Parameter Name: file                     │
│ Input Data Field Name: data              │
└──────────────────────────────────────────┘
```

#### Exemplo Prático

**Header:**
- Name: `Authorization`
- Value: `Bearer mav2_Xk7Jd9fP2qL5nR8tY3vW6zM4bN1`

**Não use** `Cookie` mais! Use `Authorization`!

---

## 📋 Gerenciamento de API Keys

### Listar Todas as Keys

```bash
curl -X GET http://localhost:3000/api/admin/api-keys \
  -H "Cookie: authjs.session-token=<seu-token>"
```

**Resposta:**
```json
{
  "success": true,
  "keys": [
    {
      "id": "123...",
      "keyPrefix": "mav2_Xk7Jd9",
      "name": "N8N Automation",
      "description": "...",
      "isActive": true,
      "lastUsedAt": "2026-01-06T12:30:00.000Z",
      "expiresAt": "2027-01-06T12:00:00.000Z",
      "createdAt": "2026-01-06T12:00:00.000Z"
    }
  ]
}
```

### Revogar uma Key (Desativar)

```bash
curl -X PATCH http://localhost:3000/api/admin/api-keys/<key-id> \
  -H "Cookie: authjs.session-token=<seu-token>"
```

A key continua no banco mas não funciona mais.

### Deletar uma Key (Permanente)

```bash
curl -X DELETE http://localhost:3000/api/admin/api-keys/<key-id> \
  -H "Cookie: authjs.session-token=<seu-token>"
```

Remove permanentemente do banco de dados.

---

## 🔐 Formato da API Key

```
mav2_<24-caracteres-aleatórios>
```

**Exemplo:**
```
mav2_Xk7Jd9fP2qL5nR8tY3vW6zM4bN1
```

- `mav2_` = Prefixo (Medical AI V2)
- Caracteres aleatórios = URL-safe base64

---

## 🧪 Testando

### Teste 1: Criar API Key

```bash
curl -X POST http://localhost:3000/api/admin/api-keys \
  -H "Cookie: authjs.session-token=$(node scripts/get-auth-token.mjs admin@example.com senha | grep 'authjs.session-token=' | cut -d'=' -f2)" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Key"}'
```

### Teste 2: Usar API Key para Upload

```bash
curl -X POST http://localhost:3000/api/admin/knowledge/auto-upload \
  -H "Authorization: Bearer mav2_Xk7Jd9fP2qL5nR8tY3vW6zM4bN1" \
  -F "file=@test.pdf"
```

Se retornar `"success": true`, está funcionando! ✅

---

## 🎯 Workflow N8N Completo

### Workflow Simples

```
[Read Binary File] → [HTTP Request - Upload]
```

**HTTP Request Config:**
- URL: `http://localhost:3000/api/admin/knowledge/auto-upload`
- Headers:
  - Name: `Authorization`
  - Value: `Bearer mav2_...`
- Body:
  - Type: Form-Data Multipart
  - Specify: Using Binary Property
  - Parameter Name: `file`
  - Input Field: `data`

### Workflow Avançado (Google Drive)

```
[Google Drive Trigger] → [Google Drive Download] → [HTTP Request Upload] → [Notification]
```

1. **Trigger**: Monitora pasta no Drive
2. **Download**: Baixa novo PDF
3. **Upload**: Envia para API com API Key
4. **Notification**: Confirma sucesso

---

## 🔒 Segurança

### Boas Práticas

1. **Nunca commite** API keys no Git
2. **Use variáveis** de ambiente no N8N
3. **Crie keys específicas** para cada automação
4. **Revogue keys** antigas que não usa mais
5. **Configure expiração** se possível

### Variáveis de Ambiente no N8N

1. Settings → Variables
2. Criar nova variável:
   - Name: `MEDICAL_AI_API_KEY`
   - Value: `mav2_...`
3. Usar no workflow: `{{$env.MEDICAL_AI_API_KEY}}`

---

## 📊 Comparação: Cookie vs API Key

### Usando Cookie de Sessão (Antigo)

```bash
curl -X POST http://localhost:3000/api/admin/knowledge/auto-upload \
  -H "Cookie: authjs.session-token=eyJhbGciOiJIUzI1NiJ9..." \
  -F "file=@test.pdf"
```

**Problemas:**
- ❌ Expira em 30 dias
- ❌ Cookie muito longo
- ❌ Precisa fazer login novamente
- ❌ Difícil de gerenciar

### Usando API Key (Novo) ✅

```bash
curl -X POST http://localhost:3000/api/admin/knowledge/auto-upload \
  -H "Authorization: Bearer mav2_Xk7Jd9fP2qL5nR8tY3vW6zM4bN1" \
  -F "file=@test.pdf"
```

**Vantagens:**
- ✅ Nunca expira (ou expira quando você quiser)
- ✅ Token curto e limpo
- ✅ Pode revogar quando quiser
- ✅ Múltiplas keys para diferentes propósitos

---

## 🎨 Interface Admin (Futuro)

Você pode criar uma interface web para gerenciar API keys:

```
/admin/api-keys
- Lista de todas as keys
- Botão "Create New Key"
- Botão "Revoke" em cada key
- Última vez usada
- Status (ativa/inativa)
```

---

## ❓ FAQ

**P: Como obter minha primeira API key?**
R: Você precisa estar logado (cookie de sessão) para criar a primeira key. Depois, pode usar apenas API keys.

**P: Posso ter múltiplas keys?**
R: Sim! Crie quantas precisar. Exemplo: uma para N8N, outra para Make, etc.

**P: A key expira?**
R: Só se você configurar `expiresInDays`. Sem isso, nunca expira.

**P: E se perder minha key?**
R: Revogue a antiga e crie uma nova. Não há como recuperar.

**P: Posso usar tanto cookie quanto API key?**
R: Sim! O endpoint aceita ambos. API key tem prioridade.

**P: A API key funciona em produção?**
R: Sim! Funciona em qualquer ambiente. Só mude a URL.

---

## 🚀 Próximos Passos

1. ✅ Crie sua primeira API key
2. ✅ Teste com cURL
3. ✅ Configure no N8N
4. ✅ Automatize seus uploads!

---

## 📞 Suporte

- Documentação completa: `docs/N8N-INTEGRATION.md`
- Troubleshooting: `docs/N8N-TROUBLESHOOTING.md`
- Cookie auth (antigo): `docs/AUTH-TOKEN-GUIDE.md`

**Preferência:** Use API Keys sempre que possível! 🎉
