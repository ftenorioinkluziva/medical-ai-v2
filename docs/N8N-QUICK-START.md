# N8N Quick Start - Upload Automático de PDFs

## 🎯 Objetivo

Automatizar o upload de artigos PDF para a base de conhecimento do Medical AI V2 usando N8N.

## ⚠️ Troubleshooting

Se você receber o erro **"source.on is not a function"**, consulte: [N8N-TROUBLESHOOTING.md](./N8N-TROUBLESHOOTING.md)

## 📋 Pré-requisitos

1. Medical AI V2 rodando (dev ou produção)
2. N8N instalado e configurado
3. Token de sessão de admin

## 🔑 Passo 1: Obter Token de Sessão

### Opção A: Via Browser (Mais Fácil)

1. Acesse: `http://localhost:3000/login`
2. Faça login como admin
3. Pressione **F12** (DevTools)
4. Vá em: **Application** → **Cookies** → `http://localhost:3000`
5. Copie o valor de: `authjs.session-token`

### Opção B: Via Script (Opcional)

```bash
# Criar endpoint /api/auth/get-token para facilitar
```

## ⚙️ Passo 2: Configurar N8N

### Configuração Básica do Nó HTTP Request

```
Method: POST
URL: http://localhost:3000/api/admin/knowledge/auto-upload
Authentication: None
```

### Headers

```
Name: Cookie
Value: authjs.session-token=<SEU-TOKEN-AQUI>
```

### Body

```
Type: Form-Data (Multipart)
Specify Body: Using Binary Property  ← IMPORTANTE!
Parameter Name: file
Input Data Field Name: data  ← Nome da propriedade binária
```

**⚠️ IMPORTANTE**: NÃO use "Using Fields" com `{{ $binary.data }}` - isso causa erro! Use "Using Binary Property".

## 📊 Exemplo Completo de Workflow

### Workflow 1: Upload de URL

```
[Webhook/Schedule]
    ↓
[HTTP Request - Download PDF]
  URL: https://exemplo.com/artigo.pdf
  Response Format: File
    ↓
[HTTP Request - Auto Upload]
  URL: http://localhost:3000/api/admin/knowledge/auto-upload
  Method: POST
  Cookie: authjs.session-token=...
  Body: file = {{ $binary.data }}
    ↓
[IF Node]
  Condition: {{ $json.success }} === true
    ↓
    ├─ TRUE → [Notification Success]
    └─ FALSE → [Error Handler]
```

### Workflow 2: Upload de Arquivo Local

```
[Read Binary File]
  File Path: /path/to/article.pdf
    ↓
[HTTP Request - Auto Upload]
  URL: http://localhost:3000/api/admin/knowledge/auto-upload
  Method: POST
  Cookie: authjs.session-token=...
  Body: file = {{ $binary.data }}
    ↓
[Code Node - Log Result]
  console.log($input.all())
```

### Workflow 3: Upload de Google Drive

```
[Google Drive Trigger]
  Watch for new files in folder
    ↓
[Google Drive - Download File]
    ↓
[HTTP Request - Auto Upload]
  URL: http://localhost:3000/api/admin/knowledge/auto-upload
  Method: POST
  Cookie: authjs.session-token=...
  Body: file = {{ $binary.data }}
    ↓
[Google Sheets - Log Upload]
  Add row with metadata
```

## 🎨 Configuração Visual no N8N

### Nó HTTP Request - Detalhes

#### Tab: Parameters

- **Method**: POST
- **URL**: `http://localhost:3000/api/admin/knowledge/auto-upload`

#### Tab: Authentication

- **Authentication**: None

#### Tab: Headers

- Ativar **Send Headers**
- Adicionar:
  - **Name**: `Cookie`
  - **Value**: `authjs.session-token=eyJhbGciOiJIUzI1NiJ9...`

#### Tab: Body

- Ativar **Send Body**
- **Body Content Type**: Form-Data (Multipart)
- **Specify Body**: Using Binary Property ⚠️
- **Parameter Name**: `file`
- **Input Data Field Name**: `data`

**⚠️ ATENÇÃO**: Se você usar "Using Fields" com `{{ $binary.data }}`, receberá o erro "source.on is not a function". A configuração correta é "Using Binary Property"!

## ✅ Resposta de Sucesso

