# Sorami Frontend - AI Agent Instructions

## Project Overview

Next.js 15 (App Router) **multi-tenant SaaS** for AI content generation (books, blogs, images, videos) with Clerk auth, Prisma ORM (MySQL), AWS S3 storage, and CrewAI backend integration.

**Core Stack**: Next.js 15 + TypeScript + Tailwind + Prisma + Clerk + AWS S3 + Framer Motion + Paystack

**Key Features**: Book generation, blog creation, image/video generation, credit-based billing, multi-organization support

## Critical Architecture Patterns

### 1. Database & Multi-Tenancy (Prisma)

```typescript
// Always use the singleton instance
import { prisma } from '@/lib/prisma'

// Multi-tenant pattern with organization isolation
const books = await prisma.book.findMany({
  where: { organizationId: user.currentOrganizationId },
  include: {
    chapters: { orderBy: { order: 'asc' } },
    author: { select: { id: true, name: true } }
  }
})
```

**Critical Relations**:
- `User` ↔ `OrganizationMember` ↔ `Organization` (multi-tenancy)
- `Book` ↔ `Chapter[]` (ordered with `order` field)
- `BookJob/BlogJob/ImageGeneration/VideoGeneration` (async job tracking)
- `Subscription` + `PaystackSubscription` (billing)

**After schema changes**: `npx prisma generate` → `npx prisma db push` (dev) or `npx prisma migrate dev` (prod)

### 2. Authentication (Clerk + Custom Helpers)

```typescript
// Server-side API routes (REQUIRED pattern)
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(); // Returns user with organizationMemberships
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // user includes organizationMemberships with full organization data
}
```

**Authentication Flow**:
- `getCurrentUser()` auto-creates users from Clerk data if missing in Prisma DB
- Always check for user existence before proceeding with operations
- User sync happens automatically on first access, not just via webhook

**Middleware Protection** (`middleware.ts`):
- Protected: `/create`, `/books`, `/blog`, `/jobs`, `/dashboard`, `/generate-*`, `/admin`
- Public: `/`, `/sign-in`, `/sign-up`, `/api/webhooks/*`, `/blog/*` (read-only)
- Webhook routes: `/api/webhooks/{clerk,book-completion,blog-completion,image-completion,video-completion}`

### 3. Dual API Architecture

**Server-Side** (`src/lib/api-server.ts`):
```typescript
import { fetchBooks, createBook } from '@/lib/api-server'
// Use in Server Components, API Routes, Server Actions
// Returns Prisma types: BookWithChapters, BookJobWithDetails
```

**Client-Side** (`src/lib/api-client.ts` or fetch):
```typescript
// Use in Client Components via hooks
// Returns simplified types from src/types/*.ts
const { books } = useBooks(); // hooks/useBooks.ts
```

**Type Strategy**:
- `src/lib/types.ts`: Prisma extended types (server-only)
- `src/types/book-api.ts`, `blog-api.ts`, etc.: Simplified API contracts (client)

### 4. Webhook System (CrewAI Backend Integration)

**Critical Pattern** - All completion webhooks follow this structure:

```typescript
// /api/webhooks/{book|blog|image|video}-completion/route.ts
export async function POST(request: NextRequest) {
  // 1. Security: Validate X-Webhook-Secret in production
  const webhookSecret = (await headers()).get('x-webhook-secret');
  if (process.env.NODE_ENV !== 'development' && webhookSecret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Idempotency: Prevent duplicate processing (5min window)
  const idempotencyKey = `${payload.job_id}-${payload.status}`;
  if (processedWebhooks.has(idempotencyKey)) {
    return NextResponse.json({ message: 'Already processed' });
  }
  processedWebhooks.set(idempotencyKey, Date.now());
  
  // 3. Atomic DB transaction
  await prisma.$transaction(async (tx) => {
    const job = await tx.bookJob.update({...});
    const book = await tx.book.create({
      data: {
        ...sanitizedData,
        chapters: { create: chaptersData.map((ch, i) => ({ ...ch, order: i + 1 })) }
      }
    });
  });
}
```

**Env Vars**: `WEBHOOK_SECRET`, `NEXT_PUBLIC_API_URL` (CrewAI backend), `NEXT_PUBLIC_WEBHOOK_URL`

### 5. S3 Storage Pattern

```typescript
import { uploadBookFile, getDownloadUrl } from '@/lib/s3-storage'

// Upload with metadata
const fileInfo = await uploadBookFile({
  bookId: 'book_123',
  content: pdfBuffer,
  format: 'PDF',
  metadata: { author: user.name }
});
// Returns: { id, path, size, downloadUrl }
```

**S3 Organization**: `books/{bookId}/{timestamp}.{format}`, `images/`, `videos/`

### 7. Credit System (Core SaaS Logic)

```typescript
import { deductCredits, CREDIT_COSTS } from '@/lib/credits'

// Before starting AI generation, always check and deduct credits
const result = await deductCredits({
  userId: user.id,
  contentType: 'BOOK', // 'IMAGE' | 'VIDEO' | 'BLOG' | 'BOOK' | 'IMAGE_ECOMMERCE' | 'VIDEO_CUSTOM'
  quantity: 1,
  metadata: { feature: 'book-generation', title: bookData.title }
});

if (!result.success) {
  return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
}
```

