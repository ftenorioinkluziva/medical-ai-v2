# Deployment Guide - Arcane (Hetzner)

## Overview

Este guia é específico para deploy usando [Arcane](https://getarcane.app/) em servidor Hetzner.
Arcane é uma UI de gerenciamento Docker (similar ao Portainer).

## 🚀 Deploy Inicial

### 1. Preparar o Servidor Hetzner

```bash
# SSH no servidor Hetzner
ssh root@your-server-ip

# Instalar Docker (se ainda não instalado)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt-get install docker-compose-plugin

# Verificar instalação
docker --version
docker compose version
```

### 2. Instalar Arcane

```bash
# Criar diretório para Arcane
mkdir -p /opt/arcane
cd /opt/arcane

# Criar docker-compose.yml para Arcane
cat > docker-compose.yml <<EOF
version: '3.8'
services:
  arcane:
    image: ghcr.io/getarcaneapp/arcane:latest
    container_name: arcane
    restart: unless-stopped
    ports:
      - "8080:3000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - arcane-data:/app/data
    environment:
      - NODE_ENV=production

volumes:
  arcane-data:
EOF

# Iniciar Arcane
docker compose up -d

# Verificar status
docker compose ps
```

Acesse Arcane em: `http://your-server-ip:8080`

### 3. Preparar Aplicação no Servidor

```bash
# Criar diretório para a aplicação
mkdir -p /opt/medical-ai-v2
cd /opt/medical-ai-v2

# Clonar repositório (ou fazer upload dos arquivos)
git clone YOUR_REPO_URL .

# Criar arquivo .env (NUNCA commitar no git!)
cat > .env <<EOF
# Database (External - Supabase, Neon, ou outro)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://yourdomain.com"

# AI APIs
GOOGLE_GENERATIVE_AI_API_KEY="your_google_ai_key"
# OPENAI_API_KEY="your_openai_key"  # Optional

# Stripe Billing (Optional)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Node Environment
NODE_ENV=production
EOF

# Proteger o arquivo .env
chmod 600 .env
```

### 4. Build e Deploy via Arcane

#### Opção A: Via Interface Arcane (Recomendado)

1. Acesse Arcane UI em `http://your-server-ip:8080`
2. Vá em **Stacks** → **Add Stack**
3. Nome: `medical-ai-v2`
4. Path: `/opt/medical-ai-v2`
5. Clique em **Deploy**
6. Arcane irá executar `docker compose up -d`

#### Opção B: Via Terminal SSH

```bash
cd /opt/medical-ai-v2

# Build e start
docker compose up -d --build

# Verificar logs
docker compose logs -f app
```

## 🔄 Redeploy (Após Mudanças)

### Quando Atualizar

Execute redeploy quando:
- Atualizar código-fonte (git pull)
- Modificar Dockerfile ou docker-compose.yml
- Adicionar/modificar variáveis de ambiente
- Aplicar novas migrações

### Processo de Redeploy

#### Via Arcane UI

1. Acesse Arcane → **Stacks** → `medical-ai-v2`
2. Clique em **Stop**
3. Aguarde container parar
4. Clique em **Rebuild** (força novo build)
5. Clique em **Start**
6. Monitore logs em **Logs** tab

#### Via Terminal SSH

```bash
cd /opt/medical-ai-v2

# Atualizar código
git pull origin main

# Rebuild completo (recomendado após mudanças no código)
docker compose down
docker compose build --no-cache
docker compose up -d

# OU rebuild incremental (mais rápido)
docker compose up -d --build

# Verificar status
docker compose ps

# Ver logs em tempo real
docker compose logs -f app
```

## 🔧 Troubleshooting

### 1. Verificar Logs do Container

#### Via Arcane UI
1. Stacks → `medical-ai-v2` → **app** container
2. Clique em **Logs**
3. Ative "Auto-refresh" para logs em tempo real

#### Via Terminal
```bash
# Ver últimos logs
docker compose logs app --tail=100

# Seguir logs em tempo real
docker compose logs -f app

# Ver todos os logs
docker logs medical-ai-app
```

### 2. Executar Comandos Dentro do Container

#### Via Arcane UI
1. Container → **medical-ai-app** → **Console**
2. Execute comandos interativamente

#### Via Terminal
```bash
# Acessar shell do container
docker exec -it medical-ai-app sh

# Dentro do container, você pode:
# - Verificar migrações
node scripts/check-db-status.mjs

# - Testar conectividade do banco
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()').then(r => console.log(r.rows)).catch(e => console.error(e))"

# - Ver variáveis de ambiente
env | grep DATABASE_URL

# Sair do container
exit
```

### 3. Verificar Migrações

```bash
# Executar script de diagnóstico
docker exec medical-ai-app node scripts/check-db-status.mjs

# Executar migrações manualmente (se necessário)
docker exec medical-ai-app node scripts/migrate.mjs
```

### 4. Problemas Comuns

#### Container não inicia
```bash
# Ver logs de erro
docker compose logs app

# Verificar se DATABASE_URL está setada
docker exec medical-ai-app env | grep DATABASE_URL

# Verificar healthcheck
docker inspect medical-ai-app | grep -A 10 Health
```

#### Erro "Failed to find Server Action"
```bash
# Rebuild completo (limpa cache)
docker compose down
docker rmi medical-ai-v2-app  # Remove imagem antiga
docker compose build --no-cache
docker compose up -d

# Limpar cache do navegador: Ctrl+Shift+R
```

#### Erro "ETIMEDOUT" (Database)
```bash
# Verificar se banco está acessível
docker exec medical-ai-app node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()').then(() => console.log('✅ OK')).catch(e => console.error('❌', e.message))"

# Verificar DATABASE_URL
docker exec medical-ai-app env | grep DATABASE_URL

# Testar conexão do servidor para o banco
docker exec medical-ai-app ping -c 3 your-db-host
```

#### Migrações não aplicadas
```bash
# Container agora executa migrações automaticamente no startup!
# Mas se precisar executar manualmente:
docker exec medical-ai-app node scripts/migrate.mjs

# Verificar quais migrações foram aplicadas
docker exec medical-ai-app node scripts/check-db-status.mjs
```

## 📊 Monitoramento

### Via Arcane UI
- **Dashboard**: Visão geral de todos os containers
- **Stats**: CPU, memória, rede em tempo real
- **Logs**: Logs do container
- **Console**: Terminal interativo

### Via Terminal

```bash
# Status dos containers
docker compose ps

# Uso de recursos
docker stats medical-ai-app

# Healthcheck status
docker inspect medical-ai-app --format='{{.State.Health.Status}}'

# Logs com filtro
docker compose logs app | grep ERROR
docker compose logs app | grep "Failed to find Server Action"
```

## 🔐 Segurança

### Variáveis de Ambiente

**NUNCA** commite `.env` no git!

```bash
# Verificar se .env está no .gitignore
cat .gitignore | grep .env

# Backup do .env (importante!)
cp .env .env.backup
chmod 600 .env.backup
```

### Acesso ao Arcane

```bash
# Recomendado: Use nginx como proxy reverso
# Configurar SSL com Let's Encrypt
# Adicionar autenticação básica

# Exemplo de configuração nginx
cat > /etc/nginx/sites-available/arcane <<EOF
server {
    listen 80;
    server_name arcane.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

ln -s /etc/nginx/sites-available/arcane /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Instalar SSL
certbot --nginx -d arcane.yourdomain.com
```

## 🚨 Backup

```bash
# Backup do código e configurações
tar -czf medical-ai-backup-$(date +%Y%m%d).tar.gz \
  /opt/medical-ai-v2 \
  --exclude=/opt/medical-ai-v2/node_modules \
  --exclude=/opt/medical-ai-v2/.next

# Backup do banco de dados
# (Execute no servidor do banco ou via dump remoto)
pg_dump $DATABASE_URL > medical-ai-db-$(date +%Y%m%d).sql
```

## 📝 Checklist de Deploy

### Deploy Inicial
- [ ] Servidor Hetzner configurado
- [ ] Docker instalado
- [ ] Arcane instalado e acessível
- [ ] Repositório clonado em `/opt/medical-ai-v2`
- [ ] Arquivo `.env` criado e protegido
- [ ] DATABASE_URL válida
- [ ] Variáveis de ambiente configuradas
- [ ] Build via Arcane ou docker compose
- [ ] Container iniciado com sucesso
- [ ] Migrações executadas (automático)
- [ ] Healthcheck passando
- [ ] Aplicação acessível

### Redeploy (Atualizações)
- [ ] Git pull das mudanças
- [ ] Rebuild do container
- [ ] Verificar logs sem erros
- [ ] Testar funcionalidades críticas
- [ ] Verificar que não há erro "Failed to find Server Action"
- [ ] Backup antes de mudanças grandes

## 🔗 Recursos

- [Arcane GitHub](https://github.com/getarcaneapp/arcane)
- [Arcane Documentation](https://getarcane.app/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Hetzner Cloud Docs](https://docs.hetzner.com/cloud/)

## 📞 Suporte

Se problemas persistirem:
1. Verificar logs via Arcane ou `docker compose logs`
2. Executar `docker exec medical-ai-app node scripts/check-db-status.mjs`
3. Verificar DATABASE_URL e conectividade
4. Rebuild completo: `docker compose down && docker compose build --no-cache && docker compose up -d`
