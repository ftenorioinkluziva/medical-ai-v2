# 🏥 Planejamento: Nova Aplicação de Análise Médica com IA

**Versão:** 1.0
**Data:** 01/11/2025
**Aplicação Atual (Referência):** `doctor_v0` → `C:\projetos\doctor_v0`
**Nova Aplicação:** `medical-ai-v2` → `C:\projetos\medical-ai-v2`

---

## 📋 Sumário Executivo

### Objetivo
Criar uma **aplicação completamente nova**, moderna e limpa para análise médica com IA, mantendo a aplicação atual como referência sem modificá-la. A nova versão utilizará as melhores práticas modernas, Vercel AI SDK, e RAG local (PostgreSQL + pgvector), eliminando dependências caras como Vertex AI RAG.

### Princípios Fundamentais
1. **Limpa e Moderna** - Código clean, arquitetura clara, sem legacy
2. **Type-Safe** - TypeScript strict, Zod schemas em tudo
3. **AI SDK First** - Vercel AI SDK como base de toda IA
4. **RAG Local** - PostgreSQL + pgvector + AI SDK embeddings
5. **Custo-Efetiva** - Eliminar serviços caros (Vertex AI RAG)
6. **Developer Experience** - DX excepcional, fácil manutenção
7. **Production Ready** - Testes, segurança, performance desde o início

### Principais Mudanças vs App Atual

| Aspecto | App Atual (`doctor_v0`) | Nova App (`medical-ai-v2`) |
|---------|-------------------------|----------------------------|
| **IA Stack** | SDK direto Google/OpenAI | Vercel AI SDK unificado |
| **RAG** | Vertex AI RAG (caro) | PostgreSQL + pgvector (local) |
| **ORM** | SQL direto | Drizzle ORM |
| **Embeddings** | Google AI / OpenAI separados | AI SDK unificado |
| **Type Safety** | Parcial | 100% TypeScript strict + Zod |
| **Auth** | NextAuth custom | NextAuth v5 (Auth.js) |
| **Estrutura** | Monolítica | Modular e limpa |
| **Testing** | Mínimo | Vitest + Testing Library |
| **Deployment** | Vercel básico | Vercel otimizado + CI/CD |

---

## 🎯 Visão Geral do Projeto

### O que Manter da App Atual (Features Core)
✅ **Sistema de Agentes Especializados Dinâmicos**
- Agentes configuráveis no banco de dados
- Medicina Integrativa, Endocrinologia, Nutrição, Exercício
- Prompts e configurações personalizáveis

✅ **Perfil Médico Expandido**
- 16+ campos de saúde e estilo de vida
- Dados clínicos completos
- Histórico médico

✅ **Processamento de Documentos Médicos**
- Upload de PDFs e imagens
- Extração inteligente de dados (exames laboratoriais)
- Análise com GPT-4 Vision
- Structured output com schemas

✅ **Sistema de Autenticação e RBAC**
- Papéis: patient, doctor, admin
- Permissões granulares
- Row Level Security
- Auditoria completa

✅ **Chat com Agentes**
- Conversas contextualizadas
- Histórico de mensagens
- RAG integration

✅ **Análise Consolidada**
- Combina documentos + perfil médico + RAG
- Histórico de análises
- Cache inteligente

### O que Remover/Substituir
❌ **Vertex AI RAG** → PostgreSQL + pgvector + AI SDK
❌ **SDKs diretos** (`@google/generative-ai`, `openai`) → Vercel AI SDK
❌ **SQL direto** → Drizzle ORM
❌ **Código legacy** → Reescrever limpo
❌ **NextAuth v4** → NextAuth v5 (Auth.js)

### Novas Features (Bonus)
🆕 **Streaming nativo** - Chat com streaming real-time otimizado
🆕 **Tool Calling** - Agentes com ferramentas (busca RAG, histórico, etc)
🆕 **Multi-provider** - Fácil trocar entre OpenAI, Google, Anthropic
🆕 **Observabilidade** - Telemetria nativa do AI SDK
🆕 **Testes automatizados** - Cobertura de testes desde o início
🆕 **CI/CD** - Pipeline automatizado

---

## 🏗️ Arquitetura da Nova Aplicação

### Stack Tecnológica Moderna

#### Frontend
- **Framework:** Next.js 15 (App Router)
- **React:** 19 (latest)
- **TypeScript:** 5.x (strict mode)
- **Styling:** Tailwind CSS 4.x
- **UI Components:** shadcn/ui (Radix UI + Tailwind)
- **Forms:** React Hook Form + Zod
- **State:** Zustand (se necessário) / Context API
- **Icons:** Lucide React

#### Backend & APIs
- **Framework:** Next.js API Routes (App Router)
- **Runtime:** Node.js 20+ / Edge Runtime
- **Validation:** Zod schemas
- **Auth:** NextAuth v5 (Auth.js)
- **Rate Limiting:** @upstash/ratelimit ou similar

#### Database
- **Primary:** PostgreSQL 16+
- **ORM:** Drizzle ORM
- **Vector Search:** pgvector extension
- **Migrations:** Drizzle Kit
- **Connection Pool:** pg pool

#### AI/ML
- **Core SDK:** Vercel AI SDK (`ai`)
- **Providers:**
  - `@ai-sdk/google` - Gemini (principal)
  - `@ai-sdk/openai` - GPT-4 Vision, fallback
  - `@ai-sdk/anthropic` - Claude (futuro)
- **Embeddings:** AI SDK unified embeddings
- **RAG:** PostgreSQL + pgvector
- **Streaming:** AI SDK native streaming

