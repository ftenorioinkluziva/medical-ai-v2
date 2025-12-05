# Medical AI v2 - Copilot Instructions

## Project Architecture

**Medical AI v2** is a Next.js 16 SaaS platform for AI-powered medical document analysis using specialized health agents (Integrative Medicine, Endocrinology, Nutrition, Exercise).

### Core Data Flows

1. **Document Upload → Text Extraction → Structuring → Storage**
   - PDFs/images uploaded via `/api/documents/upload`
   - Extract text: PDFs (`pdf-parse`), images (Google Vision API)
   - Optionally structure medical data using LLM → `lib/documents/processor.ts`
   - Save to `documents` table with `extractedText` and `structuredData` JSON columns
   - Processing is synchronous (no background jobs) - results available immediately

2. **Agent-Based Analysis Flow**
   - User selects agent + document + optional contexts (profile, RAG knowledge)
   - Combine: `systemPrompt` + `analysisPrompt` + all contexts
   - Call Gemini 2.5 Flash via `lib/ai/agents/analyze.ts::analyzeWithAgent()`
   - Store result in `analyses` table with agent + user + document references
   - **Note:** Agents are database-driven (not hardcoded), loaded from `health_agents` table

3. **RAG System**
   - Knowledge base articles in `knowledge_base` table
   - Vector embeddings stored in `knowledge_embeddings` (pgvector)
   - Search: `lib/ai/rag/vector-search.ts::searchSimilarDocuments()`
   - **Important:** RAG only used for knowledge base articles, NOT for user documents

4. **Logical Brain Integration**
   - Supplements analysis with `runLogicalAnalysis()` from `lib/logic`
   - Validates analysis against clinical guidelines
   - Adds extra layer of safety before final response

### Multi-Agent System

Agents are **database records**, not hardcoded entities:
```typescript
// Agent structure in DB (health_agents table)
{
  id: string
  agentKey: string          // e.g., "integrativa", "endocrinologia"
  name: string              // e.g., "Medicina Integrativa"
  title: string             // e.g., "Especialista em Saúde Integrativa"
  description: string       // Agent purpose
  systemPrompt: string      // Agent's role/expertise
  analysisPrompt: string    // Template for analysis structure
  modelName: string         // "gemini-2.5-flash" (default)
  modelConfig: {
    temperature: number     // 0.3 (conservative), 0.7 (balanced)
    topP: number
    topK: number
    maxOutputTokens: number
  }
  allowedRoles: string[]    // ['patient', 'doctor', 'admin']
  color: string             // UI color: green/purple/orange/blue
  icon: string              // Lucide icon name
  isActive: boolean
  displayOrder: number      // Sort order in UI
}
```

**4 Core Agents (seeded by default):**
- **Medicina Integrativa** (green/Leaf): Holistic health, hormonal balance, wellness
- **Endocrinologia** (purple/Wind): Hormones, metabolic markers, thyroid
- **Nutrição** (orange/Apple): Diet analysis, supplementation, nutrition
- **Fisiologia do Exercício** (blue/Dumbbell): Performance, composition, training

**Workflow:**
- Query agent from DB (never import hardcoded) → `scripts/seed-agents.ts`
- Check user role against `allowedRoles` via `lib/auth/rbac.ts`
- Pass agent to `analyzeWithAgent()` with contexts
- Always include disclaimer: "Esta análise é gerada por IA..."
- Log all operations with structured logging: `[AGENT]`, `[ANALYSIS-API]` prefixes

### Role-Based Access Control (RBAC)

| Role   | Access                                      | Routes                | Redirect              |
|--------|---------------------------------------------|---------------------|-----------------------|
| patient| Own documents, analyses, recommendations   | `/dashboard/*`      | `/dashboard`          |
| doctor | View patient data (with access), manage    | `/doctor/*`         | `/doctor`             |
| admin  | Config, knowledge, users, all settings     | `/admin/*`          | `/admin`              |