```json
{
  "success": true,
  "articleId": "123e4567-e89b-12d3-a456-426614174000",
  "metadata": {
    "title": "Resistência à Insulina e Diabetes Tipo 2",
    "category": "Endocrinologia",
    "subcategory": "Diabetes",
    "source": "Journal of Endocrinology",
    "author": "Dr. Maria Silva",
    "summary": "Estudo sobre mecanismos da resistência à insulina...",
    "tags": "diabetes, insulina, metabolismo, glicose"
  },
  "stats": {
    "textLength": 45230,
    "chunksCount": 23,
    "processingTimeMs": 8542
  }
}
```

## ❌ Possíveis Erros

### Erro 401 - Não Autenticado
```json
{
  "success": false,
  "error": "Não autenticado"
}
```
**Solução**: Token expirado ou inválido. Faça login novamente.

### Erro 403 - Acesso Negado
```json
{
  "success": false,
  "error": "Acesso negado. Apenas administradores podem adicionar artigos."
}
```
**Solução**: Usuário não é admin.

### Erro 400 - Arquivo Inválido
```json
{
  "success": false,
  "error": "Tipo de arquivo não suportado. Use PDF, TXT ou MD."
}
```
**Solução**: Envie apenas PDF, TXT ou MD.

## 🧪 Testando Manualmente

### Usando cURL

```bash
curl -X POST http://localhost:3000/api/admin/knowledge/auto-upload \
  -H "Cookie: authjs.session-token=SEU_TOKEN_AQUI" \
  -F "file=@/caminho/para/artigo.pdf"
```

### Usando Script Node.js

```bash
# Instalar dependências
pnpm add formdata-node

# Executar teste
node scripts/test-auto-upload.mjs ./artigo.pdf "SEU_TOKEN_AQUI"
```

## 📝 Exemplo de Configuração N8N (JSON)

Você pode importar este workflow diretamente no N8N:

```json
{
  "name": "Medical AI - Auto Upload PDF",
  "nodes": [
    {
      "parameters": {
        "path": "/path/to/file.pdf",
        "options": {}
      },
      "name": "Read Binary File",
      "type": "n8n-nodes-base.readBinaryFile",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/api/admin/knowledge/auto-upload",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Cookie",
              "value": "authjs.session-token=YOUR_TOKEN_HERE"
            }
          ]
        },
        "sendBody": true,
        "contentType": "multipart-form-data",
        "specifyBody": "binaryData",
        "bodyParameters": {
          "parameters": [
            {
              "name": "file",
              "inputDataFieldName": "data",
              "parameterType": "formBinaryData"
            }
          ]
        }
      },
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [460, 300]
    }
  ],
  "connections": {
    "Read Binary File": {
      "main": [
        [
          {
            "node": "HTTP Request",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 🔄 Processo Automatizado

O que acontece quando você envia o PDF:

1. ✅ **Extração de Texto** (1-3s)
   - PDF → texto usando `pdf-parse`

2. ✅ **Geração de Metadados** (2-5s)
   - IA analisa conteúdo
   - Gera título, categoria, resumo, tags

3. ✅ **Criação de Embeddings** (2-10s)
   - Divide texto em chunks
   - Gera embeddings vetoriais
   - Armazena no banco de dados

4. ✅ **Salvar no Banco** (~1s)
   - Artigo completo salvo
   - Pronto para busca semântica

**Tempo total**: 5-15 segundos

## 💡 Dicas

1. **Token Seguro**: Não commite o token no Git
2. **Variáveis de Ambiente**: Use variáveis no N8N para o token
3. **Monitoramento**: Ative logs no N8N para debug
4. **Retry**: Configure retry automático para falhas
5. **Notifications**: Adicione notificações de sucesso/erro

## 🎯 Casos de Uso

### 1. Sincronizar Pasta do Google Drive
- Monitora pasta no Drive
- Quando novo PDF é adicionado
- Automaticamente adiciona à base de conhecimento

### 2. Importar de Email
- Monitora email com attachments
- Filtra PDFs médicos
- Upload automático

### 3. Web Scraping
- Scrape websites médicos
- Baixa PDFs de artigos
- Adiciona à base automaticamente

### 4. RSS Feed
- Monitora feeds de journals
- Baixa novos artigos em PDF
- Upload e catalogação automática

## 📚 Próximos Passos

1. Configure seu primeiro workflow no N8N
2. Teste com um PDF de exemplo
3. Configure notifications de sucesso/erro
4. Expanda para outras fontes (Drive, Email, etc.)

## 🆘 Suporte

- Documentação completa: `docs/N8N-INTEGRATION.md`
- Script de teste: `scripts/test-auto-upload.mjs`
- Logs do servidor: Console onde `pnpm dev` está rodando