**Credit Costs** (defined in `CREDIT_COSTS`):
- Images: 1 credit each | Videos: 5 credits | Blogs: 2 credits | Books: 10 credits
- E-commerce images: 2 credits | Custom videos: 8 credits

### 8. Paystack Integration (West Africa Focus)

```typescript
import { initializeTransaction, verifyTransaction } from '@/lib/paystack'

// Initialize payment (amounts in XOF - West African CFA Franc)
const { body } = await initializeTransaction({
  amount: 5000, // 5000 XOF = 50 FCFA
  email: user.email,
  metadata: { userId: user.id, plan: 'pack-createur' }
});
```

**Currency**: XOF (West African CFA Franc), amounts multiplied by 100 for Paystack API
**Key Plans**: Free tier, Pack Créateur (paid tier with more credits)

### 9. React Hooks Conventions

```typescript
// Standard naming: use{Feature}{Action}
export function useBookCreation() {
  const [isCreating, setIsCreating] = useState(false);
  const createBook = async (data: BookRequest) => {
    // Always handle loading + error states
  };
  return { createBook, isCreating, error };
}

// Usage in components
const { createBook, isCreating } = useBookCreation();
```

**Established Hooks**: `useBooks`, `useBookCreation`, `useBlogJob`, `useImageGeneration`, `useVideoGeneration`, `useSecureAPI`, `useSubscription`, `useS3Files`

## Development Workflows

### Local Development
```bash
npm run dev              # Next.js on :3000
npx prisma studio        # DB GUI on :5555
npm run lint             # ESLint check (run before commits)
```

### Database Operations
```bash
# After editing schema.prisma
npx prisma generate      # Regenerate Prisma Client types
npx prisma db push       # Sync schema to DB (dev - no migration file)
npx prisma migrate dev   # Create versioned migration (staging/prod)
```

### Testing Webhooks Locally
```bash
# Use test scripts in root
./test-blog-webhook.sh
./test-image-webhook.sh
./test-video-generation.sh
```

## UI/Styling Conventions

**Tailwind-Only** (no CSS modules):
- Dark theme with glassmorphism: `bg-slate-900/50 backdrop-blur-sm`
- Primary colors: Violet (`violet-600`), Indigo (`indigo-600`)
- Framer Motion for animations: `motion.div` with `variants` pattern
- Component library: `src/components/ui/` (shadcn-style)

**Responsive Pattern**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Mobile-first breakpoints */}
</div>
```

## Critical Environment Variables

```bash
# Database
DATABASE_URL="mysql://user:pass@host:3306/sorami"

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Storage (AWS S3)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="eu-north-1"
AWS_S3_BUCKET_NAME="sorami-generated-content-9872"

# Backend Integration
NEXT_PUBLIC_API_URL="http://localhost:9006"  # CrewAI backend
WEBHOOK_SECRET="sorami-webhook-secret-key-2025"

# Billing (Paystack)
PAYSTACK_SECRET_KEY="sk_test_..."
PAYSTACK_PUBLIC_KEY="pk_test_..."
```

## Common Gotchas

1. **Clerk User Sync**: New users auto-created via `getCurrentUser()` helper, not just webhook
2. **Chapter Ordering**: Always use `order` field and `orderBy: { order: 'asc' }`
3. **Webhook Idempotency**: In-memory Map with 5min TTL (use Redis for multi-instance)
4. **S3 Upload Errors**: Check bucket name matches `AWS_S3_BUCKET_NAME` and region
5. **Type Imports**: Never import Prisma types in client components - use `src/types/*`
6. **Middleware Bypass**: Add webhook routes to `isPublicRoute` matcher

## File Structure Reference

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   └── webhooks/       # CrewAI completion webhooks
│   ├── (auth)/             # Auth pages (Clerk)
│   ├── books/              # Book management
│   ├── blog/               # Blog generation
│   ├── generate-images/    # Image generation
│   └── generate-videos/    # Video generation
├── lib/
│   ├── auth.ts             # getCurrentUser, requireAuth
│   ├── prisma.ts           # Singleton Prisma client
│   ├── api-server.ts       # Server-side API (Prisma types)
│   ├── api-client.ts       # Client-side API (fetch)
│   ├── s3-storage.ts       # S3 upload/download
│   ├── credits.ts          # Credit system & CREDIT_COSTS
│   ├── paystack.ts         # Payment integration
│   └── types.ts            # Prisma extended types
├── types/                  # API contract types (client)
├── hooks/                  # React hooks (use* pattern)
├── components/
│   └── ui/                 # Reusable UI components
└── middleware.ts           # Clerk route protection
```

## When Adding New Features

1. **Database**: Update `schema.prisma` → `prisma generate` → `prisma db push`
2. **Types**: Add to `src/lib/types.ts` (Prisma) AND `src/types/*.ts` (API)
3. **API Route**: Use `getCurrentUser()`, proper error handling, `NextResponse.json()`
4. **Hook**: Follow `use{Feature}` pattern with loading/error states
5. **Credits**: Always deduct credits before AI generation using `deductCredits()`
6. **Webhook**: Implement idempotency + secret validation + atomic transactions
7. **UI**: Tailwind classes only, Framer Motion for animations

**Always check existing patterns in similar features before implementing new ones.**