**Key RBAC Features:**
- Defined in `lib/auth/rbac.ts` with permission matrix
- Middleware enforces routing via `middleware.ts`
- Admins redirected away from regular dashboard
- Doctor view includes patient selector component
- Session includes: `user.id`, `user.role`, `user.email`, `user.name`
- Authentication via NextAuth v5 (Credentials provider + bcrypt)

## Development Workflows

### Database Management

```bash
pnpm db:generate    # Schema → migrations (Drizzle)
pnpm db:migrate     # Run migrations (scripts/migrate.mjs)
pnpm db:push        # Direct DB push (dev only) - avoid in production
pnpm db:setup       # Complete setup: generate + migrate + seed agents
pnpm db:studio      # Open Drizzle Studio GUI for database inspection
```

**Database Workflow:**
1. Modify schema files in `lib/db/schema/` (use Drizzle ORM syntax)
2. Run `pnpm db:generate` to create migration files in `lib/db/migrations/`
3. Run `pnpm db:migrate` to apply migrations to database
4. Test changes before committing

**Schema Import Pattern:** 
- **Always** import from `@/lib/db/schema` (barrel export in `index.ts`)
- Never import from individual schema files (e.g., avoid `@/lib/db/schema/users.ts`)
- Example: `import { db, users, documents, analyses } from '@/lib/db/schema'`

**PostgreSQL Requirements:**
- pgvector extension for embeddings (auto-enabled on Neon)
- Max 20 concurrent connections (configured in pool)
- 30-second statement timeout for long queries

### AI Provider Architecture

**Primary: Google AI (Gemini 2.5 Flash)** ✅ Required
- **Text Generation:** Gemini 2.5 Flash for medical analysis
- **Embeddings:** `text-embedding-004` (50-60% cheaper than OpenAI, 768 dimensions)
- **Vision/OCR:** Gemini 2.5 Flash multimodal for image processing
- **Document Structuring:** Native JSON output for structured extraction
- Provider location: `lib/ai/providers/google.ts`
- Integration: Vercel AI SDK (`@ai-sdk/google`)
- Environment: `GOOGLE_GENERATIVE_AI_API_KEY`

**Secondary: OpenAI (Legacy/Optional)** ⚠️ Backward compatibility only
- Only used if explicitly specified in function calls
- Requires separate `OPENAI_API_KEY` (not required for system operation)
- Provider location: `lib/ai/providers/openai.ts`

**Provider Selection Logic:**
- Agent's `modelName` field determines provider (default: `gemini-2.5-flash`)
- API routes can override via `provider` option
- Always check Google key exists before relying on it
- Fallback to OpenAI if Google key missing (for legacy)

**AI Model Temperature Settings:**
- **0.1-0.3:** Low temp for accuracy (document structuring, validation)
- **0.7:** Balanced for medical analysis
- **0.9+:** High temp for creative recommendations

### Key Environment Variables

| Variable                           | Required | Purpose                                      |
|:---|:---:|:---|
| `DATABASE_URL`                     | ✓        | PostgreSQL connection (Neon format)          |
| `GOOGLE_GENERATIVE_AI_API_KEY`     | ✓        | Gemini models (text, embeddings, vision)     |
| `NEXTAUTH_SECRET`                  | ✓        | Generate: `openssl rand -base64 32`          |
| `NEXTAUTH_URL`                     | ✓        | `http://localhost:3000` (dev/staging)        |
| `OPENAI_API_KEY`                   |          | Legacy only - not required for operation     |
| `NODE_ENV`                         |          | `development` or `production`                |

## Code Patterns & Conventions

### 1. Importing Database Client & Schema
```typescript
// ✅ CORRECT: Always use barrel export
import { db } from '@/lib/db/client'
import { users, documents, analyses, healthAgents } from '@/lib/db/schema'

// ❌ INCORRECT: Never import from individual schema files
// import { users } from '@/lib/db/schema/users'

// Query example with Drizzle ORM
const agent = await db.query.healthAgents.findFirst({
  where: (agents, { eq }) => eq(agents.id, agentId),
})

// Insert example
const [newDoc] = await db.insert(documents).values({
  userId: session.user.id,
  fileName: 'report.pdf',
  extractedText: text,
  documentType: 'medical_report',
}).returning()
```