#### File Processing
- **PDF:** `pdf-parse` ou `@vercel/blob` + OCR
- **Images:** GPT-4 Vision via AI SDK
- **Storage:** Local filesystem / Vercel Blob

#### Development
- **Package Manager:** pnpm
- **Linting:** ESLint + Prettier
- **Testing:** Vitest + Testing Library
- **E2E:** Playwright (opcional)
- **Type Checking:** TypeScript strict

#### Deployment
- **Platform:** Vercel
- **Database:** Vercel Postgres ou Supabase
- **Environment:** Production, Preview, Development
- **CI/CD:** GitHub Actions + Vercel

---

## 📁 Estrutura de Diretórios da Nova App

```
medical-ai-v2/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI pipeline
│       └── deploy.yml                # Deployment
│
├── app/                              # Next.js 15 App Router
│   ├── (auth)/                       # Auth routes group
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/                  # Protected routes group
│   │   ├── layout.tsx                # Dashboard layout
│   │   ├── page.tsx                  # Main dashboard
│   │   ├── documents/                # Document management
│   │   ├── agents/                   # Agents interface
│   │   ├── profile/                  # Medical profile
│   │   ├── history/                  # Analysis history
│   │   └── settings/                 # User settings
│   │
│   ├── (admin)/                      # Admin routes group
│   │   ├── layout.tsx
│   │   ├── agents/                   # Agent management
│   │   ├── users/                    # User management
│   │   └── analytics/                # System analytics
│   │
│   ├── api/                          # API Routes
│   │   ├── auth/[...nextauth]/       # NextAuth routes
│   │   ├── agents/
│   │   │   └── [agentId]/
│   │   │       ├── analyze/          # Agent analysis
│   │   │       └── chat/             # Agent chat (streaming)
│   │   ├── documents/
│   │   │   ├── upload/               # Document upload
│   │   │   └── [documentId]/         # Document operations
│   │   ├── profile/                  # Medical profile API
│   │   ├── rag/
│   │   │   ├── embed/                # Generate embeddings
│   │   │   └── search/               # Vector search
│   │   └── health/                   # Health check
│   │
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   ├── error.tsx                     # Error boundary
│   ├── loading.tsx                   # Loading UI
│   └── not-found.tsx                 # 404 page
│
├── components/                       # React Components
│   ├── ui/                           # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   └── ...
│   │
│   ├── auth/                         # Auth components
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── auth-guard.tsx
│   │
│   ├── dashboard/                    # Dashboard components
│   │   ├── stats-card.tsx
│   │   ├── recent-analyses.tsx
│   │   └── quick-actions.tsx
│   │
│   ├── documents/                    # Document components
│   │   ├── document-upload.tsx
│   │   ├── document-list.tsx
│   │   └── document-viewer.tsx
│   │
│   ├── agents/                       # Agent components
│   │   ├── agent-card.tsx
│   │   ├── agent-chat.tsx
│   │   ├── agent-analysis.tsx
│   │   └── agent-selector.tsx
│   │
│   ├── profile/                      # Profile components
│   │   ├── medical-profile-form.tsx
│   │   └── profile-summary.tsx
│   │
│   └── shared/                       # Shared components
│       ├── layout/
│       │   ├── header.tsx
│       │   ├── sidebar.tsx
│       │   └── footer.tsx
│       ├── loading-spinner.tsx
│       └── error-message.tsx
│
├── lib/                              # Core Libraries
│   ├── ai/                           # AI/ML Core
│   │   ├── providers/                # AI SDK Providers
│   │   │   ├── google.ts             # Google AI config
│   │   │   ├── openai.ts             # OpenAI config
│   │   │   └── index.ts              # Export all
│   │   │
│   │   ├── core/                     # AI Core Functions
│   │   │   ├── generate.ts           # generateText wrapper
│   │   │   ├── stream.ts             # streamText wrapper
│   │   │   ├── structured.ts         # generateObject wrapper
│   │   │   └── embeddings.ts         # embed/embedMany wrapper
│   │   │
│   │   ├── agents/                   # Agent Logic
│   │   │   ├── analyze.ts            # Agent analysis
│   │   │   ├── chat.ts               # Agent chat
│   │   │   └── tools.ts              # Tool definitions
│   │   │
│   │   ├── rag/                      # RAG Implementation
│   │   │   ├── embed-document.ts     # Embed & store
│   │   │   ├── search.ts             # Vector search
│   │   │   └── context-builder.ts    # Build context
│   │   │
│   │   ├── medical/                  # Medical AI Logic
│   │   │   ├── document-parser.ts    # Parse medical docs
│   │   │   ├── vision.ts             # GPT-4 Vision
│   │   │   └── analysis.ts           # Medical analysis
│   │   │
│   │   └── utils/                    # AI Utils
│   │       ├── prompts.ts            # Prompt templates
│   │       ├── safety.ts             # Safety settings
│   │       └── error-handling.ts     # Error handlers
│   │
│   ├── db/                           # Database
│   │   ├── schema/                   # Drizzle Schemas
│   │   │   ├── users.ts              # User tables
│   │   │   ├── auth.ts               # Auth tables
│   │   │   ├── documents.ts          # Document tables
│   │   │   ├── agents.ts             # Agent config
│   │   │   ├── profiles.ts           # Medical profiles
│   │   │   ├── embeddings.ts         # Vector embeddings
│   │   │   └── index.ts              # Export all
│   │   │
│   │   ├── queries/                  # Database Queries
│   │   │   ├── users.ts
│   │   │   ├── documents.ts
│   │   │   ├── agents.ts
│   │   │   ├── embeddings.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── migrations/               # Drizzle Migrations
│   │   │   └── 0000_initial.sql
│   │   │
│   │   ├── client.ts                 # DB connection
│   │   └── seed.ts                   # Seed data
│   │
│   ├── auth/                         # Authentication
│   │   ├── config.ts                 # NextAuth config
│   │   ├── options.ts                # Auth options
│   │   ├── rbac.ts                   # RBAC logic
│   │   ├── session.ts                # Session utils
│   │   └── middleware.ts             # Auth middleware
│   │
│   ├── validators/                   # Zod Schemas
│   │   ├── auth.ts                   # Auth schemas
│   │   ├── profile.ts                # Profile schemas
│   │   ├── document.ts               # Document schemas
│   │   ├── agent.ts                  # Agent schemas
│   │   └── index.ts                  # Export all
│   │
│   └── utils/                        # Utilities
│       ├── formatting.ts             # Data formatting
│       ├── date.ts                   # Date utils
│       ├── file.ts                   # File utils
│       └── constants.ts              # Constants
│
├── types/                            # TypeScript Types
│   ├── auth.ts
│   ├── database.ts
│   ├── ai.ts
│   └── index.ts
│
├── hooks/                            # React Hooks
│   ├── use-auth.ts
│   ├── use-agents.ts
│   ├── use-documents.ts
│   └── use-profile.ts
│
├── config/                           # Configuration
│   ├── site.ts                       # Site config
│   ├── agents.ts                     # Default agents
│   └── env.ts                        # Env validation
│
├── public/                           # Static Assets
│   ├── images/
│   └── fonts/
│
├── scripts/                          # Utility Scripts
│   ├── seed-agents.ts                # Seed default agents
│   ├── migrate-data.ts               # Migration from v0
│   └── test-ai.ts                    # Test AI setup
│
├── tests/                            # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── drizzle.config.ts                 # Drizzle config
├── next.config.js                    # Next.js config
├── tailwind.config.ts                # Tailwind config
├── tsconfig.json                     # TypeScript config
├── .env.example                      # Environment template
├── .eslintrc.json                    # ESLint config
├── .prettierrc                       # Prettier config
├── package.json                      # Dependencies
├── pnpm-lock.yaml                    # Lock file
└── README.md                         # Documentation
```

