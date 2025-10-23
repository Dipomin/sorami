# Prochaines Étapes - Sécurité & S3 Implementation

## ✅ Phases Terminées

### Phase 1: Prisma Schema ✓
- Modèles ImageGeneration, ImageFile, VideoGeneration, VideoFile
- Enums ImageJobStatus, VideoJobStatus
- Relations User/Organization
- Client Prisma généré

### Phase 2: Services & Helpers ✓
- `src/lib/auth.ts` étendu (subscription checks)
- `src/lib/s3-service.ts` complet (430 lignes)
- `src/hooks/useSecureAPI.ts` (auto-auth)
- `src/hooks/useS3Files.ts` (React hook)

### Phase 4: API Endpoints Fichiers ✓
- POST `/api/files/presigned-url`
- GET `/api/files/list`
- DELETE `/api/files/delete`

---

## 🔄 Phase 3: Sécurisation Routes Existantes

### Objectif
Ajouter l'authentification Clerk (`requireAuth()`) à toutes les routes API existantes et injecter le `userId` dans les requêtes database.

### Routes à Sécuriser

#### 1. Books API (`/api/books/*`)

**Fichiers à modifier:**
```
src/app/api/books/route.ts
src/app/api/books/[id]/route.ts
src/app/api/books/[id]/export/route.ts
src/app/api/books/[id]/export-formatted/route.ts
src/app/api/books/[id]/format/route.ts
```

**Pattern à appliquer:**
```typescript
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Ajouter en premier
  const user = await requireAuth();

  // Utiliser user.id dans les queries
  const books = await prisma.book.findMany({
    where: { authorId: user.id },
    // ...
  });
}
```

**Checklist:**
- [ ] GET `/api/books` - Liste books de l'utilisateur uniquement
- [ ] POST `/api/books` - Injecter `authorId: user.id`
- [ ] GET `/api/books/[id]` - Vérifier propriété
- [ ] PUT `/api/books/[id]` - Vérifier propriété
- [ ] DELETE `/api/books/[id]` - Vérifier propriété
- [ ] GET `/api/books/[id]/export` - Vérifier propriété
- [ ] GET `/api/books/[id]/export-formatted` - Vérifier propriété
- [ ] POST `/api/books/[id]/format` - Vérifier propriété

#### 2. Chapters API (`/api/chapters/*`)

**Fichiers:**
```
src/app/api/chapters/route.ts
src/app/api/chapters/[id]/route.ts
```

**Checklist:**
- [ ] GET `/api/chapters` - Filter par book.authorId
- [ ] POST `/api/chapters` - Vérifier book ownership
- [ ] GET `/api/chapters/[id]` - Vérifier ownership via book
- [ ] PUT `/api/chapters/[id]` - Vérifier ownership
- [ ] DELETE `/api/chapters/[id]` - Vérifier ownership

#### 3. Blog API (`/api/blog/*`)

**Fichiers:**
```
src/app/api/blog/route.ts
src/app/api/blog/[id]/route.ts
src/app/api/blog/generate/route.ts
src/app/api/blog/jobs/[jobId]/status/route.ts
src/app/api/blog/jobs/[jobId]/result/route.ts
```

**Checklist:**
- [ ] GET `/api/blog` - Liste articles utilisateur
- [ ] POST `/api/blog` - Injecter authorId
- [ ] GET `/api/blog/[id]` - Vérifier propriété
- [ ] PUT `/api/blog/[id]` - Vérifier propriété
- [ ] DELETE `/api/blog/[id]` - Vérifier propriété
- [ ] POST `/api/blog/generate` - Injecter authorId
- [ ] GET `/api/blog/jobs/[jobId]/status` - Vérifier ownership
- [ ] GET `/api/blog/jobs/[jobId]/result` - Vérifier ownership

#### 4. Jobs API (`/api/jobs/*`)

