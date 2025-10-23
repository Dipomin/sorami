# 🔍 Analyse Complète du Processus de Génération d'Images et Vidéos

## 📋 Table des Matières
1. [Processus de Génération d'Images](#processus-images)
2. [Processus de Génération de Vidéos](#processus-videos)
3. [Points de Vérification](#verifications)
4. [Problèmes Potentiels Identifiés](#problemes)
5. [Recommandations](#recommandations)

---

## 🎨 Processus de Génération d'Images {#processus-images}

### 1️⃣ Formulaire (ImageGenerationForm.tsx)

**État Initial** :
```typescript
{
  prompt: "",
  input_image_url: "",
  num_images: 1,
  size: "1024x1024",
  format: "PNG",
  style: "photorealistic",
  quality: "high"
}
```

**Validation** :
- ✅ Prompt requis (required)
- ✅ Disabled si isLoading
- ⚠️ input_image_url optionnel (supprimé si vide)

**Soumission** :
```typescript
handleSubmit → onSubmit(submitData)
```

---

### 2️⃣ Hook useImageGeneration

**Fichier** : `src/hooks/useImageGeneration.ts`

**Étapes** :
1. **Vérification Auth** :
   ```typescript
   if (!isLoaded) throw Error('Authentification non chargée')
   if (!isSignedIn) throw Error('Vous devez être connecté')
   ```

2. **Token Clerk** :
   ```typescript
   const token = await getToken()
   if (!token) throw Error('Token manquant')
   ```

3. **Création du Job** :
   ```typescript
   const jobResponse = await createImageGeneration(request, token)
   // jobResponse: { job_id, status, message }
   ```

4. **Polling du Statut** :
   ```typescript
   pollImageGenerationStatus(job_id, token, onProgress)
   // Attend jusqu'à COMPLETED ou FAILED
   ```

---

### 3️⃣ API Client (lib/api-client.ts)

#### createImageGeneration()
```typescript
POST /api/images/generate
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ${token}'
}
Body: ImageGenerationRequest
```

**Response** :
```typescript
{
  job_id: string,  // ✨ CUID Prisma
  status: string,
  message: string,
  created_at: string
}
```

---

### 4️⃣ Next.js API Route (api/images/generate/route.ts)

**Étapes** :

1. **Authentification** :
   ```typescript
   const user = await requireAuth()
   ```

2. **Récupération Organisation** :
   ```typescript
   const organizationMember = await prisma.organizationMember.findFirst({
     where: { userId: user.id }
   })
   ```

3. **Création dans Prisma** :
   ```typescript
   const imageGeneration = await prisma.imageGeneration.create({
     data: {
       authorId: user.id,
       organizationId: organizationId,
       prompt: data.prompt,
       inputImageUrl: data.input_image_url || null,
       numImages: data.num_images || 1,
       size: data.size || '1024x1024',
       format: data.format || 'PNG',
       style: data.style || 'photorealistic',
       quality: data.quality || 'standard',
       model: 'gemini-2.5-flash-image',
       status: 'PENDING',
       progress: 0,
       message: 'Initialisation...'
     }
   })
   ```

4. **Appel Backend Flask** :
   ```typescript
   const backendPayload = {
     ...data,
     job_id: imageGeneration.id,  // ✨ ID Prisma
     user_id: user.id
   }
   
   POST ${BACKEND_API_URL}/api/images/generate
   ```

5. **Retour** :
   ```typescript
   {
     job_id: imageGeneration.id,
     status: 'PENDING',
     message: 'Génération démarrée',
     created_at: imageGeneration.createdAt.toISOString()
   }
   ```

---

### 5️⃣ Backend Flask (Python)

⚠️ **ATTENTION** : Le backend doit accepter `job_id` dans la requête

**Attendu** :
```python
@app.route('/api/images/generate', methods=['POST'])
def generate_images():
    data = request.json
    job_id = data.get('job_id')  # ✨ ID de Next.js/Prisma
    prompt = data.get('prompt')
    
    # Générer les images avec Gemini
    images = generate_with_gemini(prompt, ...)
    
    # Envoyer webhook avec le même job_id
    send_webhook(job_id, images)
```

---

### 6️⃣ Webhook (api/webhooks/image-completion/route.ts)

**Réception** :
```typescript
POST /api/webhooks/image-completion
Body: {
  job_id: string,
  status: 'completed' | 'failed' | ...,
  data?: {
    images: [...],
    metadata: {...}
  }
}
```

**Traitement** :

1. **Vérification Secret** (production) :
   ```typescript
   if (ENVIRONMENT === 'production') {
     const secret = request.headers.get('X-Webhook-Secret')
     if (secret !== WEBHOOK_SECRET) return 401
   }
   ```

2. **Idempotence** :
   ```typescript
   if (processedJobs.has(job_id)) return 'Déjà traité'
   ```

3. **Mise à jour Prisma** :
   ```typescript
   // Trouver ImageGeneration
   const imageGeneration = await prisma.imageGeneration.findUnique({
     where: { id: payload.job_id }
   })
   
   // Mettre à jour statut
   await prisma.imageGeneration.update({
     where: { id: payload.job_id },
     data: {
       status: 'COMPLETED',
       progress: 100,
       completedAt: new Date(),
       model: metadata.model_name,
       processingTime: metadata.generation_time_seconds
     }
   })
   
   // Créer ImageFile pour chaque image
   for (const image of data.images) {
     await prisma.imageFile.create({
       data: {
         generationId: imageGeneration.id,
         filename: image.file_path.split('/').pop(),
         s3Key: image.file_path,
         fileUrl: image.url,  // ✨ URL S3
         fileSize: image.size_bytes,
         format: image.format,
         width: dimensions[0],
         height: dimensions[1],
         aspectRatio: image.dimensions
       }
     })
   }
   
   // Créer Notification
   await prisma.notification.create({
     data: {
       userId: imageGeneration.authorId,
       type: 'IMAGE_COMPLETED',
       title: '🎨 Images générées',
       message: `${images.length} image(s) créée(s)`
     }
   })
   ```

---

### 7️⃣ Polling (Côté Frontend)

**Fichier** : `lib/api-client.ts`

```typescript
pollImageGenerationStatus(job_id, token, onProgress) {
  while (attempts < maxAttempts) {
    const status = await fetchImageStatus(job_id, token)
    
    onProgress(status)  // Mise à jour UI
    
    if (status.status === 'COMPLETED') {
      return await fetchImageResult(job_id, token)
    }
    
    if (status.status === 'FAILED') {
      throw Error(status.message)
    }
    
    await sleep(2000)  // 2 secondes entre chaque vérification
  }
}
```

**Routes utilisées** :
- `GET /api/images/${job_id}/status` → Statut actuel
- `GET /api/images/${job_id}/result` → Résultat final avec images

---

### 8️⃣ Affichage des Résultats

**Composant** : `ImageResults.tsx`

```typescript
{result.images.map(image => (
  <img src={image.url} />  // ✨ URL S3 depuis Prisma
))}
```

---

### 9️⃣ Galerie Historique

**Composant** : `UserImagesGallery.tsx`

**Chargement** :
```typescript
GET /api/images/user
Authorization: Bearer ${token}

Response: {
  generations: [
    {
      id: string,
      prompt: string,
      images: [
        { fileUrl: string, ... }
      ]
    }
  ]
}
```

**Affichage** :
```typescript
{generations.map(gen => 
  gen.images.map(img => 
    <img src={img.fileUrl} />  // ✨ URL S3 depuis Prisma
  )
)}
```

---

## 🎬 Processus de Génération de Vidéos {#processus-videos}

### Structure Similaire aux Images

**Différences clés** :

1. **Formulaire** : `VideoGenerationForm.tsx`
   - `prompt` (requis)
   - `aspect_ratio`: "16:9" | "9:16" | "1:1"
   - `duration_seconds`: 8
   - `number_of_videos`: 1
   - `person_generation`: "ALLOW_ALL" | "DONT_ALLOW"
   - `input_image_base64`: Base64 optionnel

2. **API Backend** : `BACKEND_API_URL/api/videos/generate`
   - ⚠️ **Pas de route Next.js intermédiaire** (contrairement aux images)
   - Appel direct au backend Flask

3. **Webhook** : `/api/webhooks/video-completion`

4. **Modèles Prisma** :
   ```prisma
   model VideoGeneration {
     id String @id @default(cuid())
     prompt String
     aspectRatio String
     durationSeconds Int
     status VideoJobStatus
     videos VideoFile[]
     // ...
   }
   
   model VideoFile {
     id String @id @default(cuid())
     generationId String
     s3Key String
     fileUrl String
     fileSize Int
     format String
     durationSeconds Float
     // ...
   }
   ```

---

## ✅ Points de Vérification {#verifications}

### 🎨 Images

#### ✅ **Ce qui fonctionne** :
1. Formulaire avec validation
2. Authentification Clerk
3. Création d'entrée Prisma AVANT appel backend
4. Job ID unifié (Prisma CUID)
5. Webhook trouve l'entrée Prisma
6. Stockage des ImageFile avec URLs S3
7. Création de notifications
8. Affichage des résultats immédiats
9. Galerie historique avec rechargement auto

#### ⚠️ **À vérifier** :
1. **Backend Flask accepte-t-il le `job_id` ?**
   - Si non → Webhook ne trouvera pas l'entrée
   
2. **URLs S3 sont-elles accessibles ?**
   - Vérifier que `image.url` du backend est bien stocké dans `fileUrl`
   
3. **Gestion des erreurs** :
   - Timeout du polling (30 tentatives × 2s = 60s)
   - Erreurs backend (status 500)
   - Images manquantes dans webhook

---

### 🎬 Vidéos

#### ⚠️ **PROBLÈME MAJEUR IDENTIFIÉ** :
**Pas de route API Next.js intermédiaire pour les vidéos !**

**Flux actuel** :
```
Client → Backend Flask direct → Génération → Webhook
                                              ↓
                                    ❌ VideoGeneration pas créée dans Prisma
```

**Conséquence** :
- Le webhook reçoit un `job_id` du backend Flask
- Aucune entrée `VideoGeneration` n'existe dans Prisma avec cet ID
- Même erreur que pour les images avant le fix !

#### ✅ **Ce qui fonctionne** :
1. Formulaire de génération
2. Upload d'image de référence (base64)
3. Appel au backend Flask

#### ❌ **Ce qui ne fonctionne PAS** :
1. Pas de création dans Prisma avant génération
2. Webhook ne trouvera pas l'entrée
3. Vidéos non stockées en base de données
4. Pas d'historique des vidéos
5. Galerie utilisateur vide

---

## 🐛 Problèmes Potentiels Identifiés {#problemes}

### Images

1. **Backend Flask** :
   ```python
   # ⚠️ DOIT accepter job_id
   job_id = data.get('job_id') or str(uuid.uuid4())
   ```

2. **Webhook Secret** :
   ```bash
   # .env.local manquant ?
   WEBHOOK_SECRET=sorami-webhook-secret-key-2025
   ```

3. **URLs S3** :
   - Presigned URLs expirent (24h généralement)
   - URLs publiques nécessitent bucket policy

4. **Timeout Polling** :
   - 30 tentatives × 2s = 60 secondes max
   - Vidéos longues peuvent dépasser

---

### Vidéos

1. **❌ CRITIQUE : Pas de route API Next.js**
   - Fichier manquant : `src/app/api/videos/generate/route.ts`
   - Même pattern que images nécessaire

2. **Webhook VideoCompletion** :
   - Existe mais ne trouvera jamais l'entrée Prisma

3. **Base64 Image** :
   - Limite de taille (généralement 5-10 MB)
   - Pas de validation de taille

4. **Galerie Vidéos** :
   - Composant existe (`UserVideosGallery`)
   - Mais aucune donnée en base

---

## 🔧 Recommandations {#recommandations}

### 🚨 Urgent - Vidéos

**1. Créer la route API Next.js pour vidéos**

Fichier : `src/app/api/videos/generate/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9006';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const data = await request.json();
    
    // 1. Créer VideoGeneration dans Prisma
    const videoGeneration = await prisma.videoGeneration.create({
      data: {
        authorId: user.id,
        organizationId: ...,
        prompt: data.prompt,
        aspectRatio: data.aspect_ratio || '16:9',
        durationSeconds: data.duration_seconds || 8,
        numberOfVideos: data.number_of_videos || 1,
        personGeneration: data.person_generation || 'ALLOW_ALL',
        status: 'PENDING',
        progress: 0,
        model: 'gemini-veo-2.0'
      }
    });
    
    // 2. Appeler backend avec job_id Prisma
    const backendPayload = {
      ...data,
      job_id: videoGeneration.id,
      user_id: user.id
    };
    
    await fetch(`${BACKEND_API_URL}/api/videos/generate`, {
      method: 'POST',
      headers: { ...request.headers },
      body: JSON.stringify(backendPayload)
    });
    
    // 3. Retourner job_id Prisma
    return NextResponse.json({
      job_id: videoGeneration.id,
      status: 'PENDING',
      message: 'Génération de vidéo démarrée'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**2. Mettre à jour api-client.ts**

```typescript
export async function createVideoGeneration(
  request: VideoGenerationRequest,
  token: string
): Promise<VideoJobResponse> {
  // Changer de:
  // const response = await fetch(`${BACKEND_API_URL}/api/videos/generate`, ...)
  
  // Vers:
  const response = await fetch('/api/videos/generate', {
    method: 'POST',
    headers: createAuthHeaders(token),
    body: JSON.stringify(request)
  });
  
  return await response.json();
}
```

---

### ✅ Images - Vérifications

**1. Tester le flux complet** :
```bash
# Terminal 1: Next.js
npm run dev

# Terminal 2: Vérifier logs
tail -f .next/trace

# Terminal 3: Tester
curl -X POST http://localhost:3000/api/images/generate \
  -H "Authorization: Bearer TOKEN" \
  -d '{"prompt": "test"}'
```

**2. Vérifier en DB** :
```sql
-- Dernières générations
SELECT * FROM image_generations 
ORDER BY createdAt DESC LIMIT 5;

-- Images associées
SELECT ig.prompt, if.fileUrl, if.fileSize
FROM image_files if
JOIN image_generations ig ON if.generationId = ig.id
ORDER BY if.createdAt DESC;
```

**3. Tester le webhook** :
```bash
./test-image-webhook.sh
```

---

### 📊 Checklist Complète

#### Images ✅
- [x] Formulaire fonctionnel
- [x] Authentification Clerk
- [x] Route API Next.js créée
- [x] Création Prisma avant backend
- [x] Job ID unifié
- [x] Webhook fonctionnel
- [x] Stockage ImageFile
- [x] Notifications
- [x] Affichage résultats
- [x] Galerie historique
- [ ] Backend accepte job_id (À VÉRIFIER)
- [ ] URLs S3 accessibles (À VÉRIFIER)
- [ ] Tests end-to-end

#### Vidéos ❌
- [x] Formulaire fonctionnel
- [x] Authentification Clerk
- [ ] **Route API Next.js** (❌ MANQUANTE)
- [ ] **Création Prisma** (❌ NON FAIT)
- [ ] **Job ID unifié** (❌ NON FAIT)
- [?] Webhook existe mais ne fonctionne pas
- [ ] Stockage VideoFile
- [ ] Notifications
- [ ] Affichage résultats
- [ ] Galerie historique
- [ ] Backend accepte job_id
- [ ] Tests end-to-end

---

## 🎯 Plan d'Action

### Phase 1: Fix Vidéos (Urgent)
1. Créer `src/app/api/videos/generate/route.ts`
2. Mettre à jour `src/lib/api-client.ts`
3. Vérifier le schéma Prisma VideoGeneration
4. Tester le flux complet

### Phase 2: Vérifications Images
1. Tester avec backend Flask réel
2. Vérifier URLs S3
3. Tester timeout/erreurs
4. Tests end-to-end

### Phase 3: Monitoring
1. Ajouter logs détaillés
2. Sentry pour erreurs
3. Analytics pour métriques
4. Alertes webhook failures

---

**Date d'analyse** : 23 octobre 2025  
**Status Images** : ✅ Implémenté (À tester avec backend)  
**Status Vidéos** : ❌ Route API manquante (Critique)
