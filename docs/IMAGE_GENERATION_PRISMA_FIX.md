# Fix de Génération d'Images - Intégration Prisma

## 🐛 Problème Identifié

L'image était générée avec succès par le backend Flask, mais :
- ❌ Elle n'était pas insérée dans la base de données Prisma
- ❌ Elle n'était pas affichée sur la page
- ⚠️ Le webhook recevait un `job_id` qui n'existait pas dans Prisma

### Logs d'Erreur
```
⚠️ [Image Webhook] ImageGeneration non trouvée pour job_id: f14e6134-15eb-4b39-ac03-2555e799e083
ℹ️ Le job a peut-être été créé directement dans le backend sans passer par l'API Next.js
```

### Cause Racine
L'ancien flux appelait **directement** le backend Flask :
```
Client → Backend Flask → Génération → Webhook → ❌ Pas d'entrée Prisma
```

Le backend Flask créait son propre `job_id`, mais cette entrée n'existait jamais dans la base Prisma.

## ✅ Solution Implémentée

### Nouveau Flux d'Architecture
```
Client → Next.js API → Prisma (création) → Backend Flask → Génération → Webhook → Prisma (mise à jour)
```

### 1️⃣ Nouvelle Route API Next.js
**Fichier**: `src/app/api/images/generate/route.ts`

Cette route agit comme **proxy intelligent** :
1. ✅ Authentifie l'utilisateur avec Clerk
2. ✅ Crée l'entrée `ImageGeneration` dans Prisma
3. ✅ Envoie la requête au backend Flask avec le `job_id` Prisma
4. ✅ Retourne le `job_id` au client

```typescript
// AVANT (direct backend)
fetch('http://localhost:9006/api/images/generate', ...)

// APRÈS (via Next.js)
fetch('/api/images/generate', ...)
```

### 2️⃣ Mise à Jour de l'API Client
**Fichier**: `src/lib/api-client.ts`

```typescript
export async function createImageGeneration(
  data: ImageGenerationRequest, 
  token: string
): Promise<ImageGenerationJobResponse> {
  // Utiliser l'API Next.js au lieu du backend direct
  const response = await fetch('/api/images/generate', {
    method: 'POST',
    headers: createAuthHeaders(token),
    body: JSON.stringify(data),
  });
  // ...
}
```

### 3️⃣ Amélioration du Webhook
**Fichier**: `src/app/api/webhooks/image-completion/route.ts`

**Changements** :
- ✅ Utilise `findUnique()` au lieu de `findFirst()` (plus performant)
- ✅ Gère mieux les cas où l'entrée Prisma existe

```typescript
// AVANT
const imageGeneration = await prisma.imageGeneration.findFirst({
  where: { id: payload.job_id }
});

// APRÈS
const imageGeneration = await prisma.imageGeneration.findUnique({
  where: { id: payload.job_id }
});
```

## 📊 Schéma Prisma (Référence)

```prisma
model ImageGeneration {
  id String @id @default(cuid())
  
  // Informations de base
  prompt        String  @db.Text
  inputImageUrl String? @db.Text
  
  // Configuration
  numImages Int     @default(1)
  size      String  @default("1024x1024")
  format    String  @default("PNG")
  style     String?
  quality   String  @default("standard")
  
  // Relations
  images ImageFile[]
  author User @relation(fields: [authorId], references: [id])
  
  // Statut
  status   ImageJobStatus @default(PENDING)
  progress Int            @default(0)
  
  @@map("image_generations")
}
```

## 🧪 Tests

### Test Manuel via Interface
1. Se connecter à l'application
2. Aller sur `/generate-images`
3. Remplir le formulaire et soumettre
4. Vérifier dans les logs :
   - ✅ `ImageGeneration créée: { id: ..., authorId: ... }`
   - ✅ `Envoi au backend Flask...`
   - ✅ Webhook reçoit et trouve l'entrée Prisma

### Test via Script
```bash
./test-image-nextjs.sh
```

### Vérification en Base de Données
```sql
-- Voir toutes les générations d'images
SELECT id, prompt, status, progress, createdAt 
FROM image_generations 
ORDER BY createdAt DESC 
LIMIT 10;

-- Voir les images d'une génération
SELECT * FROM image_files 
WHERE generationId = 'votre-job-id';
```

## 🔄 Flux Complet (Avec Succès)

### 1. Création de la Tâche
```
POST /api/images/generate
Authorization: Bearer <clerk_token>
Body: { prompt, style, quality, ... }

→ Prisma.create(ImageGeneration)
→ Backend Flask POST /api/images/generate (avec job_id)
→ Response: { job_id, status: 'PENDING', ... }
```

### 2. Polling du Statut
```
GET /api/images/{job_id}/status
→ Prisma.findUnique(ImageGeneration)
→ Response: { status: 'GENERATING', progress: 60, ... }
```

### 3. Réception du Webhook
```
POST /api/webhooks/image-completion
Body: { job_id, status: 'completed', data: { images: [...] } }

→ Prisma.update(ImageGeneration, status='COMPLETED')
→ Prisma.create(ImageFile[])
→ Prisma.create(Notification)
→ Response: { success: true }
```

### 4. Récupération des Résultats
```
GET /api/images/{job_id}/result
→ Prisma.findUnique(ImageGeneration, include: images)
→ Response: { images: [...], metadata: {...} }
```

## 🎯 Points Clés

1. **Job ID Unifié** : Le même `job_id` (CUID Prisma) est utilisé partout
2. **Prisma First** : Toujours créer l'entrée Prisma AVANT d'appeler le backend
3. **Webhook Compatible** : Le webhook trouve maintenant l'entrée Prisma
4. **Organisation Support** : Gère automatiquement l'organisation de l'utilisateur
5. **Idempotence** : Le webhook évite le double traitement (fenêtre 5 min)

## 📝 Fichiers Modifiés

- ✅ `src/app/api/images/generate/route.ts` (NOUVEAU)
- ✅ `src/lib/api-client.ts` (modifié)
- ✅ `src/app/api/webhooks/image-completion/route.ts` (amélioré)
- ✅ `test-image-nextjs.sh` (NOUVEAU)

## 🚀 Prochaines Étapes

1. ✅ Tester la génération d'images via l'interface
2. ✅ Vérifier que les images apparaissent dans la galerie
3. ✅ Vérifier que les notifications sont créées
4. 🔄 Optimiser le polling (WebSocket possible ?)
5. 🔄 Ajouter des tests unitaires

## 🔗 Voir Aussi

- `IMAGE_GENERATION_ARCHITECTURE.md` - Architecture globale
- `IMAGE_WEBHOOK_DOCUMENTATION.md` - Documentation du webhook
- `schema.prisma` - Schéma de base de données