### 2. Authentication in Server Components
```typescript
import { auth } from '@/lib/auth/config'
import { requireAuth } from '@/lib/auth/session'  // Helper with redirect

// Option 1: Manual check
const session = await auth()
if (!session?.user?.id) throw new Error('Unauthorized')
const userId = session.user.id

// Option 2: With requireAuth (auto-redirects to login)
const session = await requireAuth()  // Throws if not authenticated
const userId = session.user.id
const userRole = session.user.role  // 'patient', 'doctor', or 'admin'
```

### 3. Authentication in Client Components
```typescript
'use client'

import { useSession } from 'next-auth/react'

export function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Not authenticated</div>
  
  const userId = session.user.id
  const userRole = session.user.role
}
```

### 4. Document Processing
```typescript
import { processDocument } from '@/lib/documents/processor'

const result = await processDocument(fileBuffer, fileName, userId, {
  documentType: 'medical_report',  // 'lab_report' | 'bioimpedance' | 'imaging' | 'prescription' | 'other'
  structureData: true,  // Optional: LLM-powered structuring
})

// Returns: {
//   success: boolean
//   extractedText: string
//   structuredData?: StructuredMedicalDocument
//   metadata: { textLength, chunksCount, processingTimeMs, modulesCount }
// }
```

### 5. Agent Analysis with Contexts
```typescript
import { analyzeWithAgent } from '@/lib/ai/agents/analyze'
import type { HealthAgent } from '@/lib/db/schema'

// Always fetch agent from DB, never hardcode
const agent = await db.query.healthAgents.findFirst({
  where: (a, { eq }) => eq(a.id, agentId),
})

if (!agent) throw new Error('Agent not found')

const result = await analyzeWithAgent(agent, analysisPrompt, {
  documentsContext: extractedText,      // Raw extracted text or structured summary
  medicalProfileContext: JSON.stringify(profile),  // User's medical profile
  ragContext: knowledgeContext,         // Knowledge base search results
  structuredDocuments: [structuredDoc],  // Optional: structured medical data
  documentIds: [docId],                 // For reference/logging
})

// Returns: {
//   success: boolean
//   analysis: string
//   usage: { totalTokens, ... }
//   metadata: { processingTimeMs, temperature, ragUsed, ... }
// }
```

### 6. RAG Knowledge Search
```typescript
import { searchSimilarDocuments } from '@/lib/ai/rag/vector-search'
import { buildRAGContext } from '@/lib/ai/rag/context-builder'

// Search knowledge base (NOT user documents)
const searchResults = await searchSimilarDocuments(
  'question or medical terms',
  { limit: 5, similarity: 0.6 }
)

// Build formatted context string
const ragContext = buildRAGContext(searchResults)
// Returns: {
//   contextText: string
//   sources: Array<{ documentId, documentName, similarity, excerpt }>
//   stats: { documentsUsed, chunksUsed, totalChars }
// }
```

### 7. Error Handling Pattern
```typescript
// API Routes: Always use try-catch with structured logging
export async function POST(request: NextRequest) {
  try {
    console.log(`📤 [UPLOAD-API] Processing request...`)
    
    // Your logic here
    
    console.log(`✅ [UPLOAD-API] Success`)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('❌ [UPLOAD-API] Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Client Components: Use Sonner toast notifications
import { toast } from 'sonner'

try {
  const response = await fetch('/api/documents/upload', { method: 'POST', body: formData })
  const data = await response.json()
  
  if (!response.ok) {
    toast.error('Upload failed', { description: data.error })
    return
  }
  
  toast.success('Document uploaded', { description: 'Processing complete' })
} catch (error) {
  toast.error('Error', { description: error instanceof Error ? error.message : 'Unknown' })
}
```

### 8. File Type Constants & Validation
```typescript
// Document types
const DOCUMENT_TYPES = [
  { value: 'lab_report', label: 'Exame Laboratorial' },
  { value: 'bioimpedance', label: 'Bioimpedância' },
  { value: 'medical_report', label: 'Relatório Médico' },
  { value: 'prescription', label: 'Receita' },
  { value: 'imaging', label: 'Exame de Imagem' },
  { value: 'other', label: 'Outro' },
]

// File validation
const MAX_FILE_SIZE = 10 * 1024 * 1024  // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

// Date formatting (Portuguese)
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const dateStr = format(new Date(), 'PPpp', { locale: ptBR })  // "1º de dez. de 2025 às 14:30"
```