**Fichiers:**
```
src/app/api/jobs/route.ts
src/app/api/jobs/[id]/route.ts
src/app/api/jobs/[id]/status/route.ts
```

**Checklist:**
- [ ] GET `/api/jobs` - Liste jobs utilisateur
- [ ] POST `/api/jobs` - Injecter authorId
- [ ] GET `/api/jobs/[id]` - Vérifier propriété
- [ ] GET `/api/jobs/[id]/status` - Vérifier propriété

#### 5. Generate API (`/api/generate`)

**Fichier:**
```
src/app/api/generate/route.ts
```

**Checklist:**
- [ ] POST `/api/generate` - Injecter authorId, vérifier subscription

---

## 🔌 Phase 5: Webhooks S3 Integration

### Objectif
Modifier les webhooks de completion pour recevoir et sauvegarder les métadonnées S3 des fichiers générés par le backend.

### Webhooks à Modifier

#### 1. Book Completion (`/api/webhooks/book-completion`)

**Modifications:**
```typescript
interface BookWebhookPayload {
  job_id: string;
  status: 'completed' | 'failed';
  book_data?: {
    title: string;
    chapters: Array<{
      title: string;
      content: string;
      order: number;
    }>;
    // NOUVEAUX CHAMPS S3
    files?: Array<{
      format: 'PDF' | 'EPUB' | 'DOCX';
      s3_key: string;
      s3_bucket: string;
      file_size: number;
      filename: string;
    }>;
  };
}

// Sauvegarder dans Book model
await prisma.book.update({
  where: { id: bookId },
  data: {
    storageProvider: 'AWS_S3',
    s3Bucket: file.s3_bucket,
    s3Key: file.s3_key, // Fichier principal (PDF)
  }
});
```

**Checklist:**
- [ ] Accepter `files` array dans payload
- [ ] Sauvegarder s3_key, s3_bucket dans Book
- [ ] Générer presigned URL si besoin
- [ ] Mettre à jour status vers COMPLETED

#### 2. Blog Completion (`/api/webhooks/blog-completion`)

**Modifications similaires:**
```typescript
interface BlogWebhookPayload {
  job_id: string;
  status: 'completed' | 'failed';
  blog_data?: {
    title: string;
    content: string;
    // NOUVEAUX CHAMPS S3
    files?: Array<{
      format: 'HTML' | 'MARKDOWN' | 'PDF';
      s3_key: string;
      s3_bucket: string;
      file_size: number;
    }>;
  };
}
```

**Checklist:**
- [ ] Accepter `files` array
- [ ] Sauvegarder s3_key, s3_bucket dans BlogArticle
- [ ] Générer presigned URL

#### 3. Image Completion (NOUVEAU: `/api/webhooks/image-completion`)

**À créer:**
```typescript
interface ImageWebhookPayload {
  generation_id: string;
  status: 'completed' | 'failed';
  images?: Array<{
    s3_key: string;
    s3_bucket: string;
    filename: string;
    file_size: number;
    width: number;
    height: number;
    format: string;
  }>;
}

// Créer ImageFile pour chaque image
await prisma.imageGeneration.update({
  where: { id: generation_id },
  data: {
    status: 'COMPLETED',
    completedAt: new Date(),
    images: {
      createMany: {
        data: images.map(img => ({
          filename: img.filename,
          s3Key: img.s3_key,
          fileSize: img.file_size,
          width: img.width,
          height: img.height,
          format: img.format,
          aspectRatio: `${img.width}:${img.height}`,
        }))
      }
    }
  }
});
```

**Checklist:**
- [ ] Créer route `/api/webhooks/image-completion`
- [ ] Valider webhook secret
- [ ] Parser payload images
- [ ] Créer ImageFile records
- [ ] Mettre à jour ImageGeneration status

#### 4. Video Completion (NOUVEAU: `/api/webhooks/video-completion`)

