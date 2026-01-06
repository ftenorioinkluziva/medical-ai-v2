# Integração N8N - Upload Automático de Artigos

## Visão Geral

Este documento descreve como integrar o Medical AI V2 com N8N para fazer upload automático de artigos PDF para a base de conhecimento.

## Endpoint

```
POST http://localhost:3000/api/admin/knowledge/auto-upload
```

**Produção:**
```
POST https://seu-dominio.com/api/admin/knowledge/auto-upload
```

## Autenticação

O endpoint requer autenticação de administrador via NextAuth session cookies. Você precisa:

1. Fazer login no sistema primeiro para obter a session cookie
2. Incluir a cookie nas requisições subsequentes

### Opção 1: Usando Cookie de Sessão (Recomendado)

No N8N, configure o nó HTTP Request:

1. **Authentication**: None
2. **Send Headers**: Sim
3. Adicione o header:
   - Name: `Cookie`
   - Value: `authjs.session-token=<seu-token-aqui>`

### Opção 2: API Key (Futuro)

Se você criar um sistema de API keys, pode usar header de Authorization:
- Name: `Authorization`
- Value: `Bearer <seu-api-key>`

## Formato da Requisição

### Content-Type
```
multipart/form-data
```

### Body (Form Data)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| file | File | Sim | Arquivo PDF, TXT ou MD |

**Nota:** Apenas o arquivo é necessário! O sistema gera todos os metadados automaticamente usando IA.

## Exemplo de Configuração no N8N

### 1. Nó "Download File" (Opcional)
Se você está baixando o arquivo de algum lugar:

```json
{
  "url": "https://exemplo.com/artigo.pdf",
  "fileName": "artigo.pdf"
}
```

### 2. Nó "HTTP Request" - Upload

**Configuração:**
- **Method**: POST
- **URL**: `http://localhost:3000/api/admin/knowledge/auto-upload`
- **Authentication**: None (ou configure com session cookie)
- **Send Headers**: Sim
  - Header 1: `Cookie: authjs.session-token=<token>`
- **Send Body**: Sim
- **Body Content Type**: Form-Data (Multipart)
- **Specify Body**: Using Fields
- **Body Parameters**:
  - **Name**: `file`
  - **Value**: `{{ $binary.data }}` (se veio de "Download File")
  - **Ou**: Selecione o campo do nó anterior que contém o arquivo

### Exemplo de Workflow N8N Completo

```
[Trigger] → [Download File] → [HTTP Request] → [Result Handler]
```

**Exemplo com dados do binário:**

```json
{
  "method": "POST",
  "url": "http://localhost:3000/api/admin/knowledge/auto-upload",
  "headers": {
    "Cookie": "authjs.session-token=eyJhbGc..."
  },
  "body": {
    "file": "={{ $binary.data }}"
  },
  "bodyContentType": "multipart-form-data"
}
```

## Resposta da API

### Sucesso (200 OK)

```json
{
  "success": true,
  "articleId": "123e4567-e89b-12d3-a456-426614174000",
  "metadata": {
    "title": "Diabetes e Resistência à Insulina",
    "category": "Endocrinologia",
    "subcategory": "Diabetes",
    "source": "Journal of Endocrinology",
    "author": "Dr. João Silva",
    "summary": "Este artigo explora os mecanismos da resistência à insulina...",
    "tags": "diabetes, insulina, metabolismo, glicose"
  },
  "stats": {
    "textLength": 45230,
    "chunksCount": 23,
    "processingTimeMs": 8542
  }
}
```

### Erro de Autenticação (401)

```json
{
  "success": false,
  "error": "Não autenticado"
}
```

### Erro de Permissão (403)

```json
{
  "success": false,
  "error": "Acesso negado. Apenas administradores podem adicionar artigos."
}

```

### Erro de Validação (400)

```json
{
  "success": false,
  "error": "Arquivo é obrigatório"
}
```

ou

```json
{
  "success": false,
  "error": "Tipo de arquivo não suportado. Use PDF, TXT ou MD."
}
```

### Erro do Servidor (500)

```json
{
  "success": false,
  "error": "Erro ao processar upload automático"
}
```

## Processo Automatizado

O endpoint executa automaticamente os seguintes passos:

1. **Extração de Texto**
   - PDFs: Usa `pdf-parse` para extrair texto
   - TXT/MD: Lê diretamente o conteúdo

2. **Geração de Metadados com IA**
   - Usa Google Gemini 2.5 Flash
   - Analisa o conteúdo do documento
   - Gera: título, categoria, subcategoria, resumo, tags, fonte, autor

3. **Criação de Embeddings**
   - Divide o texto em chunks (500 tokens)
   - Gera embeddings usando Google `text-embedding-004`
   - Armazena no banco de dados com pgvector

