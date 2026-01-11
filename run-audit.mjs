#!/usr/bin/env node

// Carrega variáveis de ambiente do .env.local
import { config } from 'dotenv'
import { resolve } from 'path'
import { spawn } from 'child_process'

// Carrega .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Executa o script de auditoria
const child = spawn('pnpm', ['tsx', 'scripts/audit-knowledge-sync.ts'], {
  stdio: 'inherit',
  env: process.env,
  shell: true
})

child.on('exit', (code) => {
  process.exit(code || 0)
})
