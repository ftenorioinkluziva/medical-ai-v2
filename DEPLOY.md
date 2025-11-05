# Guia de Deploy - Hetzner com Docker e Nginx Proxy Manager

Este guia explica como fazer deploy do Medical AI v2 em um servidor Hetzner usando Docker com Nginx Proxy Manager.

## Pré-requisitos

1. **Servidor Hetzner**
   - Ubuntu 22.04 ou superior
   - Mínimo 2GB RAM
   - 20GB de armazenamento
   - Acesso SSH configurado
   - **Nginx Proxy Manager já instalado e configurado**

2. **Domínio**
   - Domínio registrado e configurado para apontar para o IP do servidor
   - DNS já propagado

3. **Credenciais (mesmas do .env local)**
   - DATABASE_URL (Supabase ou outro PostgreSQL)
   - GOOGLE_AI_API_KEY (Gemini)
   - OPENAI_API_KEY

## Estrutura de Arquivos

```
medical-ai-v2/
├── Dockerfile                  # Container da aplicação Next.js
├── docker-compose.yml          # Orquestração do serviço
├── .dockerignore              # Arquivos ignorados no build
├── .env.production.example    # Template de variáveis de ambiente
├── deploy-hetzner.sh          # Script de deploy automatizado
└── DEPLOY.md                  # Este arquivo
```

**Nota:** Este deploy usa o Nginx Proxy Manager que já está instalado no servidor.

## Passo a Passo

### 1. Preparação Local

```bash
# Clone o repositório (se necessário)
git clone <seu-repo>
cd medical-ai-v2

# Torne o script executável
chmod +x deploy-hetzner.sh
```

### 2. Configurar Acesso SSH

```bash
# Teste a conexão SSH
ssh root@135.181.47.220

# (Opcional) Configure chave SSH para acesso sem senha
ssh-copy-id root@135.181.47.220
```

### 3. Deploy da Aplicação

```bash
# Execute o script de deploy
SERVER_HOST=135.181.47.220 ./deploy-hetzner.sh
```

O script irá:
- ✅ Verificar conexão SSH
- ✅ Instalar Docker (se necessário)
- ✅ Copiar arquivos para o servidor
- ✅ Configurar containers
- ✅ Executar migrações do banco de dados (no seu banco externo)
- ✅ (Opcional) Seed do banco com agentes padrão

**Importante:** O deploy usa seu banco de dados existente (Supabase ou outro PostgreSQL). Não cria um container PostgreSQL.

### 4. Configurar Variáveis de Ambiente

Após o deploy, configure o arquivo `.env.production` no servidor:

```bash
# Conecte ao servidor
ssh root@135.181.47.220

# Edite o arquivo de ambiente
cd /opt/medical-ai-v2
nano .env.production
```

**Conteúdo do `.env.production`:**

```bash
# Database (copie do seu .env local)
DATABASE_URL=sua_database_url_do_supabase

# NextAuth
NEXTAUTH_SECRET=gere_com_openssl_rand_base64_32
NEXTAUTH_URL=https://seu-dominio.com

# AI APIs (copie do seu .env local - mesmas chaves)
GOOGLE_AI_API_KEY=sua_google_ai_key_do_env_local
OPENAI_API_KEY=sua_openai_key_do_env_local

# Application
NODE_ENV=production
PORT=3000
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Importante:**
- Use a **mesma DATABASE_URL** do `.env` local
- Use as **mesmas API keys** (GOOGLE_AI_API_KEY e OPENAI_API_KEY) do `.env` local
- NEXTAUTH_URL deve ser o domínio final com HTTPS

Após configurar, reinicie os containers:
```bash
docker compose restart
```

### 5. Configurar Proxy no Nginx Proxy Manager

Acesse o Nginx Proxy Manager e adicione um novo Proxy Host:

1. **Acesse o painel:** `http://135.181.47.220:81`

2. **Adicione Proxy Host:**
   - **Domain Names:** `seu-dominio.com`, `www.seu-dominio.com`
   - **Scheme:** `http`
   - **Forward Hostname/IP:** `135.181.47.220` ou `localhost`
   - **Forward Port:** `3002`
   - **Cache Assets:** ✅ Ativado
   - **Block Common Exploits:** ✅ Ativado
   - **Websockets Support:** ✅ Ativado

3. **Configure SSL:**
   - Aba **SSL**
   - **SSL Certificate:** Request a new SSL Certificate with Let's Encrypt
   - **Force SSL:** ✅ Ativado
   - **HTTP/2 Support:** ✅ Ativado
   - **HSTS Enabled:** ✅ Ativado
   - **Email:** seu-email@example.com
   - ✅ Aceite os termos do Let's Encrypt

4. **Salve** e aguarde o certificado ser gerado

A aplicação estará disponível em `https://seu-dominio.com`

### 6. Verificar Deploy

Acesse sua aplicação:
- **HTTP:** `http://seu-dominio.com` (redireciona para HTTPS)
- **HTTPS:** `https://seu-dominio.com`

Verifique os logs:
```bash
# No servidor
cd /opt/medical-ai-v2
docker compose logs -f app
```

## Comandos Úteis

### Gerenciar Containers

```bash
# Ver status dos containers
docker compose ps

# Ver logs
docker compose logs -f              # Todos os serviços
docker compose logs -f app          # Apenas aplicação
docker compose logs -f postgres     # Apenas banco

# Reiniciar serviços
docker compose restart app          # Reiniciar aplicação
docker compose restart              # Reiniciar todos

# Parar todos os serviços
docker compose down

# Parar e remover volumes (⚠️ apaga dados)
docker compose down -v

# Rebuild e restart
docker compose up -d --build
```