4. **Salvamento no Banco**
   - Cria registro na tabela `knowledge_articles`
   - Armazena embeddings na tabela `knowledge_embeddings`
   - Marca como verificado (isVerified: 'verified')

## Tipos de Arquivo Suportados

| Tipo | Extensões | MIME Type |
|------|-----------|-----------|
| PDF | .pdf | application/pdf |
| Texto | .txt | text/plain |
| Markdown | .md | text/markdown |

## Limitações

- Tamanho mínimo: 100 caracteres
- PDFs devem conter texto extraível (não apenas imagens)
- Para PDFs escaneados, use OCR antes de enviar

## Como Obter o Token de Sessão

### Método 1: Via Browser DevTools

1. Faça login em `http://localhost:3000/login`
2. Abra DevTools (F12)
3. Vá em Application > Cookies > http://localhost:3000
4. Copie o valor de `authjs.session-token`

### Método 2: Via API Login (Futuro)

Se você criar um endpoint de login API:

```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "senha-secreta"
}
```

## Monitoramento e Logs

O sistema gera logs detalhados no console do servidor:

```
🤖 [AUTO-UPLOAD] Starting automated upload process...
📄 [AUTO-UPLOAD] File: artigo.pdf, Type: application/pdf, Size: 92160 bytes
📄 [AUTO-UPLOAD] Extracting PDF...
✅ [AUTO-UPLOAD] PDF extracted: 45230 chars, 12 pages
🤖 [AUTO-UPLOAD] Generating metadata with AI...
✅ [AUTO-UPLOAD] Metadata generated:
   - Title: Diabetes e Resistência à Insulina
   - Category: Endocrinologia
   - Subcategory: Diabetes
   - Tags: diabetes, insulina, metabolismo, glicose
🧠 [AUTO-UPLOAD] Adding article to knowledge base...
✅ [AUTO-UPLOAD] Process completed successfully!
📊 [AUTO-UPLOAD] Article ID: 123e4567-e89b-12d3-a456-426614174000
📊 [AUTO-UPLOAD] Chunks: 23
⏱️ [AUTO-UPLOAD] Total processing time: 8542ms
```

## Exemplo de Workflow N8N Visual

```
┌─────────────┐
│   Webhook   │ Recebe notificação de novo artigo
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ HTTP Request│ Baixa o PDF de uma URL
│(Download)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ HTTP Request│ POST /api/admin/knowledge/auto-upload
│(Upload)     │ Body: file (binary)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│IF Condition │ Verifica se success === true
└──────┬──────┘
       │
       ├─── Success ───► [Notification] Envia confirmação
       │
       └─── Error ─────► [Error Handler] Registra erro
```

## Testando a Integração

### Teste com cURL

```bash
curl -X POST http://localhost:3000/api/admin/knowledge/auto-upload \
  -H "Cookie: authjs.session-token=SEU-TOKEN-AQUI" \
  -F "file=@/caminho/para/artigo.pdf"
```

### Teste com Node.js

```javascript
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('file', fs.createReadStream('./artigo.pdf'));

fetch('http://localhost:3000/api/admin/knowledge/auto-upload', {
  method: 'POST',
  headers: {
    'Cookie': 'authjs.session-token=SEU-TOKEN-AQUI'
  },
  body: form
})
.then(res => res.json())
.then(data => console.log(data));
```

## Troubleshooting

### Erro: "Não autenticado"
- Verifique se o cookie de sessão está correto
- Faça login novamente para obter um novo token
- Certifique-se de que o token não expirou

### Erro: "Acesso negado"
- Verifique se o usuário tem role `admin`
- Apenas administradores podem adicionar artigos

### Erro: "Texto extraído muito curto"
- O PDF pode estar vazio ou conter apenas imagens
- Use OCR para converter PDFs escaneados em texto primeiro

### Erro: "Erro ao gerar metadados"
- Verifique se a API key do Google AI está configurada
- Verifique os logs do servidor para mais detalhes

## Segurança

- **Autenticação obrigatória**: Apenas admins autenticados
- **Validação de arquivo**: Aceita apenas PDF, TXT, MD
- **Tamanho mínimo**: 100 caracteres para evitar uploads vazios
- **Auto-verificação**: Artigos são marcados como verificados automaticamente

## Performance

- **Tempo médio**: 5-15 segundos (dependendo do tamanho do PDF)
- **Tempo de extração**: ~1-3 segundos
- **Tempo de geração de metadados**: ~2-5 segundos
- **Tempo de embeddings**: ~2-10 segundos (dependendo do número de chunks)

## Suporte

Para problemas ou dúvidas, verifique:
1. Logs do servidor no console
2. Status code e mensagem de erro na resposta
3. Documentação do NextAuth para problemas de autenticação
