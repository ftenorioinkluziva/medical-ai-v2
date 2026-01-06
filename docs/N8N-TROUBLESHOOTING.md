# N8N Troubleshooting - Auto Upload API

## ❌ Erro: "source.on is not a function"

### Causa
Este erro acontece quando o N8N não consegue processar o arquivo binário corretamente no form-data.

### ✅ Solução Correta (Testada)

Use o nó **HTTP Request** com estas configurações específicas:

#### Método 1: Usando "Send Binary Data" (RECOMENDADO)

**Passo a passo:**

1. **Method**: POST
2. **URL**: `http://localhost:3000/api/admin/knowledge/auto-upload`
3. **Authentication**: None
4. **Send Headers**: ON
   - Name: `Cookie`
   - Value: `authjs.session-token=SEU_TOKEN`
5. **Send Body**: ON
6. **Body Content Type**: `Form-Data Multipart`
7. **Specify Body**: `Using Binary Property`
   - **Property Name**: `file`
   - **Binary Property**: `data` (ou o nome da propriedade binária do nó anterior)

**Configuração Visual:**

```
┌─────────────────────────────────────┐
│ HTTP Request                        │
├─────────────────────────────────────┤
│ Method: POST                        │
│ URL: http://localhost:3000/...     │
├─────────────────────────────────────┤
│ ☑ Send Headers                      │
│   Cookie: authjs.session-token=...  │
├─────────────────────────────────────┤
│ ☑ Send Body                         │
│ Body Content Type:                  │
│   Form-Data Multipart               │
│ Specify Body:                       │
│   Using Binary Property             │ ← IMPORTANTE!
│                                     │
│ Parameter Name: file                │
│ Input Data Field Name: data         │ ← Nome da propriedade binária
└─────────────────────────────────────┘
```

#### Método 2: Usando Nó "HTTP Request V2" (Alternativa)

Se você está usando a versão antiga do nó HTTP Request:

1. **Request Method**: POST
2. **URL**: `http://localhost:3000/api/admin/knowledge/auto-upload`
3. **Send Binary Data**: ON
4. **Binary Property**: `data`
5. **Binary Property Name**: `file`
6. **Headers**:
   - Cookie: `authjs.session-token=SEU_TOKEN`

#### Método 3: Upload de Arquivo Local

Se você quer fazer upload direto de um arquivo do sistema:

**Workflow:**
```
[Read Binary File] → [HTTP Request]
```

**Configuração Read Binary File:**
- File(s) Selector: File Path
- File Path: `/path/to/file.pdf`
- Property Name: `data`

**Configuração HTTP Request:**
- Method: POST
- URL: `http://localhost:3000/api/admin/knowledge/auto-upload`
- Send Headers: ON
  - Cookie: authjs.session-token=...
- Send Body: ON
- Body Content Type: Form-Data Multipart
- Specify Body: Using Binary Property
- Parameter Name: `file`
- Input Data Field Name: `data`

#### Método 4: Download + Upload

Se você está baixando de uma URL e depois fazendo upload:

**Workflow:**
```
[HTTP Request - Download] → [HTTP Request - Upload]
```

**Nó 1 - Download:**
- Method: GET
- URL: `https://exemplo.com/artigo.pdf`
- Response Format: `File`
- Put Output in Field: `data`

**Nó 2 - Upload:**
- Method: POST
- URL: `http://localhost:3000/api/admin/knowledge/auto-upload`
- Send Headers: ON
  - Cookie: authjs.session-token=...
- Send Body: ON
- Body Content Type: Form-Data Multipart
- Specify Body: Using Binary Property
- Parameter Name: `file`
- Input Data Field Name: `data`

## ⚠️ Configurações INCORRETAS (Não Use)

### ❌ ERRADO - Body Parameters com Expression

```
Body Content Type: Form-Data Multipart
Specify Body: Using Fields
Body Parameters:
  - Name: file
  - Value: {{ $binary.data }}  ← Isso causa o erro!
```

### ❌ ERRADO - JSON no Body

```
Body Content Type: JSON
Body: { "file": "..." }  ← API não aceita JSON
```

### ❌ ERRADO - Raw/Custom sem Binary

```
Body Content Type: Raw/Custom
Body: {{ $json.file }}  ← Não funciona para arquivos
```

## 🎯 Checklist de Verificação

Antes de executar o workflow, verifique:

- [ ] Nó HTTP Request está na versão 3 ou superior
- [ ] "Send Body" está marcado
- [ ] "Body Content Type" é "Form-Data Multipart"
- [ ] "Specify Body" é "Using Binary Property"
- [ ] "Parameter Name" é exatamente `file`
- [ ] "Input Data Field Name" é `data` (ou o nome correto da sua propriedade binária)
- [ ] Cookie de sessão está válido e não expirado
- [ ] Dev server está rodando (http://localhost:3000)

## 🧪 Testando Passo a Passo

### Teste 1: Upload de Arquivo Local

1. Adicione nó "Read Binary File"
   - File Path: Selecione um PDF de teste
   - Property Name: `data`

2. Adicione nó "HTTP Request" conectado ao anterior
   - Configure como "Método 3" acima

3. Execute o workflow

4. Verifique o output:
   - Se success: true → Funcionou! ✅
   - Se erro → Continue para próximo teste

### Teste 2: Verificar Propriedade Binária

1. Após o nó "Read Binary File", adicione um nó "Code"

2. Cole este código:
```javascript
// Log para debug
console.log('Binary data:', Object.keys($binary));
console.log('Data exists:', !!$binary.data);

return $input.all();
```

3. Execute e verifique os logs

4. Confirme que `$binary.data` existe

### Teste 3: Teste Manual com cURL

Para garantir que a API está funcionando:

```bash
curl -X POST http://localhost:3000/api/admin/knowledge/auto-upload \
  -H "Cookie: authjs.session-token=SEU_TOKEN" \
  -F "file=@/caminho/para/teste.pdf"
```

Se funcionar com cURL mas não no N8N, o problema é na configuração do N8N.

## 🔍 Debugging Avançado

### Verificar Request que o N8N está Enviando

1. No nó HTTP Request, adicione:
   - Options → Add Option → "Ignore SSL Issues" (apenas para teste local)

2. Execute com modo debug do N8N:
```bash
export N8N_LOG_LEVEL=debug
n8n start
```

3. Verifique os logs para ver o request exato

### Usar Webhook de Teste

1. Crie um workflow simples com apenas:
   - [Read Binary File] → [Webhook Response]

2. Configure o Webhook Response para retornar:
```javascript
return {
  json: {
    binaryExists: !!$binary.data,
    binaryKeys: Object.keys($binary),
    mimeType: $binary.data?.mimeType,
    fileSize: $binary.data?.fileSize
  }
};
```

3. Isso ajuda a confirmar se o binário está sendo carregado corretamente

## 📱 Exemplo de Workflow Completo (JSON)

Copie e importe no N8N:

```json
{
  "name": "Medical AI - Auto Upload (Fixed)",
  "nodes": [
    {
      "parameters": {
        "filePath": "/path/to/test.pdf",
        "options": {}
      },
      "name": "Read Binary File",
      "type": "n8n-nodes-base.readBinaryFile",
      "typeVersion": 1,
      "position": [250, 300],
      "id": "read-file-node"
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
              "value": "authjs.session-token=372a2dc25486ff0db99be6ff0cd09ce49eb06390f2c539974cd3f191c75eec0d"
            }
          ]
        },
        "sendBody": true,
        "contentType": "multipart-form-data",
        "bodyParameters": {
          "parameters": [
            {
              "name": "file",
              "inputDataFieldName": "data",
              "parameterType": "formBinaryData"
            }
          ]
        },
        "options": {}
      },
      "name": "HTTP Request - Upload",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [450, 300],
      "id": "upload-node"
    }
  ],
  "connections": {
    "Read Binary File": {
      "main": [
        [
          {
            "node": "HTTP Request - Upload",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 🆘 Ainda com Problemas?

Se nenhuma solução funcionou:

1. **Atualize o N8N**: Versões antigas têm bugs com form-data
   ```bash
   npm update -g n8n
   ```

2. **Verifique versão do nó**: Use HTTP Request v4.2 ou superior

3. **Teste com arquivo pequeno**: Comece com PDF < 1MB

4. **Verifique logs do servidor**:
   - Console onde `pnpm dev` está rodando
   - Procure por erros `[AUTO-UPLOAD]`

5. **Token expirado**: Faça login novamente e pegue novo token

6. **Firewall/Proxy**: Certifique-se que localhost:3000 está acessível

## 💡 Dica Pro

Para produção, crie um endpoint de autenticação por API Key em vez de cookie de sessão:

```typescript
// Future: /api/admin/knowledge/auto-upload
// Accept: Authorization: Bearer <api-key>
```

Isso simplifica a autenticação no N8N.