**À créer:**
```typescript
interface VideoWebhookPayload {
  generation_id: string;
  status: 'completed' | 'failed';
  videos?: Array<{
    s3_key: string;
    s3_bucket: string;
    filename: string;
    file_size: number;
    duration_seconds: number;
    aspect_ratio: string;
    width: number;
    height: number;
    remote_uri?: string;
  }>;
}
```

**Checklist:**
- [ ] Créer route `/api/webhooks/video-completion`
- [ ] Valider webhook secret
- [ ] Parser payload videos
- [ ] Créer VideoFile records
- [ ] Mettre à jour VideoGeneration status

---

## 🎨 Phase 6: UI Components

### 1. Mettre à Jour BookList

**Fichier:** `src/components/BookList.tsx`

**Modifications:**
- [ ] Remplacer liens directs par presigned URLs
- [ ] Ajouter bouton "Download PDF" avec `useS3Files`
- [ ] Afficher taille fichier et dernière modification
- [ ] Gérer état loading pendant génération URL

**Code Example:**
```typescript
import { useS3Files } from '@/hooks/useS3Files';

function BookItem({ book }: { book: Book }) {
  const { getDownloadUrl } = useS3Files();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!book.s3Key) return;
    
    setDownloading(true);
    try {
      const url = await getDownloadUrl(book.s3Key);
      window.open(url, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <h3>{book.title}</h3>
      {book.s3Key && (
        <button onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Generating URL...' : 'Download PDF'}
        </button>
      )}
    </div>
  );
}
```

### 2. Mettre à Jour BlogList

**Fichier:** `src/components/BlogList.tsx`

**Modifications similaires:**
- [ ] Bouton download pour articles exportés
- [ ] Presigned URLs pour fichiers
- [ ] Badge statut (disponible/généré)

### 3. Créer ImageResults Component

**Nouveau fichier:** `src/components/ImageResults.tsx`

**Features:**
- [ ] Grid d'images générées
- [ ] Preview images via presigned URLs
- [ ] Bouton download haute résolution
- [ ] Bouton delete avec confirmation
- [ ] Loading states
- [ ] Erreur handling

**Structure:**
```typescript
interface ImageResultsProps {
  generationId: string;
}

export function ImageResults({ generationId }: ImageResultsProps) {
  const [generation, setGeneration] = useState<ImageGeneration | null>(null);
  const { getDownloadUrl, deleteFile } = useS3Files({ contentType: 'image' });

  // Charger la génération avec images
  useEffect(() => {
    async function load() {
      const data = await fetch(`/api/images/${generationId}`).then(r => r.json());
      setGeneration(data);
    }
    load();
  }, [generationId]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {generation?.images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onDownload={() => getDownloadUrl(image.s3Key)}
          onDelete={() => deleteFile(image.s3Key)}
        />
      ))}
    </div>
  );
}
```

### 4. Créer VideoResults Component

**Nouveau fichier:** `src/components/VideoResults.tsx`

**Features:**
- [ ] Liste vidéos générées
- [ ] Player video avec presigned URLs
- [ ] Bouton download MP4
- [ ] Afficher durée, résolution
- [ ] Progress bar génération

### 5. Créer FileManager Component

**Nouveau fichier:** `src/components/FileManager.tsx`

**Features:**
- [ ] Vue unifiée tous fichiers utilisateur
- [ ] Filtres par type (books, blog, images, videos)
- [ ] Tri par date, taille, nom
- [ ] Actions bulk (delete multiple)
- [ ] Upload zone
- [ ] Statistiques storage

---

## 🧪 Phase 7: Tests & Validation

### Tests Unitaires

**Créer:** `src/lib/__tests__/s3-service.test.ts`

```typescript
describe('S3 Service', () => {
  test('buildS3Path génère bon format', () => {
    const path = buildS3Path('user_123', 'book', 'test.pdf');
    expect(path).toBe('user_123/books/test.pdf');
  });

  test('extractUserIdFromS3Key extrait userId', () => {
    const userId = extractUserIdFromS3Key('user_123/books/test.pdf');
    expect(userId).toBe('user_123');
  });

  test('generateUniqueFilename ajoute timestamp', () => {
    const filename = generateUniqueFilename('test.pdf');
    expect(filename).toMatch(/test_\d+\.pdf/);
  });
});
```