### 9. React Component Patterns
```typescript
// Client Component with 'use client' directive
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

/**
 * Component Description
 * What it does and when to use it
 */
export function MyComponent({ userId }: { userId: string }) {
  const { data: session } = useSession()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/data/${userId}`)
        if (!response.ok) throw new Error('Failed to load')
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!data) return null

  return <div>{/* Component JSX */}</div>
}

// Server Component (no 'use client')
export default async function Page() {
  const session = await requireAuth()
  const data = await db.query.documents.findMany({
    where: (d, { eq }) => eq(d.userId, session.user.id),
  })

  return <div>{/* Component JSX */}</div>
}
```

### 10. Logging Convention
```typescript
// Structured logging with prefixes for different features
console.log(`✅ [FEATURE-NAME] Success message with details`)
console.error(`❌ [FEATURE-NAME] Error message`)
console.warn(`⚠️ [FEATURE-NAME] Warning message`)
console.log(`📤 [UPLOAD-API] Processing file: ${fileName}`)
console.log(`🤖 [AGENT] Starting analysis with: ${agent.name}`)
console.log(`🔍 [RAG] Searching knowledge base for: ${query}`)
```

## Route Structure (Next.js App Router)

```
app/
├── (auth)/                      → Public auth pages
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── (dashboard)/                 → Protected patient routes
│   ├── layout.tsx               → Dashboard layout with nav
│   ├── dashboard/               → Main dashboard
│   ├── agents/                  → Agent selector & history
│   ├── analyze/                 → Document analysis interface
│   ├── analyses/                → Analysis results & comparisons
│   ├── compare/                 → Document comparison
│   ├── documents/               → Upload & manage documents
│   ├── profile/                 → Medical profile editor
│   ├── recommendations/         → Personalized recommendations
│   ├── weekly-plan/             → Generated weekly plans
│   └── doctor/                  → Doctor-specific views
├── (admin)/                     → Admin panel (requires admin role)
│   ├── agents/                  → Manage health agents
│   ├── analytics/               → System analytics
│   └── users/                   → User management
├── api/
│   ├── /auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── logout/
│   ├── /documents/
│   │   ├── upload/              → POST: Process + store documents
│   │   ├── [id]/                → GET/DELETE specific document
│   │   └── /                    → GET: List user documents
│   ├── /agents/
│   │   └── [agentId]/analyze/   → POST: Trigger agent analysis
│   ├── /analyses/
│   │   ├── history/             → GET: Analysis history
│   │   ├── compare/             → POST: Compare multiple analyses
│   │   └── [id]/                → GET specific analysis
│   ├── /recommendations/        → Generate & fetch recommendations
│   ├── /weekly-plan/            → Generate & fetch weekly plans
│   ├── /dashboard/stats/        → GET dashboard statistics
│   └── /admin/                  → Admin operations
├── como-funciona/               → Public "How it works" page
├── especialistas/               → Public specialists page
├── recursos/                    → Public resources page
└── layout.tsx                   → Root layout with Providers
```

**Protected Routes (require authentication):**
- All routes under `(dashboard)` and `(admin)` are protected by middleware
- Unauthenticated users redirected to `/login?callbackUrl=...`

**Admin-Only Routes (require admin role):**
- `/admin/*` routes only accessible to users with `role: 'admin'`
- Admin users redirected away from regular dashboard (`/dashboard`)

**Doctor Routes:**
- `/doctor/*` for doctor-specific interface
- Can view patient data via patient selector
- Cannot access regular patient dashboard

## React Component Patterns & Architecture

### Component Organization

**Location:** `components/` directory organized by feature:
- `components/admin/` - Admin-specific components (agent forms, knowledge upload)
- `components/agents/` - Agent selector and related UI
- `components/analyses/` - Analysis history and results display
- `components/analysis/` - Analysis interface (main interaction component)
- `components/dashboard/` - Dashboard widgets and navigation
- `components/doctor/` - Doctor-specific views (patient selector, patient list)
- `components/documents/` - Document upload, list, details, comparison
- `components/profile/` - Medical profile form and display
- `components/recommendations/` - Health recommendations widget
- `components/weekly-plan/` - Weekly plan widget
- `components/ui/` - Reusable UI primitives (shadcn)

### Widget Pattern (Dashboard Components)

Most dashboard components follow a **widget pattern** with consistent structure:
```typescript
'use client'

/**
 * Widget Name - Description
 * What it displays and when used
 */

