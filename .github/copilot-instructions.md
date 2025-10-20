# sorami Frontend - Instructions pour les Agents IA

## Architecture du Projet

Cette application Next.js 15 (App Router) est un **SaaS multi-tenant** de génération de livres IA avec Clerk authentication, Prisma ORM (MySQL), et intégration CrewAI.

### Stack Technique Principal

- **Backend**: Prisma + MySQL avec schema complet multi-tenant
- **Auth**: Clerk avec middleware protection sur `/create`, `/books`, `/jobs`, `/dashboard`
- **Stockage**: AWS S3 pour fichiers (`src/lib/s3-storage.ts`)
- **Job Processing**: CrewAI async avec système de jobs trackés
- **Types**: Architecture double `src/lib/types.ts` (Prisma) + `src/types/` (API)

### Architecture de Données Critique

Le projet utilise **Prisma avec relations complexes** :
- **Users/Organizations** : Multi-tenancy avec `OrganizationMember`
- **Books/Chapters** : Relations `Book.chapters[]` avec `order`
- **BookJobs** : Système async pour génération IA avec status tracking
- **Subscriptions** : Intégration Paystack pour facturation

**Pattern API**: Toujours utiliser `src/lib/api-server.ts` (côté serveur) vs `src/lib/api-client.ts` (côté client).

## Conventions Critiques

### Authentification et Middleware

```typescript
// Pattern requis pour toutes les API protégées
import { requireAuth } from '@/lib/auth';
const user = await requireAuth(); // Throws si non connecté
```

- **Middleware**: Routes protégées définies dans `middleware.ts` avec `createRouteMatcher`
- **Auth Helper**: `getCurrentUser()` retourne user Prisma avec `organizationMemberships`

### Gestion des Jobs Async

```typescript
// Pattern pour jobs CrewAI
const job = await prisma.bookJob.create({
  data: { bookId, jobType: 'GENERATE_OUTLINE', status: 'PENDING' }
});
// Polling via /api/jobs/[id]/status
```

**Workflow**: `PENDING` → `RUNNING` → `COMPLETED`/`FAILED`

### Types et API Patterns

- **Server-side**: Utiliser types Prisma étendus (`BookWithChapters`, `BookJobWithDetails`)
- **Client-side**: Types simplifiés dans `src/types/book-api.ts`
- **API Routes**: Pattern `NextResponse.json()` avec gestion d'erreur cohérente

### Hooks Patterns Établis

```typescript
// Pattern standard hooks
const { books, loading, error } = useBooks();
const { createBook, isCreating } = useBookCreation();
const { jobs, pollJobStatus } = useJobs();
```

## Workflows de Développement

### Database et Migrations

```bash
npx prisma generate      # Après modification schema.prisma
npx prisma db push       # Pour dev (pas de migration fichier)
npx prisma migrate dev   # Pour migration versionnée
npx prisma studio        # Interface admin BD
```

### Development Setup

```bash
npm run dev              # Port 3000 avec hot reload
npm run lint             # ESLint requis avant commit
npm run build            # Test production build
```

## Intégrations Externes

### Clerk Configuration

- **Webhooks**: `/api/webhooks/clerk` synchronise users avec Prisma
- **Middleware**: Protection granulaire par route patterns
- **Images**: Domains configurés dans `next.config.js` pour avatars

### CrewAI Integration

- **Jobs API**: `/api/jobs` pour création et monitoring
- **Async Pattern**: Stateful jobs avec polling client-side
- **Input Validation**: `BookRequest` type stricte avec `book-utils.ts`
- **Webhooks**: `/api/webhooks/book-completion` reçoit les livres terminés du backend

### Webhooks System (Book Completion)

```typescript
// Pattern webhook conforme à la documentation CrewAI
interface WebhookPayload {
  job_id: string;
  status: 'completed' | 'failed';
  timestamp: string;
  environment: 'development' | 'production';
  book_data?: BookData; // Requis si status = 'completed'
}
```

**Fonctionnalités Critiques** :
- **Idempotence** : Map en mémoire pour éviter le double traitement (fenêtre 5 min)
- **Transaction Prisma** : Création atomique Book + Chapters
- **Sécurité** : Validation du secret en production via header `X-Webhook-Secret`
- **Logs structurés** : Emojis + métadonnées pour monitoring
- **Performance** : Réponse < 30 secondes (recommandation CrewAI)

**Variables d'environnement** :
- `WEBHOOK_SECRET` : Secret partagé avec le backend CrewAI (production uniquement)
- `NEXT_PUBLIC_WEBHOOK_URL` : URL publique du webhook pour le backend

### S3 Storage

- **Multi-format**: PDF, EPUB, DOCX exports supportés
- **Presigned URLs**: Pattern sécurisé via `s3-simple.ts`

## Patterns UI Établis

### Component Structure

- **Form Components**: `BookCreationForm` avec validation intégrée
- **UI Kit**: `src/components/ui/` réutilisables (button, card, input, progress)
- **Status Indicators**: `StatusBadge` pour job states, `BookProgressIndicator`

### Styling Standards

- **Tailwind Only**: Pas de CSS modules ou styled-components
- **Color Scheme**: Primary gray-900, cards avec shadow-md
- **Responsive**: Mobile-first avec breakpoints Tailwind

Toujours commencer par vérifier les types Prisma existants et les patterns API établis avant d'implémenter de nouvelles fonctionnalités.