---

## 🗄️ Schema do Banco de Dados (Drizzle ORM)

### Core Tables

#### 1. Users & Auth
```typescript
// lib/db/schema/users.ts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('patient'), // patient, doctor, admin
  emailVerified: timestamp('email_verified'),
  image: varchar('image', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: varchar('session_token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: varchar('token_type', { length: 50 }),
  scope: varchar('scope', { length: 500 }),
  idToken: text('id_token'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

#### 2. Medical Profiles
```typescript
// lib/db/schema/profiles.ts
export const medicalProfiles = pgTable('medical_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),

  // Basic Info
  age: integer('age'),
  gender: varchar('gender', { length: 50 }),
  height: real('height'), // cm
  weight: real('weight'), // kg

  // Vital Signs
  systolicPressure: integer('systolic_pressure'),
  diastolicPressure: integer('diastolic_pressure'),
  restingHeartRate: integer('resting_heart_rate'),

  // Lifestyle
  sleepHours: real('sleep_hours'),
  sleepQuality: integer('sleep_quality'), // 1-10
  sleepIssues: text('sleep_issues'),
  stressLevel: integer('stress_level'), // 1-10
  stressManagement: text('stress_management'),

  // Exercise
  exerciseTypes: json('exercise_types').$type<string[]>(),
  exerciseFrequency: integer('exercise_frequency'), // times per week
  exerciseDuration: integer('exercise_duration'), // minutes
  exerciseIntensity: varchar('exercise_intensity', { length: 50 }),
  physicalLimitations: text('physical_limitations'),

  // Nutrition
  currentDiet: text('current_diet'),
  dailyWaterIntake: real('daily_water_intake'), // liters

  // Health
  medicalConditions: json('medical_conditions').$type<string[]>(),
  medications: json('medications').$type<string[]>(),
  allergies: json('allergies').$type<string[]>(),
  surgeries: json('surgeries').$type<string[]>(),
  familyHistory: text('family_history'),

  // Habits
  smokingStatus: varchar('smoking_status', { length: 50 }),
  smokingDetails: text('smoking_details'),
  alcoholConsumption: varchar('alcohol_consumption', { length: 50 }),

  // Goals
  healthObjectives: text('health_objectives'),
  notes: text('notes'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

#### 3. Documents
```typescript
// lib/db/schema/documents.ts
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(), // pdf, image, etc
  fileSize: integer('file_size').notNull(), // bytes
  documentType: varchar('document_type', { length: 100 }).notNull(), // lab_report, bioimpedance, etc

  // Extracted Data
  extractedText: text('extracted_text'),
  structuredData: json('structured_data'),

  // Processing Status
  processingStatus: varchar('processing_status', { length: 50 }).notNull().default('pending'),
  processingError: text('processing_error'),

  // Storage (if using blob storage)
  storageUrl: varchar('storage_url', { length: 1000 }),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

#### 4. Embeddings (RAG)
```typescript
// lib/db/schema/embeddings.ts
import { vector } from 'drizzle-orm/pg-core'

export const documentEmbeddings = pgTable('document_embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Content
  content: text('content').notNull(), // The text chunk

  // Embedding Vector (pgvector)
  embedding: vector('embedding', { dimensions: 1536 }), // OpenAI ada-002 or text-embedding-3-small

  // Metadata for filtering
  chunkIndex: integer('chunk_index').notNull(),
  documentType: varchar('document_type', { length: 100 }),
  category: varchar('category', { length: 100 }), // Hematology, Lipids, etc

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Index for vector similarity search
// CREATE INDEX ON document_embeddings USING hnsw (embedding vector_cosine_ops);
```

#### 5. Health Agents
```typescript
// lib/db/schema/agents.ts
export const healthAgents = pgTable('health_agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentKey: varchar('agent_key', { length: 100 }).notNull().unique(), // integrativa, endocrinologia, etc

  name: varchar('name', { length: 255 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),

  // UI
  color: varchar('color', { length: 50 }).notNull(), // green, purple, etc
  icon: varchar('icon', { length: 100 }).notNull(), // lucide icon name

  // AI Configuration
  systemPrompt: text('system_prompt').notNull(),
  analysisPrompt: text('analysis_prompt').notNull(),

  modelName: varchar('model_name', { length: 100 }).notNull(), // gemini-2.5-flash
  modelConfig: json('model_config').notNull().$type<{
    temperature: number
    topP?: number
    topK?: number
    maxOutputTokens: number
  }>(),

  // Access Control
  allowedRoles: json('allowed_roles').$type<string[]>().notNull(), // ['patient', 'doctor', 'admin']

  // Status
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

#### 6. Analyses
```typescript
// lib/db/schema/analyses.ts
export const analyses = pgTable('analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').notNull().references(() => healthAgents.id),

  // Input
  documentIds: json('document_ids').$type<string[]>(),
  prompt: text('prompt'),
  medicalProfileSnapshot: json('medical_profile_snapshot'),

  // Output
  analysis: text('analysis').notNull(),

  // Metadata
  modelUsed: varchar('model_used', { length: 100 }),
  tokensUsed: integer('tokens_used'),
  processingTimeMs: integer('processing_time_ms'),
  ragUsed: boolean('rag_used').default(false),

  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').notNull().references(() => healthAgents.id),

  role: varchar('role', { length: 50 }).notNull(), // user, assistant
  content: text('content').notNull(),

  // Context
  analysisId: uuid('analysis_id').references(() => analyses.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

---

## 🧪 RAG Implementation (Local com PostgreSQL + pgvector)

### Setup

#### 1. Enable pgvector Extension
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### 2. Embedding Generation (AI SDK)
```typescript
// lib/ai/rag/embed-document.ts
import { embedMany } from 'ai'
import { openai } from '../providers'
import { db } from '@/lib/db/client'
import { documentEmbeddings } from '@/lib/db/schema'

export async function embedDocument(
  documentId: string,
  userId: string,
  content: string,
  metadata: {
    documentType: string
    category?: string
  }
) {
  // 1. Split content into chunks
  const chunks = splitIntoChunks(content, 500) // 500 tokens per chunk

  // 2. Generate embeddings for all chunks (batch)
  const result = await embedMany({
    model: openai.textEmbeddingModel('text-embedding-3-small'),
    values: chunks,
  })

  // 3. Store in database
  const embeddings = chunks.map((chunk, index) => ({
    documentId,
    userId,
    content: chunk,
    embedding: result.embeddings[index],
    chunkIndex: index,
    documentType: metadata.documentType,
    category: metadata.category,
  }))

  await db.insert(documentEmbeddings).values(embeddings)

  return {
    chunksCreated: chunks.length,
    tokensUsed: result.usage?.tokens || 0,
  }
}

function splitIntoChunks(text: string, maxTokens: number): string[] {
  // Simple implementation - pode melhorar com semantic chunking
  const sentences = text.split(/[.!?]+/)
  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    const estimatedTokens = (currentChunk + sentence).length / 4

    if (estimatedTokens > maxTokens && currentChunk) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += ' ' + sentence
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }

  return chunks.filter(c => c.length > 50) // Filter very short chunks
}
```

#### 3. Vector Search (Similarity Search)
```typescript
// lib/ai/rag/search.ts
import { embed } from 'ai'
import { openai } from '../providers'
import { db } from '@/lib/db/client'
import { documentEmbeddings } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export async function searchSimilarContent(
  query: string,
  userId: string,
  options: {
    topK?: number
    documentIds?: string[]
    category?: string
  } = {}
) {
  const { topK = 10, documentIds, category } = options

  // 1. Generate embedding for query
  const { embedding } = await embed({
    model: openai.textEmbeddingModel('text-embedding-3-small'),
    value: query,
  })

  // 2. Vector similarity search using pgvector
  const results = await db
    .select({
      id: documentEmbeddings.id,
      content: documentEmbeddings.content,
      documentId: documentEmbeddings.documentId,
      category: documentEmbeddings.category,
      similarity: sql<number>`1 - (embedding <=> ${JSON.stringify(embedding)}::vector)`,
    })
    .from(documentEmbeddings)
    .where(
      sql`${documentEmbeddings.userId} = ${userId}
          ${documentIds ? sql`AND ${documentEmbeddings.documentId} = ANY(${documentIds})` : sql``}
          ${category ? sql`AND ${documentEmbeddings.category} = ${category}` : sql``}`
    )
    .orderBy(sql`embedding <=> ${JSON.stringify(embedding)}::vector`)
    .limit(topK)

  return results
}
```

#### 4. Context Builder
```typescript
// lib/ai/rag/context-builder.ts
import { searchSimilarContent } from './search'

export async function buildRAGContext(
  query: string,
  userId: string,
  options: {
    documentIds?: string[]
    agentSpecialty?: string
  } = {}
): Promise<string> {
  const results = await searchSimilarContent(query, userId, {
    topK: 20,
    documentIds: options.documentIds,
  })

  if (results.length === 0) {
    return 'Nenhum contexto específico encontrado nos documentos do paciente.'
  }

  const context = results
    .filter(r => r.similarity > 0.7) // Only high similarity
    .map((r, index) => {
      return `**Documento ${index + 1}** (Similaridade: ${(r.similarity * 100).toFixed(1)}%)
${r.content}
`
    })
    .join('\n\n')

  return `=== CONTEXTO DOS DOCUMENTOS MÉDICOS DO PACIENTE ===

${context}

---
Este contexto foi recuperado automaticamente dos documentos médicos do paciente com base na similaridade semântica com a análise solicitada.`
}
```

---

## 🚀 Plano de Implementação em Fases

### **FASE 0: Setup Inicial** (1-2 dias)

#### Objetivos
- [ ] Criar novo projeto limpo
- [ ] Configurar ambiente de desenvolvimento
- [ ] Setup básico de Next.js + TypeScript

#### Tarefas
```bash
# 1. Criar novo diretório
mkdir medical-ai-v2
cd medical-ai-v2

# 2. Inicializar Next.js 15
pnpm create next-app@latest . --typescript --tailwind --app --use-pnpm

# 3. Instalar dependências core
pnpm add ai @ai-sdk/google @ai-sdk/openai zod drizzle-orm pg
pnpm add -D drizzle-kit @types/pg

# 4. Instalar shadcn/ui
pnpm dlx shadcn@latest init

# 5. Configurar Drizzle
# Criar drizzle.config.ts
# Criar lib/db/schema/
# Criar lib/db/client.ts

# 6. Configurar variáveis de ambiente
cp .env.example .env.local
```

#### Deliverables
- ✅ Projeto Next.js 15 funcionando
- ✅ TypeScript strict configurado
- ✅ Tailwind + shadcn/ui setup
- ✅ Drizzle ORM configurado
- ✅ Estrutura de diretórios criada

---

### **FASE 1: Database & Auth** (3-4 dias)

#### Objetivos
- [ ] Schema completo do banco
- [ ] Migrations com Drizzle
- [ ] NextAuth v5 configurado
- [ ] RBAC básico

#### Tarefas

1. **Database Schema**
```typescript
// lib/db/schema/index.ts - Criar todos os schemas
// users, sessions, accounts
// medicalProfiles
// documents
// documentEmbeddings (com pgvector)
// healthAgents
// analyses
// chatMessages
```

2. **Migrations**
```bash
# Gerar migration
pnpm drizzle-kit generate

# Aplicar migration
pnpm drizzle-kit migrate
```

3. **Seed Data**
```typescript
// scripts/seed-agents.ts
// Criar agentes padrão:
// - Medicina Integrativa
// - Endocrinologia Funcional
// - Metabolismo e Nutrição
// - Fisiologia do Exercício
```

4. **NextAuth v5 Setup**
```typescript
// lib/auth/config.ts
// app/api/auth/[...nextauth]/route.ts
// Configurar providers (credentials, Google)
// RBAC middleware
```

#### Deliverables
- ✅ Database schema completo
- ✅ pgvector extension habilitada
- ✅ Migrations funcionando
- ✅ 4 agentes padrão criados
- ✅ NextAuth funcionando
- ✅ Login/Register básico

---

### **FASE 2: AI Core + RAG** (4-5 dias)

#### Objetivos
- [ ] Vercel AI SDK configurado
- [ ] Embeddings funcionando
- [ ] Vector search operacional
- [ ] RAG pipeline completo

#### Tarefas

1. **AI Providers Setup**
```typescript
// lib/ai/providers/google.ts
// lib/ai/providers/openai.ts
// Configurar modelos
// Safety settings
```

2. **Core AI Functions**
```typescript
// lib/ai/core/generate.ts - generateText wrapper
// lib/ai/core/stream.ts - streamText wrapper
// lib/ai/core/structured.ts - generateObject wrapper
// lib/ai/core/embeddings.ts - embed/embedMany wrapper
```

3. **RAG Implementation**
```typescript
// lib/ai/rag/embed-document.ts
// lib/ai/rag/search.ts (vector search)
// lib/ai/rag/context-builder.ts
```

4. **Test Scripts**
```typescript
// scripts/test-ai.ts
// Testar todas as funções AI
// Testar embeddings + search
```

#### Deliverables
- ✅ AI SDK funcionando com Google AI + OpenAI
- ✅ Embeddings sendo gerados
- ✅ Vector search retornando resultados
- ✅ RAG context builder funcionando
- ✅ Testes passando

---

### **FASE 3: Document Processing** (3-4 dias)

#### Objetivos
- [ ] Upload de documentos
- [ ] Processamento de PDFs
- [ ] GPT-4 Vision para imagens
- [ ] Structured output de dados médicos
- [ ] Embedding automático

#### Tarefas

1. **Upload API**
```typescript
// app/api/documents/upload/route.ts
// Validação de arquivo
// Storage (filesystem ou Vercel Blob)
// Queue processing job
```

2. **Document Parser**
```typescript
// lib/ai/medical/document-parser.ts
// PDF text extraction (pdf-parse)
// Image analysis (GPT-4 Vision via AI SDK)
// Structured extraction com generateObject
```

3. **Auto Embedding**
```typescript
// Após processamento, automaticamente:
// 1. Chunking do conteúdo
// 2. Gerar embeddings
// 3. Salvar no DB
```

4. **UI Components**
```typescript
// components/documents/document-upload.tsx
// components/documents/document-list.tsx
// components/documents/document-viewer.tsx
```

#### Deliverables
- ✅ Upload de PDF/Imagem funcionando
- ✅ Processamento automático
- ✅ Dados estruturados extraídos
- ✅ Embeddings gerados automaticamente
- ✅ UI para gerenciar documentos

---

### **FASE 4: Medical Profile** (2-3 dias)

#### Objetivos
- [ ] Formulário de perfil médico completo
- [ ] Validação com Zod
- [ ] CRUD de perfil
- [ ] UI responsiva

#### Tarefas

1. **Zod Schemas**
```typescript
// lib/validators/profile.ts
// Schema completo do perfil médico
// Validação de todos os campos
```

2. **API Routes**
```typescript
// app/api/profile/route.ts
// GET - buscar perfil
// POST - criar perfil
// PUT - atualizar perfil
```

3. **UI Components**
```typescript
// components/profile/medical-profile-form.tsx
// React Hook Form + Zod
// Multi-step form (opcional)
// components/profile/profile-summary.tsx
```

#### Deliverables
- ✅ Perfil médico completo salvando no DB
- ✅ Validação robusta
- ✅ UI intuitiva e responsiva
- ✅ Edição funcionando

---

### **FASE 5: Agents System** (5-6 dias)

#### Objetivos
- [ ] Análise com agentes
- [ ] Chat com agentes
- [ ] Tool calling (opcional)
- [ ] Streaming funcionando
- [ ] Cache de análises

#### Tarefas

1. **Agent Analysis**
```typescript
// lib/ai/agents/analyze.ts
// app/api/agents/[agentId]/analyze/route.ts
// Buscar RAG context
// Gerar análise com agente
// Salvar resultado
```

2. **Agent Chat (Streaming)**
```typescript
// lib/ai/agents/chat.ts
// app/api/agents/[agentId]/chat/route.ts
// streamText com RAG context
// Tool calling para buscar contexto
```

3. **UI Components**
```typescript
// components/agents/agent-card.tsx
// components/agents/agent-selector.tsx
// components/agents/agent-analysis.tsx (display)
// components/agents/agent-chat.tsx (streaming chat)
```

4. **Cache System**
```typescript
// Implementar cache de análises
// Verificar se já existe análise recente
// Retornar cached se disponível
```

#### Deliverables
- ✅ 4 agentes funcionando
- ✅ Análises sendo geradas
- ✅ Chat com streaming real-time
- ✅ RAG context sendo usado
- ✅ Cache funcionando
- ✅ UI completa de agentes

---

### **FASE 6: Dashboard & History** (3-4 dias)

#### Objetivos
- [ ] Dashboard principal
- [ ] Histórico de análises
- [ ] Stats e métricas
- [ ] Navegação completa

#### Tarefas

1. **Dashboard UI**
```typescript
// app/(dashboard)/page.tsx
// components/dashboard/stats-card.tsx
// components/dashboard/recent-analyses.tsx
// components/dashboard/quick-actions.tsx
```

2. **History**
```typescript
// app/(dashboard)/history/page.tsx
// app/api/analyses/route.ts (list)
// Filtros (por agente, data, etc)
// Paginação
```

3. **Layout Components**
```typescript
// components/shared/layout/header.tsx
// components/shared/layout/sidebar.tsx
// Navigation menu
```

#### Deliverables
- ✅ Dashboard funcional
- ✅ Histórico completo
- ✅ Navegação intuitiva
- ✅ Stats básicas

---

### **FASE 7: Admin Panel** (3-4 dias)

#### Objetivos
- [ ] Gerenciamento de agentes
- [ ] Gerenciamento de usuários
- [ ] Analytics básicas
- [ ] Logs de sistema

#### Tarefas

1. **Agent Management**
```typescript
// app/(admin)/agents/page.tsx
// CRUD completo de agentes
// Testar configurações
// Ativar/desativar
```

2. **User Management**
```typescript
// app/(admin)/users/page.tsx
// Lista de usuários
// Gerenciar roles
// Ver atividade
```

3. **Analytics**
```typescript
// app/(admin)/analytics/page.tsx
// Uso por agente
// Documentos processados
// Tokens consumidos
```

#### Deliverables
- ✅ Admin pode gerenciar agentes
- ✅ Admin pode gerenciar usuários
- ✅ Analytics básicas funcionando
- ✅ Proteção RBAC

---

### **FASE 8: Testing & Polish** (3-4 dias)

#### Objetivos
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Error handling robusto
- [ ] Loading states
- [ ] Polish geral

#### Tarefas

1. **Tests Setup**
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

2. **Unit Tests**
```typescript
// tests/unit/ai/embeddings.test.ts
// tests/unit/ai/rag-search.test.ts
// tests/unit/validators/profile.test.ts
```

3. **Integration Tests**
```typescript
// tests/integration/agents/analyze.test.ts
// tests/integration/documents/upload.test.ts
```

4. **Error Handling**
```typescript
// Error boundaries
// API error responses
// User-friendly messages
// Retry logic
```

5. **Loading States**
```typescript
// Skeletons
// Spinners
// Progress indicators
```

#### Deliverables
- ✅ >60% code coverage
- ✅ Error handling robusto
- ✅ Loading states em toda UI
- ✅ Polish e refinamentos

---

### **FASE 9: Migration & Deployment** (2-3 dias)

#### Objetivos
- [ ] Migração de dados da v0
- [ ] Setup Vercel
- [ ] CI/CD pipeline
- [ ] Monitoramento

#### Tarefas

1. **Data Migration Script**
```typescript
// scripts/migrate-from-v0.ts
// Migrar usuários
// Migrar documentos
// Migrar perfis médicos
// Re-gerar embeddings
```

2. **Vercel Setup**
```bash
# Connect to Vercel
vercel

# Setup Vercel Postgres
vercel postgres create

# Configure env vars
```

3. **CI/CD**
```yaml
# .github/workflows/ci.yml
# Linting
# Type checking
# Tests
# Build
```

4. **Monitoring**
```typescript
// Vercel Analytics
// Error tracking (Sentry opcional)
// Performance monitoring
```

#### Deliverables
- ✅ Dados migrados da v0
- ✅ Deploy em production
- ✅ CI/CD funcionando
- ✅ Monitoramento ativo

---

## 📊 Migração de Dados da App Atual

### Script de Migração

```typescript
// scripts/migrate-from-v0.ts
import { Pool } from 'pg'
import { db as newDb } from '@/lib/db/client'
import { users, documents, medicalProfiles, healthAgents } from '@/lib/db/schema'
import { embedDocument } from '@/lib/ai/rag/embed-document'

const oldDb = new Pool({
  connectionString: process.env.OLD_DATABASE_URL // doctor_v0
})

const newDbPool = new Pool({
  connectionString: process.env.DATABASE_URL // medical-ai-v2
})

async function migrateUsers() {
  console.log('🔄 Migrating users...')

  const oldUsers = await oldDb.query('SELECT * FROM users')

  for (const oldUser of oldUsers.rows) {
    await newDb.insert(users).values({
      id: oldUser.id,
      email: oldUser.email,
      name: oldUser.name,
      passwordHash: oldUser.password_hash,
      role: oldUser.role || 'patient',
      emailVerified: oldUser.email_verified,
      createdAt: oldUser.created_at,
      updatedAt: oldUser.updated_at,
    })
  }

  console.log(`✅ Migrated ${oldUsers.rows.length} users`)
}

async function migrateMedicalProfiles() {
  console.log('🔄 Migrating medical profiles...')

  const oldProfiles = await oldDb.query('SELECT * FROM medical_profiles')

  for (const oldProfile of oldProfiles.rows) {
    await newDb.insert(medicalProfiles).values({
      id: oldProfile.id,
      userId: oldProfile.user_id,
      age: oldProfile.age,
      gender: oldProfile.gender,
      height: oldProfile.height,
      weight: oldProfile.weight,
      // ... map all fields
      createdAt: oldProfile.created_at,
      updatedAt: oldProfile.updated_at,
    })
  }

  console.log(`✅ Migrated ${oldProfiles.rows.length} profiles`)
}

async function migrateDocuments() {
  console.log('🔄 Migrating documents...')

  const oldDocs = await oldDb.query('SELECT * FROM documents')

  for (const oldDoc of oldDocs.rows) {
    // Insert document
    const newDocId = await newDb.insert(documents).values({
      userId: oldDoc.user_id,
      fileName: oldDoc.file_name,
      fileType: oldDoc.file_type,
      fileSize: oldDoc.file_size,
      documentType: oldDoc.document_type,
      extractedText: oldDoc.extracted_text,
      structuredData: oldDoc.structured_data,
      processingStatus: 'completed',
      createdAt: oldDoc.created_at,
      updatedAt: oldDoc.updated_at,
    }).returning({ id: documents.id })

    // Re-generate embeddings with new RAG system
    if (oldDoc.extracted_text) {
      console.log(`  📝 Embedding document ${oldDoc.file_name}...`)
      await embedDocument(
        newDocId[0].id,
        oldDoc.user_id,
        oldDoc.extracted_text,
        {
          documentType: oldDoc.document_type,
        }
      )
    }
  }

  console.log(`✅ Migrated ${oldDocs.rows.length} documents`)
}

async function migrateHealthAgents() {
  console.log('🔄 Migrating health agents...')

  const oldAgents = await oldDb.query('SELECT * FROM health_agents')

  for (const oldAgent of oldAgents.rows) {
    await newDb.insert(healthAgents).values({
      agentKey: oldAgent.agent_key,
      name: oldAgent.name,
      title: oldAgent.title,
      description: oldAgent.description,
      color: oldAgent.color,
      icon: oldAgent.icon,
      systemPrompt: oldAgent.system_prompt,
      analysisPrompt: oldAgent.analysis_prompt,
      modelName: oldAgent.model_name,
      modelConfig: oldAgent.model_config,
      allowedRoles: oldAgent.allowed_roles,
      isActive: oldAgent.is_active,
      displayOrder: oldAgent.display_order,
      createdAt: oldAgent.created_at,
      updatedAt: oldAgent.updated_at,
    })
  }

  console.log(`✅ Migrated ${oldAgents.rows.length} agents`)
}

async function main() {
  console.log('🚀 Starting migration from doctor_v0 to medical-ai-v2...\n')

  try {
    await migrateUsers()
    await migrateMedicalProfiles()
    await migrateHealthAgents()
    await migrateDocuments() // Last (re-generates embeddings)

    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await oldDb.end()
    await newDbPool.end()
  }
}

main()
```

**Executar:**
```bash
# Configurar variáveis
export OLD_DATABASE_URL="postgresql://..." # doctor_v0 DB
export DATABASE_URL="postgresql://..." # medical-ai-v2 DB

# Executar migration
pnpm tsx scripts/migrate-from-v0.ts
```

---

## ✅ Checklist Completo

### Preparação
- [ ] Criar repositório Git para `medical-ai-v2`
- [ ] Inicializar Next.js 15 + TypeScript
- [ ] Instalar todas as dependências
- [ ] Configurar .env.local

### Database
- [ ] Criar schema Drizzle completo
- [ ] Habilitar extensão pgvector
- [ ] Gerar e aplicar migrations
- [ ] Seed de agentes padrão
- [ ] Testar todas as queries

### Authentication
- [ ] NextAuth v5 configurado
- [ ] Login/Register funcionando
- [ ] RBAC implementado
- [ ] Session management
- [ ] Password reset (opcional)

### AI & RAG
- [ ] Providers configurados (Google AI + OpenAI)
- [ ] generateText funcionando
- [ ] streamText funcionando
- [ ] generateObject funcionando
- [ ] Embeddings funcionando
- [ ] Vector search funcionando
- [ ] RAG context builder funcionando

### Documents
- [ ] Upload de documentos
- [ ] Processamento de PDFs
- [ ] GPT-4 Vision para imagens
- [ ] Structured extraction
- [ ] Auto-embedding após processamento
- [ ] UI de gerenciamento

### Medical Profile
- [ ] Formulário completo
- [ ] Validação Zod
- [ ] CRUD completo
- [ ] UI responsiva

### Agents
- [ ] 4 agentes criados no DB
- [ ] Análise funcionando
- [ ] Chat com streaming
- [ ] RAG integration
- [ ] Cache de análises
- [ ] UI completa

### Dashboard
- [ ] Dashboard principal
- [ ] Stats cards
- [ ] Recent analyses
- [ ] Quick actions
- [ ] Navigation menu

### History
- [ ] Lista de análises
- [ ] Filtros
- [ ] Paginação
- [ ] Detalhes de análise

### Admin
- [ ] Gerenciamento de agentes
- [ ] Gerenciamento de usuários
- [ ] Analytics
- [ ] Proteção RBAC

### Testing
- [ ] Tests unitários (>60% coverage)
- [ ] Tests de integração
- [ ] Error handling robusto
- [ ] Loading states

### Migration
- [ ] Script de migração testado
- [ ] Usuários migrados
- [ ] Perfis migrados
- [ ] Documentos migrados
- [ ] Embeddings re-gerados

### Deployment
- [ ] Vercel setup
- [ ] Vercel Postgres
- [ ] Env vars configuradas
- [ ] CI/CD pipeline
- [ ] Deploy em production
- [ ] Monitoramento ativo

### Documentation
- [ ] README.md completo
- [ ] API documentation
- [ ] Deployment guide
- [ ] Migration guide

---

## 💰 Estimativa de Custos (Mensal)

### Nova Arquitetura (medical-ai-v2)

| Serviço | Custo Estimado | Detalhes |
|---------|---------------|----------|
| **Vercel Hosting** | $20/mês | Pro plan |
| **Vercel Postgres** | $20/mês | 512MB, 60h compute |
| **Google AI (Gemini)** | $10-30/mês | ~100k tokens/dia |
| **OpenAI (GPT-4 Vision + Embeddings)** | $20-40/mês | ~50 documents/dia |
| **Total** | **$70-110/mês** | |

### Arquitetura Antiga (doctor_v0)

| Serviço | Custo Estimado | Detalhes |
|---------|---------------|----------|
| Vercel Hosting | $20/mês | |
| PostgreSQL | $20/mês | |
| Google AI | $10-30/mês | |
| OpenAI | $20-40/mês | |
| **Vertex AI RAG** | **$150-300/mês** | ❌ CARO |
| **Total** | **$220-410/mês** | |

**Economia Estimada: $150-300/mês (~70% redução)** 🎉

---

## 📚 Documentação e Recursos

### Documentação Técnica
- [Vercel AI SDK Docs](https://ai-sdk.dev/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs)
- [NextAuth v5 Docs](https://authjs.dev/)
- [pgvector GitHub](https://github.com/pgvector/pgvector)

### Referências de Código
- [Vercel AI SDK Knowledge Base Example](https://github.com/vercel-labs/ai-sdk-preview-internal-knowledge-base)
- [Next.js AI Chatbot](https://github.com/vercel/ai-chatbot)
- [shadcn/ui](https://ui.shadcn.com/)

### App Atual (Referência)
- **Repo:** `C:\projetos\doctor_v0`
- **Não modificar** - usar apenas como referência
- **Features para replicar:** Ver seção "O que Manter"

---

## 🎯 Próximos Passos Imediatos

1. **Revisar este planejamento** ✅
2. **Criar repositório Git** para `medical-ai-v2`
3. **Executar FASE 0** - Setup inicial (1-2 dias)
4. **Executar FASE 1** - Database & Auth (3-4 dias)
5. **Executar FASE 2** - AI Core + RAG (4-5 dias)
6. **Continuar fases sequencialmente**

---

## 📝 Notas Importantes

### Decisões Arquiteturais Chave

1. **Por que Drizzle ORM?**
   - Type-safe, performático
   - Migrations declarativas
   - Melhor DX que SQL direto
   - Suporta pgvector

2. **Por que PostgreSQL local RAG vs Vertex AI RAG?**
   - **Custo:** 70% mais barato
   - **Controle:** Total controle sobre dados
   - **Privacy:** Dados não saem do DB
   - **Performance:** Queries locais mais rápidas
   - **Simplicidade:** Menos serviços externos

3. **Por que Vercel AI SDK?**
   - Unifica todos os providers
   - Type-safe e moderno
   - Streaming nativo
   - Tool calling built-in
   - Observabilidade integrada
   - Fácil trocar providers

4. **Por que Next.js 15?**
   - Latest features
   - App Router maduro
   - Server Actions
   - Otimizações de performance
   - Vercel integration

### Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Migração de dados falhar | Média | Alto | Testar em staging, backup completo |
| Performance RAG local inferior | Baixa | Médio | Índices HNSW otimizados |
| Custos subirem muito | Baixa | Médio | Monitoramento de tokens |
| Perder features da v0 | Média | Alto | Checklist completo, QA rigoroso |
| Prazo estourar | Média | Baixo | Fases incrementais, MVP primeiro |

---

**Este documento é um plano vivo e será atualizado conforme o desenvolvimento avança.**

**Criado por:** Claude (Anthropic)
**Data:** 01/11/2025
**Versão:** 1.0

---

Pronto para começar! 🚀
