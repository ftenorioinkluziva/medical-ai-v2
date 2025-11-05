# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Medical AI V2 is a Next.js 16 healthcare analysis platform that uses AI agents to analyze medical documents (PDFs, images) and provide specialized health insights. The application features:

- Multi-agent medical analysis system (Medicina Integrativa, Endocrinologia, Nutrição, Exercício)
- Document processing with OCR (PDFs) and Vision AI (images)
- Medical document structuring using LLMs
- RAG (Retrieval-Augmented Generation) for knowledge-enhanced analysis
- Role-based access control (patient/doctor/admin)
- NextAuth v5 for authentication with credentials provider

## Development Commands

### Core Commands
```bash
pnpm dev              # Start development server (http://localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### Database Commands
```bash
pnpm db:generate      # Generate Drizzle migrations from schema changes
pnpm db:migrate       # Run migrations against database
pnpm db:push          # Push schema changes directly to DB (development)
pnpm db:studio        # Open Drizzle Studio (database GUI)
pnpm db:seed          # Seed default health agents
pnpm db:setup         # Complete setup: generate + migrate + seed
```

**Database Workflow:**
1. Modify schema files in `lib/db/schema/`
2. Run `pnpm db:generate` to create migration files
3. Run `pnpm db:migrate` to apply migrations
4. For fresh setups, use `pnpm db:setup`

## Architecture

### Multi-Agent System

The core architecture is built around specialized health agents that analyze medical data from different perspectives. Each agent is:

- **Stored in database** (`health_agents` table) - not hardcoded
- **Configurable** - has own system prompt, analysis prompt, and model config
- **Specialized** - Medicina Integrativa, Endocrinologia, Nutrição, Exercício
- **Loaded from DB** - agents are queried at runtime, not imported

**Agent Configuration:**
- `systemPrompt`: Defines agent's expertise and role
- `analysisPrompt`: Template for structured analysis output
- `modelName`: AI model to use (default: `gemini-2.5-flash`)
- `modelConfig`: Temperature, topP, topK, maxOutputTokens

**Agent Analysis Flow:**
1. Agent selected by user → `lib/ai/agents/analyze.ts::analyzeWithAgent()`
2. Contexts assembled (documents, profile, RAG knowledge)
3. Prompts combined: systemPrompt + analysisPrompt + contexts
4. AI generates analysis → `lib/ai/core/generate.ts::generateMedicalAnalysis()`
5. Results stored in `analyses` table

### Document Processing Pipeline

**Location:** `lib/documents/processor.ts::processDocument()`

**Flow:**
1. **Extract Text**
   - PDFs → `pdf-parse` library (`lib/documents/pdf-processor.ts`)
   - Images → Google Vision API (`lib/documents/vision-processor.ts`)
2. **Structure Data** (optional)
   - LLM analyzes extracted text → `lib/documents/structuring.ts::structureMedicalDocument()`
   - Extracts structured modules (patient data, exams, diagnoses, etc.)
   - Stores as JSON in `documents.structuredData` column
3. **Save to Database**
   - Document metadata + extracted text stored
   - Status immediately set to `completed` (no async processing)

**Note:** NO chunking or embeddings in document processor. RAG/embeddings only used for knowledge base articles.

### Authentication & Authorization

**NextAuth v5 Configuration:** `lib/auth/config.ts`
- JWT strategy (serverless-compatible)
- Credentials provider with bcrypt password hashing
- Session contains: `user.id`, `user.role`, `user.email`, `user.name`

**Middleware:** `middleware.ts`
- Public routes: `/`, `/login`, `/register`
- Protected routes: `/dashboard/*`, `/admin/*`, etc.
- Admin routes require `role: 'admin'`
- Unauthenticated users → redirect to `/login?callbackUrl=...`

**RBAC:** `lib/auth/rbac.ts`
- Three roles: `patient`, `doctor`, `admin`
- Each agent has `allowedRoles` array
- Check user role against agent's allowed roles before analysis

### Database Schema

**Location:** `lib/db/schema/` (Drizzle ORM with PostgreSQL)

**Key Tables:**
- `users` - User accounts with role (patient/doctor/admin)
- `profiles` - Extended medical profiles (height, weight, allergies, etc.)
- `documents` - Uploaded medical documents with `extractedText` and `structuredData`
- `health_agents` - AI agent configurations (prompts, models, display info)
- `analyses` - Analysis results linking user + agent + document
- `knowledge_base` - Medical articles for RAG
- `knowledge_embeddings` - Vector embeddings for knowledge base (pgvector)
- `recommendations` - Personalized health recommendations
- `weekly_plans` - Generated weekly health plans

**Import Pattern:** Always import from `@/lib/db/schema` (index.ts), never from individual files.

### AI Provider Architecture

**Location:** `lib/ai/providers/`

**Current Providers:**
- Google AI (Gemini) - Primary provider for analysis (`lib/ai/providers/google.ts`)
- OpenAI - Used for embeddings and Vision API (`lib/ai/providers/openai.ts`)

**Provider Selection:**
- Analysis: Uses agent's `modelName` (typically Gemini)
- Embeddings: Uses OpenAI `text-embedding-3-small`
- Vision: Uses Google Vision API for OCR

**Vercel AI SDK:**
- All AI calls use Vercel AI SDK (`ai` package)
- Text generation: `generateText()` from `ai`
- Embeddings: `embed()` / `embedMany()` from `ai`

### RAG System

**Location:** `lib/ai/rag/`

**Components:**
- `vector-search.ts` - Similarity search using pgvector
- `context-builder.ts` - Assembles context from search results
- Used ONLY for knowledge base articles, NOT for user documents

**RAG Flow for Analysis:**
1. Extract key medical terms from document
2. Search knowledge base for relevant articles → `searchSimilarDocuments()`
3. Build context string → `buildRAGContext()`
4. Include in agent's analysis prompt

### Route Structure

**App Router (Next.js 16):**
- `app/(auth)/` - Login/register pages
- `app/(dashboard)/` - Protected dashboard routes with shared layout
- `app/api/` - API routes for all backend operations

**Key API Routes:**
- `/api/documents/upload` - Upload and process documents
- `/api/agents/[agentId]/analyze` - Trigger agent analysis
- `/api/analyses/*` - Fetch analysis history and comparisons
- `/api/recommendations/*` - Generate and fetch recommendations
- `/api/weekly-plan/*` - Generate weekly health plans
- `/api/admin/*` - Admin management (users, agents, knowledge base)

### Environment Variables

**Required (.env.local):**
```bash
DATABASE_URL="postgresql://..."
GOOGLE_AI_API_KEY="..."      # For Gemini models
OPENAI_API_KEY="..."         # For embeddings and Vision
NEXTAUTH_SECRET="..."        # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

## TypeScript Configuration

- **Strict mode enabled:** `strict: true`, `strictNullChecks: true`, `noImplicitAny: true`
- **Path alias:** `@/*` maps to project root
- **Module resolution:** `bundler` (Next.js 16 requirement)
- **React compiler enabled** in next.config.ts

## Important Patterns

### 1. Importing Database Client
```typescript
import { db } from '@/lib/db/client'
import { users, documents, healthAgents } from '@/lib/db/schema'
```

### 2. Getting Current Session in Server Components
```typescript
import { auth } from '@/lib/auth/config'

const session = await auth()
if (!session?.user?.id) {
  // Handle unauthenticated
}
```

### 3. Agent Analysis Pattern
```typescript
import { analyzeWithAgent } from '@/lib/ai/agents/analyze'

const result = await analyzeWithAgent(agent, analysisPrompt, {
  documentsContext: extractedText,
  medicalProfileContext: profileData,
  knowledgeContext: ragContext,
})
```

### 4. Document Processing Pattern
```typescript
import { processDocument } from '@/lib/documents/processor'

const result = await processDocument(
  fileBuffer,
  fileName,
  userId,
  { documentType: 'medical_report', structureData: true }
)
```

## UI Components

**Shadcn UI:** All UI components in `components/` directory
- Uses Radix UI primitives
- Tailwind CSS v4 for styling
- Icons from `lucide-react`
- Color scheme per agent (green/purple/orange/blue)

## Testing

**Test Directories:**
- `test/` - Unit tests
- `tests/` - Integration tests

Note: Test infrastructure exists but specific test commands not defined in package.json.

## Medical Disclaimer

All AI-generated analyses include disclaimer: "Esta análise é gerada por IA para fins educacionais e NÃO substitui consulta médica profissional."
