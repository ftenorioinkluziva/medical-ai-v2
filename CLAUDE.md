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
- **Fully Dynamic** - system adapts automatically to any number/type of agents
- **Loaded from DB** - agents are queried at runtime, not imported

**Agent Configuration:**
- `systemPrompt`: Defines agent's expertise and role
- `analysisPrompt`: Template for structured analysis output
- `modelName`: AI model to use (default: `gemini-2.5-flash`)
- `modelConfig`: Temperature, topP, topK, maxOutputTokens
- `analysisRole`: `foundation` | `specialized` | `none`
- `analysisOrder`: Order of execution within role group (nullable)

**Agent Roles:**

1. **Foundation Agents** (`analysisRole: 'foundation'`)
   - Execute **sequentially** (one after another)
   - Provide base context for specialized agents
   - Example: Medicina Integrativa, Endocrinologia
   - Order matters: lower `analysisOrder` = executes first

2. **Specialized Agents** (`analysisRole: 'specialized'`)
   - Execute **in parallel** (all at once)
   - Receive context from all foundation agents
   - Example: Nutrição, Exercício, Cardiologia, Suplementação
   - Order only affects presentation, not execution

3. **Standalone Agents** (`analysisRole: 'none'`)
   - Not part of complete analysis workflow
   - Can still be used for individual analyses

**Agent Analysis Flow:**
1. Agent selected by user → `lib/ai/agents/analyze.ts::analyzeWithAgent()`
2. Contexts assembled (documents, profile, RAG knowledge)
3. Prompts combined: systemPrompt + analysisPrompt + contexts
4. AI generates analysis → `lib/ai/core/generate.ts::generateMedicalAnalysis()`
5. Results stored in `analyses` table

**Complete Analysis Workflow:** `lib/ai/orchestrator/complete-analysis.ts`
1. **Validation**: Check ≥1 foundation AND ≥1 specialized agents exist
2. **Phase 1 - Foundation**: Execute foundation agents sequentially
3. **Phase 2 - Specialized**: Execute specialized agents in parallel
4. **Phase 3 - Synthesis**: Consolidate all analyses into unified summary
5. **Phase 4 - Products**: Generate recommendations + weekly plan

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
- `health_agents` - AI agent configurations (prompts, models, display info, roles)
- `analyses` - Analysis results linking user + agent + document
- `complete_analyses` - Multi-agent workflow results with dynamic `analysisIds` array
- `knowledge_base` - Medical articles for RAG
- `knowledge_embeddings` - Vector embeddings for knowledge base (pgvector)
- `recommendations` - Personalized health recommendations
- `weekly_plans` - Generated weekly health plans

**Import Pattern:** Always import from `@/lib/db/schema` (index.ts), never from individual files.

### AI Provider Architecture

**Location:** `lib/ai/providers/`

**Primary Provider: Google AI (Gemini)**
- All AI operations use Google AI by default (`lib/ai/providers/google.ts`)
- Text generation: Gemini 2.5 Flash
- Embeddings: `text-embedding-004` (50-60% cheaper than OpenAI)
- Vision/OCR: Gemini 2.5 Flash multimodal
- Document structuring: Gemini 2.5 Flash with native structured output

**Legacy Provider: OpenAI (Optional)**
- Available for backward compatibility (`lib/ai/providers/openai.ts`)
- Requires `OPENAI_API_KEY` environment variable
- Can be used by explicitly setting `provider: 'openai'` in function calls
- Not required for system operation

**Provider Selection:**
- Analysis: Uses agent's `modelName` (default: `gemini-2.5-flash`)
- Embeddings: Google `text-embedding-004` (default)
- Vision: Google Gemini 2.5 Flash multimodal
- All providers can be overridden via options parameter

**Vercel AI SDK:**
- All AI calls use Vercel AI SDK (`ai` package)
- Text generation: `generateText()` / `generateObject()` from `ai`
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
GOOGLE_GENERATIVE_AI_API_KEY="..."  # For Gemini models (text generation, embeddings, vision)
NEXTAUTH_SECRET="..."               # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

**Optional (.env.local):**
```bash
OPENAI_API_KEY="..."         # Legacy support only - not required for system operation
```

## TypeScript Configuration

- **Strict mode enabled:** `strict: true`, `strictNullChecks: true`, `noImplicitAny: true`
- **Path alias:** `@/*` maps to project root
- **Module resolution:** `bundler` (Next.js 16 requirement)
- **React compiler enabled** in next.config.ts

## Creating and Managing Dynamic Agents

### Adding a New Agent

The system is fully dynamic - you can add any type of health agent through the admin panel without code changes:

**Example: Adding a Cardiology Agent**

1. Navigate to Admin → Health Agents → Create New Agent
2. Configure agent properties:
   ```typescript
   {
     agentKey: 'cardiologia',
     name: 'Cardiologia',
     title: 'Especialista em Saúde Cardiovascular',
     description: 'Análise especializada de saúde cardíaca...',
     color: 'red',
     icon: 'heart',

     // Define role in complete analysis
     analysisRole: 'specialized',  // or 'foundation' or 'none'
     analysisOrder: 4,              // execution/presentation order

     // AI Configuration
     systemPrompt: 'Você é um cardiologista especializado...',
     analysisPrompt: 'Analise os seguintes dados cardiovasculares...',
     modelName: 'gemini-2.5-flash',
     modelConfig: {
       temperature: 0.3,
       topP: 0.95,
       maxOutputTokens: 4000
     },

     // Access control
     allowedRoles: ['doctor', 'admin'],
     isActive: true,
     displayOrder: 4
   }
   ```

3. **That's it!** The agent is now:
   - ✅ Available for individual analyses
   - ✅ Included in complete analysis workflow automatically
   - ✅ Integrated into synthesis generation
   - ✅ Used for recommendations and weekly plans

### Agent Role Best Practices

**Foundation Agents:**
- Use for: Broad, integrative analyses that provide base context
- Examples: Medicina Integrativa, Endocrinologia, Geriatria
- Characteristics: Holistic view, identify patterns across systems
- Execution: Sequential (order matters for context building)

**Specialized Agents:**
- Use for: Deep-dive analyses in specific domains
- Examples: Nutrição, Exercício, Cardiologia, Suplementação
- Characteristics: Technical depth, actionable recommendations
- Execution: Parallel (all receive foundation context simultaneously)

**Standalone Agents:**
- Use for: Optional analyses not part of standard workflow
- Examples: Experimental agents, research-specific analyses
- Set `analysisRole: 'none'`

### System Validation Rules

**Complete Analysis requires:**
- At least 1 foundation agent with `analysisRole: 'foundation'`
- At least 1 specialized agent with `analysisRole: 'specialized'`
- Both agents must have `isActive: true`

If these conditions aren't met, the system throws clear error messages directing admins to configure the missing agents.

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