interface WidgetProps {
  patientId?: string  // Optional: for doctor viewing patient
  onLoad?: (data: any) => void  // Optional callback
}

export function WidgetName({ patientId, onLoad }: WidgetProps = {}) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [patientId])  // Re-load if patientId changes

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const endpoint = patientId 
        ? `/api/endpoint?patientId=${patientId}`
        : `/api/endpoint`
      
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error('Failed to load')
      
      const result = await response.json()
      setData(result)
      onLoad?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <Skeleton />
  if (error) return <ErrorCard message={error} onRetry={loadData} />
  if (!data) return null

  return <Card>{/* Widget content */}</Card>
}
```

### State Management

- **Session:** `useSession()` from NextAuth for user data
- **Patient Context:** `usePatient()` from `lib/contexts/patient-context` for doctor views
- **Local State:** `useState()` for component-level state
- **No Global State:** Avoid Redux/Zustand unless necessary (use API endpoints instead)

### Common UI Patterns

1. **Loading States:** Use Skeleton components from `components/ui/skeleton.tsx`
2. **Error Handling:** Display error cards with retry button
3. **Empty States:** Show helpful message with icon when no data
4. **Toast Notifications:** Use `toast` from `sonner` for user feedback
5. **Date Formatting:** Always use `date-fns` with `ptBR` locale for Portuguese dates

## UI Stack & Styling

- **Component Library:** Shadcn UI in `components/ui/` directory
- **UI Primitives:** Radix UI (zero-runtime CSS-in-JS alternative)
- **Styling:** Tailwind CSS v4 (utility-first CSS)
- **Icons:** Lucide React (consistent SVG icons)
- **Themes:** Dark mode supported via `next-themes`
- **Notifications:** Sonner (toast library with rich styling)
- **Form Validation:** React Hook Form + Zod (type-safe forms)

**Agent-Specific Colors:**
Each agent has `color` and `icon` properties for UI:
- **Medicina Integrativa:** green/Leaf
- **Endocrinologia:** purple/Wind (or similar wind icon)
- **Nutrição:** orange/Apple
- **Fisiologia do Exercício:** blue/Dumbbell

**Styling Conventions:**
- Use Tailwind utility classes for styling
- Leverage shadcn components for consistency
- Use `cn()` utility from `lib/utils.ts` for class merging
- Follow Minimal Health Design aesthetic (clean, professional, health-focused)

## TypeScript & Build Configuration

- **Strict Mode:** Enabled (`strict: true`, `strictNullChecks`, `noImplicitAny`)
- **Path Alias:** `@/*` maps to project root
- **React Compiler:** Enabled in `next.config.ts` for optimized React rendering
- **Module Resolution:** `bundler` (Next.js 16 requirement)
- **Build Target:** ES2020 for modern browsers

## Testing Infrastructure

- **Test Directories:** `test/` (unit), `tests/` (integration)
- **Test Framework:** Infrastructure exists but run commands not defined in package.json
- **Testing Library:** `@testing-library/react` available
- **Manual Testing:** Recommended approach until test suite is formalized

## Advanced Patterns

### Document Structuring

Medical documents are automatically structured into modules using LLM:
```typescript
// lib/documents/structuring.ts exports StructuredMedicalDocument
{
  documentType: 'lab_report' | 'bioimpedance' | 'medical_report' | 'prescription' | 'imaging' | 'other'
  patientInfo: { name?, age?, dateOfBirth?, sex? }
  providerInfo: { name?, doctor?, address? }
  examDate?: string
  overallSummary: string
  modules: Array<{
    moduleName: string        // e.g., "Hemograma", "TSH"
    category: string          // e.g., "Hematologia", "Endocrinologia"
    status: 'normal' | 'abnormal' | 'high' | 'low' | 'borderline' | 'n/a'
    summary: string
    parameters: Array<{
      name: string
      value: string | number
      unit?: string
      referenceRange?: string
      status: 'normal' | 'high' | 'low'
    }>
  }>
}
```

### Medical Profile Schema

Complete medical history stored in `medicalProfiles` table:
```typescript
// Includes: age, gender, height, weight, vital signs, sleep patterns, 
// stress level, exercise data, nutrition info, medical conditions, 
// medications, allergies, surgeries, family history, habits
```

### Document Chunking Strategy

Medical documents are intelligently chunked for RAG:
1. **Section-based:** Keeps medical sections together (Hemograma, Lipidograma, etc.)
2. **Sliding Window:** Overlaps chunks for context preservation
3. **Size-aware:** Respects max token limits for AI models
- Location: `lib/documents/chunking.ts`

### Weekly Plan Generation

Complex structured plan generation with:
- Medication schedule (with timing and dosage)
- Supplement protocol
- Shopping list (organized by category)
- Meal plan (daily with prep times and calories)
- Exercise prescription (intensity, duration, type)
- Recovery and monitoring strategies
- Location: `lib/ai/weekly-plans/generators.ts`

### Context Switching for Doctors

Doctors can view multiple patients via context system:
```typescript
// lib/contexts/patient-context.ts
// Manages selected patient for doctor views
// Updates URL and provides patient data across components
const { selectedPatient, setSelectedPatient } = usePatient()
```

### Analysis Comparison

Multiple analyses can be compared to track evolution:
- API Route: `/api/analyses/compare`
- Compares across time periods
- Highlights improvements/regressions
- Provides trend analysis
- Generates narrative comparison report

## Common Gotchas & Anti-Patterns

1. **❌ Hardcoded Agents** — Never hardcode agent configs
   - ✅ Query `health_agents` table at runtime → `scripts/seed-agents.ts`

2. **❌ RAG on User Documents** — RAG only for knowledge base
   - ✅ Search `knowledge_base` + `knowledge_embeddings`
   - ❌ Don't embed user's personal documents

3. **❌ Async Document Processing** — Document processing is synchronous
   - ✅ Results returned immediately in API response
   - ❌ Don't use background jobs or message queues

4. **❌ Individual Schema Imports** — Never import from individual schema files
   - ✅ Always use `@/lib/db/schema` (barrel export)
   - ❌ Avoid `@/lib/db/schema/users.ts`

5. **❌ Middleware Bypassing** — Admins can't access `/dashboard`
   - ✅ Middleware enforces role-based routing automatically
   - ❌ Don't try to bypass RBAC checks

6. **❌ OpenAI as Default** — Google AI is primary, OpenAI is legacy
   - ✅ Ensure `GOOGLE_GENERATIVE_AI_API_KEY` is set for production
   - ⚠️ OpenAI only used if explicitly specified and Google key missing

7. **❌ Edge Runtime Compatibility** — Some modules don't work on Edge
   - ✅ Use `authorize()` in NextAuth (runs on Node)
   - ❌ Don't import `fs`, `pg` at top level in API routes

8. **❌ Direct Database Timestamps** — Dates need locale formatting
   - ✅ Use `date-fns` with `ptBR` locale for display
   - ❌ Don't display raw ISO dates to users

9. **❌ Missing Error Boundaries** — Always handle errors gracefully
   - ✅ Catch errors in try-catch + toast notifications
   - ❌ Don't let errors crash the UI

10. **❌ Unvalidated User Input** — Always validate with Zod
    - ✅ Use validators from `lib/validators/`
    - ❌ Trust frontend data without backend validation

## Naming Conventions

### Variables & Functions
- **camelCase** for variables and functions
- **UPPER_SNAKE_CASE** for constants
- **PascalCase** for components and classes
- Descriptive names (e.g., `fetchUserAnalyses` not `getData`)

### Files & Directories
- **kebab-case** for files and folders (e.g., `medical-profile.tsx`)
- **index.ts** for barrel exports in directories
- Plurals for component directories (e.g., `components/ui/`, `lib/validators/`)

### Database & Types
- **snake_case** for database column names
- **PascalCase** for TypeScript types and interfaces
- Suffix with `Type` or `Schema` for clarity (e.g., `DocumentType`, `UserSchema`)

### API Routes
- **kebab-case** for route segments
- Use HTTP verbs: GET, POST, PUT, DELETE, PATCH
- Descriptive names (e.g., `/api/documents/upload` not `/api/upload`)

### Git & Branches
- **feature/feature-name** for new features
- **bugfix/bug-name** for bug fixes
- **hotfix/critical-issue** for production hotfixes
- Current branch: `feature/medical-knowledge-brain`

## Performance Optimization

### Database
- Use **indexes** on frequently queried columns (`userId`, `agentId`, `createdAt`)
- **Limit queries** to necessary fields (avoid SELECT *)
- Connection pooling via `pg` with max 20 concurrent connections
- 30-second timeout for long-running queries

### AI/API
- **Cache** frequent embeddings in `knowledge_embeddings` table
- **Batch requests** for embeddings when possible
- Use **streaming** for long-running analyses (Gemini Flash handles ~1M tokens)
- Temperature tuning: Lower = faster, Higher = more creative

### Frontend
- **React Compiler** optimization enabled
- **Lazy load** heavy components (analyses, documents)
- **Memoization** for expensive calculations
- **SWR/React Query** patterns for data fetching (currently using fetch)
- **Skeleton loaders** instead of spinners during loading

### Images & Media
- Use **next/image** for automatic optimization
- Compress PDFs before processing (max 10MB)
- Vision API processes images efficiently with Gemini

## Deployment Considerations

- **Environment Variables:** Required at build time for Next.js
- **Database Migrations:** Run `pnpm db:migrate` after deployment
- **Seed Data:** Run `pnpm db:seed` for default agents
- **Build Time:** ~2-3 minutes for production build
- **Cold Start:** First request may take longer due to database initialization

## Useful Commands

```bash
pnpm dev                 # Start dev server (http://localhost:3000)
pnpm build               # Production build
pnpm lint                # Run ESLint
pnpm db:studio           # Open Drizzle Studio (database GUI)
pnpm db:seed             # Seed default health agents
pnpm db:setup            # Complete setup: generate + migrate + seed
pnpm embeddings:migrate  # Migrate embeddings to Google
```

## Key Files Reference

| File/Directory              | Purpose                                           |
|-----------------------------|---------------------------------------------------|
| `lib/db/schema/`            | Drizzle ORM database schema definitions           |
| `lib/db/client.ts`          | PostgreSQL connection pool and Drizzle instance   |
| `lib/ai/agents/analyze.ts`  | Agent analysis orchestration                      |
| `lib/ai/core/generate.ts`   | AI text generation wrapper                        |
| `lib/ai/providers/`         | AI provider implementations (Google/OpenAI)       |
| `lib/ai/rag/`               | Vector search & RAG context building              |
| `lib/documents/processor.ts`| Document text extraction & structuring            |
| `lib/documents/structuring.ts`| LLM-powered medical document structuring         |
| `lib/documents/chunking.ts` | Intelligent document chunking for RAG            |
| `lib/auth/config.ts`        | NextAuth v5 configuration                         |
| `lib/auth/rbac.ts`          | Role-based access control matrix                  |
| `lib/auth/session.ts`       | Helper functions for session management           |
| `middleware.ts`             | Route protection & RBAC enforcement               |
| `lib/contexts/patient-context.tsx`| Doctor patient context management           |
| `lib/logic/`                | Logical analysis & validation                     |
| `lib/ai/weekly-plans/`      | Weekly plan generation                            |
| `lib/ai/rag/vector-search.ts`| Knowledge base similarity search                  |
| `components/`               | React/Shadcn UI components                        |
| `components/ui/`            | Shadcn UI primitives (Card, Button, etc.)        |
| `app/api/`                  | API routes (backend logic)                        |
| `scripts/seed-agents.ts`    | Initialize default health agents                  |
| `scripts/migrate.mjs`       | Run database migrations                           |

## Quick Start Checklist for New Features

### Adding a New API Endpoint
1. Create route file: \pp/api/feature/route.ts\
2. Import auth: \import { auth } from '@/lib/auth/config'\
3. Check authorization: Verify \session.user.role\ if needed
4. Use Drizzle queries: \import { db, tableName } from '@/lib/db/schema'\
5. Handle errors with try-catch + structured logging
6. Return consistent JSON response: \{ success: true, data: ... }\

### Adding a New Database Table
1. Create schema file: \lib/db/schema/new-table.ts\ (Drizzle syntax)
2. Export from barrel: Add to \lib/db/schema/index.ts\
3. Generate migration: \pnpm db:generate\
4. Review migration in \lib/db/migrations/\
5. Run migration: \pnpm db:migrate\
6. Test queries before using in API

### Adding a New Client Component
1. Add \'use client'\ directive at top
2. Define Props interface with JSDoc comments
3. Use \useState\, \useEffect\ for state management
4. Implement error/loading states
5. Use Skeleton for loading UI
6. Use \	oast\ from \sonner\ for notifications
7. Export component from \components/feature/index.ts\

### Adding a New Page
1. Create folder with \page.tsx\ (Server Component)
2. Call \
equireAuth()\ if protected
3. Query database for data
4. Import and use client components
5. Handle no-data state gracefully
6. Add breadcrumbs/navigation as needed

### Adding Authentication to a Route
1. Server Component: Use \wait requireAuth()\
2. Client Component: Use \useSession()\ hook
3. API Route: Call \uth()\ and check \session.user.id\
4. Check role: Verify against \
olePermissions\ from RBAC
5. Redirect on auth failure (automatic with \
equireAuth\)

## Medical Domain Knowledge

### Document Types Supported
- **lab_report** - Laboratory exams (blood, urine, etc.)
- **bioimpedance** - Body composition analysis
- **medical_report** - General medical reports
- **prescription** - Medications and prescriptions
- **imaging** - X-rays, ultrasounds, CT scans
- **other** - Any other medical document

### Temperature Settings by Use Case
- **0.1-0.3**: Document structuring (precision needed)
- **0.3-0.5**: Clinical analysis (balanced, reliable)
- **0.7**: General medical analysis (current default)
- **0.9-1.0**: Creative recommendations (lifestyle, wellness)

## Disclaimer Text

All AI-generated analyses must include:
\\\
"Esta an�lise � gerada por IA para fins educacionais e N�O substitui consulta m�dica profissional.
Sempre consulte um profissional de sa�de antes de tomar decis�es baseadas nesta an�lise."
\\\

## Metrics & Monitoring

### Important Metrics to Track
- **Document Processing Time:** Should be < 5 seconds
- **Analysis Generation Time:** Should be < 10 seconds
- **API Response Time:** Aim for < 2 seconds
- **Token Usage:** Monitor for cost optimization
- **Error Rate:** Keep below 1%

### Common Performance Issues
- **Slow document processing:** Check PDF size, consider chunking
- **Slow analysis:** Check RAG search scope, reduce knowledge base query
- **High token usage:** Reduce context size, use lower temperature
- **Database timeouts:** Check connection pool, optimize queries

---

## Document Status

- **Last Updated:** December 3, 2025
- **Version:** 1.0 (Comprehensive)
- **Current Branch:** \eature/medical-knowledge-brain\
- **API Version:** v1 (Google AI + Gemini 2.5 Flash)

## Getting Help

When working with this codebase:
1. Check this guide first for patterns and conventions
2. Look at similar existing implementations
3. Use \grep\ or \semantic_search\ to find examples
4. Check \CLAUDE.md\ for additional architecture details
5. Review error messages - they include \[PREFIX]\ tags for feature identification