### Tests d'Intégration

**Créer:** `src/__tests__/api/files.test.ts`

```typescript
describe('Files API', () => {
  test('POST /api/files/presigned-url requiert auth', async () => {
    const response = await fetch('/api/files/presigned-url', {
      method: 'POST',
      body: JSON.stringify({ s3Key: 'test' }),
    });
    expect(response.status).toBe(401);
  });

  test('GET /api/files/list retourne fichiers user', async () => {
    const response = await authenticatedFetch('/api/files/list');
    const data = await response.json();
    expect(data.files).toBeInstanceOf(Array);
  });
});
```

### Tests E2E

**Créer:** `e2e/s3-workflow.spec.ts` (Playwright)

```typescript
test('Workflow complet upload-download-delete', async ({ page }) => {
  // Login
  await page.goto('/sign-in');
  await loginWithClerk(page);

  // Upload
  await page.goto('/test-s3');
  await page.setInputFiles('input[type="file"]', 'test-image.png');
  await page.click('button:has-text("Upload")');
  await expect(page.locator('.success')).toBeVisible();

  // Download
  await page.click('button:has-text("Download")');
  // Vérifier téléchargement

  // Delete
  await page.click('button:has-text("Delete")');
  await page.click('button:has-text("Confirm")');
  await expect(page.locator('.file-item')).not.toBeVisible();
});
```

---

## 📝 Documentation Finale

### 1. README.md Section S3

Ajouter section dans README principal:

```markdown
## 🗄️ Storage avec AWS S3

### Configuration

1. Créer bucket S3 `sorami-content`
2. Configurer CORS et IAM user
3. Variables d'environnement:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `S3_BUCKET=sorami-content`

### Architecture

- Structure: `user_{userId}/{contentType}s/{filename}`
- Presigned URLs (expiration 1h)
- Authentification Clerk requise
- Vérification propriété automatique

### Usage

\`\`\`typescript
import { useS3Files } from '@/hooks/useS3Files';

const { uploadFile, downloadFile } = useS3Files({ contentType: 'image' });

// Upload
await uploadFile(file);

// Download
await downloadFile(s3Key, filename);
\`\`\`
```

### 2. API Documentation

**Créer:** `docs/API_S3.md`

Documenter tous les endpoints S3 avec:
- Request/Response schemas
- Exemples curl
- Codes d'erreur
- Rate limits

### 3. Migration Guide

**Créer:** `docs/MIGRATION_S3.md`

Guide pour migrer fichiers existants vers S3:

```bash
# Script migration
npm run migrate:s3

# Vérifier migration
npm run verify:s3
```

---

## ⚡ Quick Start Next Steps

### Immédiat (1-2 heures)
1. Sécuriser `/api/books/*` (30 min)
2. Sécuriser `/api/blog/*` (30 min)
3. Créer `/api/webhooks/image-completion` (30 min)

### Court terme (1 jour)
1. Modifier tous les webhooks pour S3
2. Créer ImageResults component
3. Tests basiques

### Moyen terme (2-3 jours)
1. Créer VideoResults component
2. FileManager component complet
3. Tests E2E
4. Documentation

---

## 🎯 Objectifs Finaux

- [x] ✅ Modèles Prisma complets
- [x] ✅ Service S3 opérationnel
- [x] ✅ Endpoints fichiers sécurisés
- [ ] 🔄 Toutes routes API sécurisées
- [ ] 🔄 Webhooks avec S3
- [ ] 🔄 UI components mis à jour
- [ ] 🔄 Tests complets
- [ ] 🔄 Documentation finale

**Prochain fichier à modifier:** `src/app/api/books/route.ts`
