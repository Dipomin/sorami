# Webhook de Génération d'Images - Documentation

## Vue d'ensemble

Le webhook `/api/webhooks/image-completion` reçoit les notifications du backend CrewAI lorsqu'une génération d'images est terminée (succès ou échec).

## Endpoint

```
POST /api/webhooks/image-completion
```

## Configuration

### Variables d'environnement

```bash
WEBHOOK_SECRET="sorami-webhook-secret-key-2025"
NODE_ENV="development" # ou "production"
```

### Middleware

La route est **publique** (pas d'authentification Clerk requise) mais protégée par un secret en production.

## Format du Webhook

### Payload de succès (completed)

```json
{
  "job_id": "e0145eaa-7430-4845-bf8e-df056076db14",
  "status": "completed",
  "timestamp": "2025-10-21T16:45:00Z",
  "environment": "development",
  "data": {
    "job_id": "e0145eaa-7430-4845-bf8e-df056076db14",
    "images": [
      {
        "file_path": "./generated_images/e0145eaa.../image_1.png",
        "url": "http://localhost:9006/generated_images/e0145eaa.../image_1.png",
        "description": "Un chat astronaute dans l'espace",
        "format": "PNG",
        "size_bytes": 2048576,
        "dimensions": "1024x1024"
      }
    ],
    "metadata": {
      "model_name": "gemini-2.0-flash-exp",
      "version": "latest",
      "generation_time_seconds": 12.5,
      "input_tokens": 45,
      "output_size_bytes": 2048576,
      "timestamp": "2025-10-21T16:45:00Z"
    },
    "status": "COMPLETED",
    "generated_at": "2025-10-21T16:45:00Z"
  }
}
```

### Payload d'échec (failed)

```json
{
  "job_id": "e0145eaa-7430-4845-bf8e-df056076db14",
  "status": "failed",
  "timestamp": "2025-10-21T16:45:00Z",
  "environment": "development",
  "error_message": "Clé API Google invalide",
  "message": "Échec de la génération d'images"
}
```

### Payload de progression (optionnel)

```json
{
  "job_id": "e0145eaa-7430-4845-bf8e-df056076db14",
  "status": "generating",
  "timestamp": "2025-10-21T16:44:45Z",
  "progress": 50,
  "message": "Génération en cours..."
}
```

## Statuts possibles

| Status | Description |
|--------|-------------|
| `pending` | En attente de démarrage |
| `initializing` | Initialisation du modèle Gemini |
| `generating` | Génération en cours |
| `saving` | Sauvegarde des images |
| `completed` | ✅ Terminé avec succès |
| `failed` | ❌ Échec de la génération |

## Headers requis

### En production

```http
POST /api/webhooks/image-completion
Content-Type: application/json
X-Webhook-Secret: sorami-webhook-secret-key-2025
```

### En développement

```http
POST /api/webhooks/image-completion
Content-Type: application/json
```

## Réponses

### Succès (200)

```json
{
  "success": true,
  "message": "1 image(s) générée(s) avec succès",
  "job_id": "e0145eaa-7430-4845-bf8e-df056076db14",
  "images_count": 1,
  "processing_time_ms": 125
}
```

### Erreur - Job déjà traité (200)

```json
{
  "success": true,
  "message": "Job déjà traité"
}
```

### Erreur - Secret invalide (401)

```json
{
  "error": "Unauthorized"
}
```

### Erreur - Données manquantes (400)

```json
{
  "error": "Données d'images manquantes"
}
```

### Erreur serveur (500)

```json
{
  "error": "Internal server error",
  "message": "Description de l'erreur",
  "processing_time_ms": 50
}
```

## Fonctionnalités

### 1. Idempotence

Le webhook utilise une Map en mémoire pour éviter le traitement multiple du même job :

- **Fenêtre** : 5 minutes
- **Comportement** : Si le même `job_id` arrive deux fois dans les 5 minutes, le second est ignoré

### 2. Logging détaillé

```
🎨 [Image Webhook] Réception d'un webhook de génération d'images...
📦 [Image Webhook] Payload reçu: { job_id, status, has_data, images_count }
✅ [Image Webhook] Génération réussie: { images_count, model, generation_time }
💾 [Image Webhook] Images générées: [{ url, format, dimensions, size_kb }]
⏱️ [Image Webhook] Traitement terminé en 125ms
```

### 3. Gestion des statuts intermédiaires

Le webhook accepte les statuts intermédiaires (`pending`, `initializing`, `generating`, `saving`) et renvoie un succès sans traitement complet.

### 4. Nettoyage automatique

La Map des jobs traités est nettoyée toutes les 5 minutes pour libérer la mémoire.

## Configuration du backend

Le backend CrewAI doit être configuré pour envoyer les webhooks à :

```bash
# .env du backend
WEBHOOK_URL=http://localhost:3000/api/webhooks/image-completion
WEBHOOK_SECRET=sorami-webhook-secret-key-2025
WEBHOOK_ENABLED=true
```

## Exemple d'appel (cURL)

### Développement

```bash
curl -X POST http://localhost:3000/api/webhooks/image-completion \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-123",
    "status": "completed",
    "timestamp": "2025-10-21T16:45:00Z",
    "data": {
      "job_id": "test-123",
      "images": [{
        "url": "http://localhost:9006/image.png",
        "format": "PNG",
        "dimensions": "1024x1024",
        "size_bytes": 2048576
      }],
      "metadata": {
        "model_name": "gemini-2.0-flash-exp",
        "generation_time_seconds": 12.5
      }
    }
  }'
```

### Production

```bash
curl -X POST https://your-domain.com/api/webhooks/image-completion \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: sorami-webhook-secret-key-2025" \
  -d '{
    "job_id": "prod-123",
    "status": "completed",
    "timestamp": "2025-10-21T16:45:00Z",
    "data": { ... }
  }'
```

## Test du webhook

### 1. Script de test simple

```bash
#!/bin/bash

curl -X POST http://localhost:3000/api/webhooks/image-completion \
  -H "Content-Type: application/json" \
  -d @- << EOF
{
  "job_id": "test-$(date +%s)",
  "status": "completed",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "data": {
    "job_id": "test-$(date +%s)",
    "images": [{
      "file_path": "./test.png",
      "url": "http://localhost:9006/test.png",
      "description": "Image de test",
      "format": "PNG",
      "size_bytes": 1024000,
      "dimensions": "1024x1024"
    }],
    "metadata": {
      "model_name": "gemini-2.0-flash-exp",
      "version": "latest",
      "generation_time_seconds": 10.5,
      "input_tokens": 30,
      "output_size_bytes": 1024000,
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    },
    "status": "COMPLETED",
    "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  }
}
EOF
```

### 2. Vérifier les logs

```bash
# Dans le terminal du frontend
npm run dev

# Vous devriez voir :
# 🎨 [Image Webhook] Réception d'un webhook...
# 📦 [Image Webhook] Payload reçu: ...
# ✅ [Image Webhook] Génération réussie: ...
```

## Intégration future avec Prisma

Pour sauvegarder les images générées dans la base de données, on pourrait ajouter un modèle :

```prisma
model ImageGeneration {
  id                String   @id @default(cuid())
  externalJobId     String   @unique
  userId            String
  organizationId    String?
  prompt            String   @db.Text
  images            Json     // Array de GeneratedImage
  metadata          Json     // ImageMetadata
  status            String   @default("PENDING")
  createdAt         DateTime @default(now())
  completedAt       DateTime?
  
  user              User     @relation(fields: [userId], references: [id])
  organization      Organization? @relation(fields: [organizationId], references: [id])
  
  @@index([userId])
  @@index([organizationId])
  @@index([externalJobId])
}
```

Puis dans le webhook :

```typescript
await prisma.imageGeneration.create({
  data: {
    externalJobId: payload.job_id,
    userId: userId, // À récupérer du contexte
    organizationId: organizationId,
    prompt: imageData.images[0].description,
    images: imageData.images,
    metadata: imageData.metadata,
    status: 'COMPLETED',
    completedAt: new Date(imageData.generated_at),
  },
});
```

## Monitoring

### Métriques à surveiller

- **Temps de traitement** : `processing_time_ms` dans la réponse
- **Taux de succès** : Ratio completed / failed
- **Jobs dupliqués** : Nombre de "Job déjà traité"
- **Taille des images** : `size_bytes` dans les métadonnées

### Logs structurés

Tous les logs utilisent des emojis pour faciliter le debugging :

- 🎨 : Réception
- 📦 : Payload
- ✅ : Succès
- ❌ : Erreur
- ⚠️ : Avertissement
- ℹ️ : Information
- 💾 : Sauvegarde
- ⏱️ : Performance

## Sécurité

### Best practices

1. **Secret robuste** : Utiliser un secret de minimum 32 caractères
2. **HTTPS en production** : Toujours utiliser HTTPS
3. **Rate limiting** : Implémenter si nécessaire côté backend
4. **Validation stricte** : Vérifier tous les champs du payload
5. **Timeout** : Le webhook doit répondre en moins de 30 secondes

### Exemple de secret fort

```bash
# Générer un secret
openssl rand -base64 32

# Ou
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Troubleshooting

### Le webhook retourne 404

- ✅ Vérifier que la route est dans `isPublicRoute` du middleware
- ✅ Vérifier que le backend envoie à la bonne URL

### Le webhook retourne 401

- ✅ Vérifier `WEBHOOK_SECRET` dans `.env.local`
- ✅ Vérifier le header `X-Webhook-Secret`
- ✅ En développement, le secret n'est pas requis

### "Données d'images manquantes"

- ✅ Vérifier que `payload.data` existe
- ✅ Vérifier que `payload.data.images` est un tableau
- ✅ Vérifier que le tableau n'est pas vide

### "Job déjà traité"

- ✅ Normal si le backend renvoie le même job deux fois
- ✅ Augmenter `IDEMPOTENCE_WINDOW` si nécessaire

---

**Version** : 1.0.0  
**Date** : 21 octobre 2025  
**Contact** : support@sorami.com
