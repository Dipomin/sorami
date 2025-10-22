# 🔐 Plan de Sécurisation Clerk + AWS S3

## Objectif
Sécuriser l'ensemble de l'application avec authentification Clerk et stockage AWS S3 pour tous les contenus générés (livres, blogs, images, vidéos).

## Phase 1: Ajout des modèles de données ✅

### Nouveaux modèles Prisma à ajouter

#### 1. ImageGeneration
```prisma
model ImageGeneration {
  id              String      @id @default(cuid())
  
  // Informations de base
  prompt          String      @db.Text
  inputImageUrl   String?     @db.Text
  
  // Configuration
  numImages       Int         @default(1)
  size            String      @default("1024x1024")
  format          String      @default("PNG")
  style           String?
  quality         String      @default("standard")
  
  // Résultats
  images          ImageFile[]
  
  // Statut
  status          JobStatus   @default(PENDING)
  error           String?     @db.Text
  progress        Int         @default(0)
  
  // Métadonnées IA
  model           String      @default("gemini-2.0-flash-exp")
  modelVersion    String?
  processingTime  Float?
  
  // Relations utilisateur/organisation
  authorId        String
  organizationId  String?
  
  // Stockage S3
  storageProvider StorageProvider @default(S3)
  s3Bucket        String?
  
  // Métadonnées
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  completedAt     DateTime?
  
  // Relations
  author          User        @relation(fields: [authorId], references: [id])
  organization    Organization? @relation(fields: [organizationId], references: [id])
  
  @@map("image_generations")
}

model ImageFile {
  id              String      @id @default(cuid())
  
  // Fichier
  filename        String
  s3Key           String      @unique
  fileUrl         String?     @db.Text
  fileSize        Int
  format          String
  
  // Dimensions
  width           Int
  height          Int
  aspectRatio     String
  
  // Métadonnées
  metadata        Json?
  createdAt       DateTime    @default(now())
  
  // Relations
  generationId    String
  generation      ImageGeneration @relation(fields: [generationId], references: [id], onDelete: Cascade)
  
  @@map("image_files")
}
```

#### 2. VideoGeneration
```prisma
model VideoGeneration {
  id              String      @id @default(cuid())
  
  // Informations de base
  prompt          String      @db.Text
  inputImageBase64 String?    @db.LongText
  
  // Configuration
  aspectRatio     String      @default("16:9")
  numberOfVideos  Int         @default(1)
  durationSeconds Int         @default(8)
  personGeneration String     @default("ALLOW_ALL")
  
  // Résultats
  videos          VideoFile[]
  
  // Statut
  status          VideoJobStatus @default(PENDING)
  error           String?     @db.Text
  progress        Int         @default(0)
  message         String?     @db.Text
  
  // Métadonnées IA
  model           String      @default("veo-2.0-generate-001")
  modelVersion    String      @default("2.0")
  processingTime  Float?
  generationTime  Float?
  downloadTime    Float?
  
  // Relations utilisateur/organisation
  authorId        String
  organizationId  String?
  
  // Stockage S3
  storageProvider StorageProvider @default(S3)
  s3Bucket        String?
  
  // Métadonnées
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  completedAt     DateTime?
  
  // Relations
  author          User        @relation(fields: [authorId], references: [id])
  organization    Organization? @relation(fields: [organizationId], references: [id])
  
  @@map("video_generations")
}

model VideoFile {
  id              String      @id @default(cuid())
  
  // Fichier
  filename        String
  s3Key           String      @unique
  fileUrl         String?     @db.Text
  filePath        String?     @db.Text
  fileSize        Int
  format          String      @default("mp4")
  
  // Propriétés vidéo
  durationSeconds Int
  aspectRatio     String
  width           Int
  height          Int
  
  // Remote URI (Google)
  remoteUri       String?     @db.Text
  
  // Métadonnées
  metadata        Json?
  createdAt       DateTime    @default(now())
  
  // Relations
  generationId    String
  generation      VideoGeneration @relation(fields: [generationId], references: [id], onDelete: Cascade)
  
  @@map("video_files")
}
```

#### 3. Nouveaux Enums
```prisma
enum VideoJobStatus {
  PENDING
  PROCESSING
  GENERATING
  DOWNLOADING
  COMPLETED
  FAILED
}

enum StorageProvider {
  LOCAL
  S3
  AZURE
  GCS
}

enum JobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}
```

### Modifications des modèles existants

#### User - Ajouter relations
```prisma
model User {
  // ... existing fields
  
  imageGenerations ImageGeneration[]
  videoGenerations VideoGeneration[]
}
```

#### Organization - Ajouter relations
```prisma
model Organization {
  // ... existing fields
  
  imageGenerations ImageGeneration[]
  videoGenerations VideoGeneration[]
}
```

## Phase 2: Services et Utilitaires

### 1. Service S3 (Frontend)
Fichier: `src/lib/s3-service.ts`

Fonctions:
- `uploadToS3()` - Upload fichier vers S3
- `getPresignedUrl()` - Générer URL temporaire
- `deleteFromS3()` - Supprimer fichier
- `listUserFiles()` - Lister les fichiers utilisateur

### 2. Helper d'authentification
Fichier: `src/lib/auth-helper.ts` ✅ (Déjà créé)

Fonctions:
- `requireAuth()` ✅
- `getAuthenticatedUser()` ✅
- `hasSubscription()` ✅
- `hasFeatureAccess()` ✅

### 3. Hook API sécurisé
Fichier: `src/hooks/useSecureAPI.ts` ✅ (Déjà créé)

Fonctions:
- `useSecureAPI()` ✅
- `get()`, `post()`, `put()`, `delete()` ✅
- `uploadFile()` ✅

## Phase 3: Sécurisation des Routes API