### Banco de Dados

**Nota:** O banco de dados é externo (Supabase ou outro PostgreSQL), não está em container.

```bash
# Executar migrations no banco externo
docker compose exec app npx drizzle-kit migrate

# Seed database (no banco externo)
docker compose exec app npm run db:seed

# Drizzle Studio (visualizador de DB)
docker compose exec app npm run db:studio

# Para backup do banco externo, use as ferramentas do seu provedor:
# - Supabase: Dashboard -> Database -> Backups
# - Outro provedor: pg_dump direto no host do banco
```

### SSL/Certificados

Os certificados SSL são gerenciados automaticamente pelo Nginx Proxy Manager:
- Renovação automática configurada
- Visualize certificados no painel NPM: SSL Certificates
- Logs disponíveis no NPM

### Monitoramento

```bash
# Uso de recursos
docker stats

# Espaço em disco
df -h
docker system df

# Ver processos
docker compose top

# Limpar recursos não utilizados
docker system prune -a
```

## Atualização da Aplicação

Para atualizar a aplicação com novas mudanças:

```bash
# Local: commit suas mudanças
git add .
git commit -m "Suas mudanças"
git push

# Deploy novamente
SERVER_HOST=SEU_IP_HETZNER ./deploy-hetzner.sh
```

Ou manualmente no servidor:

```bash
# No servidor
cd /opt/medical-ai-v2
git pull origin main
docker compose up -d --build app
```

## Troubleshooting

### Aplicação não inicia

```bash
# Verificar logs
docker compose logs app

# Verificar variáveis de ambiente
docker compose exec app env | grep -E "DATABASE_URL|NEXTAUTH"

# Restart completo
docker compose down
docker compose up -d
```

### Erro de conexão com banco

```bash
# Verificar variável de ambiente DATABASE_URL
docker compose exec app printenv DATABASE_URL

# Verificar logs da aplicação
docker compose logs app

# Testar conexão manualmente
docker compose exec app node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()').then(() => console.log('Connected!')).catch(err => console.error(err));"

# Problemas comuns:
# - Firewall do banco bloqueando IP do servidor Hetzner
# - DATABASE_URL incorreta ou expirada
# - Banco de dados requer whitelist de IPs (adicione IP do Hetzner)
```

### SSL não funciona

Verifique no Nginx Proxy Manager:
- Acesse o painel NPM em `http://135.181.47.220:81`
- Vá em SSL Certificates
- Verifique se o certificado foi gerado com sucesso
- Verifique os logs no NPM
- Certifique-se que as portas 80 e 443 estão abertas no firewall

### Porta já em uso

```bash
# Ver o que está usando a porta 3002
netstat -tulpn | grep 3002

# Parar container se necessário
docker compose down
docker compose up -d
```

## Backup e Recuperação

### Backup Completo

```bash
#!/bin/bash
BACKUP_DIR="/backup/medical-ai-$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup dos uploads (se houver)
tar -czf $BACKUP_DIR/uploads.tar.gz /opt/medical-ai-v2/uploads

# Backup do .env
cp /opt/medical-ai-v2/.env.production $BACKUP_DIR/

echo "Backup salvo em: $BACKUP_DIR"
echo "Nota: Para backup do banco de dados, use o painel do seu provedor (Supabase, etc.)"
```

**Backup do Banco de Dados:**
- **Supabase:** Use o Dashboard -> Database -> Backups
- **Outro provedor:** Consulte a documentação do seu serviço de banco de dados

### Recuperação

```bash
# Restaurar uploads
tar -xzf uploads.tar.gz -C /opt/medical-ai-v2/

# Para restaurar banco, use o painel do seu provedor
```

## Segurança

### Recomendações

1. **Firewall configurado** (portas 22, 80, 443, 81 para NPM)
2. **DATABASE_URL segura** e não compartilhada publicamente
3. **NEXTAUTH_SECRET único** e seguro
4. **SSL/HTTPS** sempre ativo (configurado no NPM)
5. **Backups regulares** (use o backup automático do seu provedor de banco)
6. **IP Whitelist** no banco de dados (adicione o IP do servidor Hetzner)
7. **Updates do sistema**:
   ```bash
   apt update && apt upgrade -y
   ```
8. **Monitoramento de logs**
9. **Rate limiting** (configurado no NPM)

## Custos Estimados (Hetzner)

- **CX21** (2 vCPU, 4GB RAM, 40GB SSD): ~€5.83/mês
- **CX31** (2 vCPU, 8GB RAM, 80GB SSD): ~€10.90/mês
- **Domínio**: ~€10-15/ano
- **SSL**: Grátis (Let's Encrypt)

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs: `docker compose logs`
2. Consulte este guia
3. Abra uma issue no repositório

## Checklist de Deploy

- [ ] Servidor Hetzner provisionado
- [ ] Nginx Proxy Manager instalado e funcionando
- [ ] Domínio configurado e DNS propagado
- [ ] Acesso SSH configurado
- [ ] IP do servidor Hetzner adicionado ao whitelist do banco de dados
- [ ] Deploy executado com sucesso (deploy-hetzner.sh)
- [ ] Variáveis de ambiente configuradas (.env.production com mesmas credenciais do .env local)
- [ ] Proxy Host criado no NPM (porta 3002 -> seu domínio)
- [ ] SSL configurado no NPM (Let's Encrypt)
- [ ] Banco de dados migrado (drizzle-kit migrate)
- [ ] Agentes seedados (opcional)
- [ ] Aplicação acessível via HTTPS
- [ ] Backup do banco configurado no provedor
- [ ] Logs monitorados

---

**Última atualização:** 2025-11-05