### Routes à sécuriser avec Clerk

#### Books
- ✅ `/api/books` - GET (liste)
- ✅ `/api/books` - POST (création)
- ✅ `/api/books/[id]` - GET, PATCH, DELETE
- ✅ `/api/books/[id]/export` - GET
- ✅ `/api/books/[id]/format` - POST

#### Blog
- ✅ `/api/blog` - GET, POST
- ✅ `/api/blog/[id]` - GET, PATCH, DELETE
- ✅ `/api/blog/generate` - POST

#### Chapters
- ✅ `/api/chapters` - POST
- ✅ `/api/chapters/[id]` - GET, PATCH, DELETE

#### Jobs
- ✅ `/api/jobs` - GET
- ✅ `/api/jobs/[id]` - GET
- ✅ `/api/jobs/[id]/status` - GET

#### Files (Nouveau)
- 🆕 `/api/files` - GET (liste des fichiers utilisateur)
- 🆕 `/api/files/[id]` - GET (télécharger via presigned URL)
- 🆕 `/api/files/[id]` - DELETE

## Phase 4: Intégration S3 dans la Génération

### Modification des webhooks pour inclure S3

#### Book Completion Webhook
- Recevoir les infos S3 du backend
- Sauvegarder en base: `s3Bucket`, `s3Key`
- Générer presigned URL pour download

#### Blog Completion Webhook  
- Recevoir les infos S3 du backend
- Sauvegarder en base: `s3Bucket`, `s3Key`
- Générer presigned URL pour download

#### Image Completion Webhook
- Recevoir les infos S3 du backend
- Créer records ImageFile avec s3Key
- Générer presigned URLs

#### Video Completion Webhook
- Recevoir les infos S3 du backend
- Créer records VideoFile avec s3Key
- Générer presigned URLs

## Phase 5: Mise à jour UI

### Composants à modifier

#### BookList
- ✅ Vérifier auth avec `useAuth()`
- 🆕 Afficher bouton download S3
- 🆕 Utiliser presigned URLs

#### BlogList
- ✅ Vérifier auth avec `useAuth()`
- 🆕 Afficher bouton download S3
- 🆕 Utiliser presigned URLs

#### ImageResults
- ✅ Vérifier auth avec `useAuth()`
- 🆕 Afficher depuis S3 URLs
- 🆕 Bouton download S3

#### VideoResults
- ✅ Vérifier auth avec `useAuth()`
- 🆕 Afficher vidéos depuis S3
- 🆕 Bouton download S3

### Nouveaux Composants

#### FileManager
- Liste tous les fichiers de l'utilisateur
- Filtrage par type (book, blog, image, video)
- Actions: download, delete
- Pagination

## Phase 6: Variables d'environnement

### Frontend (.env.local)
```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:9006

# AWS S3 (optionnel côté frontend)
NEXT_PUBLIC_S3_BUCKET=sorami-generated-content
NEXT_PUBLIC_S3_REGION=eu-west-3
```

### Backend (.env)
```bash
# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_ISSUER=https://your-app.clerk.accounts.dev
CLERK_JWKS_URL=https://your-app.clerk.accounts.dev/.well-known/jwks.json

# AWS S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-3
S3_BUCKET_NAME=sorami-generated-content
PRESIGNED_URL_EXPIRATION=3600

# Webhooks
WEBHOOK_SECRET=sorami-webhook-secret-key-2025
```

## Checklist de Migration

### Prisma
- [ ] Ajouter modèles ImageGeneration, ImageFile
- [ ] Ajouter modèles VideoGeneration, VideoFile
- [ ] Ajouter enums VideoJobStatus, StorageProvider, JobStatus
- [ ] Ajouter relations dans User et Organization
- [ ] Run: `npx prisma generate`
- [ ] Run: `npx prisma db push` (dev) ou `npx prisma migrate dev` (prod)

### Auth & S3 Services
- [x] Créer `src/lib/auth.ts` avec fonctions Clerk
- [x] Créer `src/hooks/useSecureAPI.ts`
- [ ] Créer `src/lib/s3-service.ts`
- [ ] Créer `src/lib/prisma-s3.ts` (helpers Prisma + S3)

### API Routes
- [ ] Sécuriser `/api/books/*`
- [ ] Sécuriser `/api/blog/*`
- [ ] Sécuriser `/api/chapters/*`
- [ ] Sécuriser `/api/jobs/*`
- [ ] Créer `/api/files/*`
- [ ] Mettre à jour webhooks pour S3

### UI Components
- [ ] Mettre à jour BookList avec S3
- [ ] Mettre à jour BlogList avec S3
- [ ] Mettre à jour ImageResults avec S3
- [ ] Mettre à jour VideoResults avec S3
- [ ] Créer FileManager
- [ ] Créer DownloadButton (presigned URL)

### Tests
- [ ] Tester authentification Clerk
- [ ] Tester upload S3
- [ ] Tester presigned URLs
- [ ] Tester suppression fichiers
- [ ] Tester permissions par tier

### Documentation
- [ ] Documenter les changements
- [ ] Créer guide de migration
- [ ] Mettre à jour README

## Prochaines Étapes

1. **Maintenant**: Ajouter les modèles Prisma
2. **Ensuite**: Créer le service S3
3. **Puis**: Sécuriser les routes API
4. **Enfin**: Mettre à jour l'UI

## Notes Importantes

- ⚠️ **Ne jamais exposer les clés AWS côté frontend**
- ⚠️ **Toujours vérifier l'ownership avant delete/download**
- ⚠️ **Utiliser presigned URLs avec expiration courte (1h max)**
- ⚠️ **Logger tous les accès aux fichiers pour audit**
- ⚠️ **Implémenter rate limiting sur les endpoints sensibles**
