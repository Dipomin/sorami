# Backend Configuration Requise pour Image Generation

## 🔧 Modifications Requises dans le Backend Flask

Pour que l'intégration fonctionne correctement, le backend Flask doit accepter un `job_id` personnalisé dans la requête de génération d'images.

### Endpoint: `/api/images/generate`

#### Requête Attendue

```json
{
  "prompt": "Un chat mignon avec des lunettes de soleil",
  "job_id": "cm4abc123def456ghi789", // ⬅️ NOUVEAU: ID généré par Next.js/Prisma
  "user_id": "user_2abc123",
  "input_image_url": "https://...",
  "num_images": 1,
  "size": "1024x1024",
  "format": "PNG",
  "style": "illustration",
  "quality": "high"
}
```

### Changements à Implémenter

#### 1. Accepter `job_id` Optionnel

```python
@app.route('/api/images/generate', methods=['POST'])
def generate_images():
    data = request.json
    
    # Si job_id est fourni, l'utiliser, sinon en créer un nouveau
    job_id = data.get('job_id') or str(uuid.uuid4())
    user_id = data.get('user_id')
    prompt = data.get('prompt')
    
    # ... rest of the code
```

#### 2. Utiliser ce `job_id` pour le Webhook

```python
# Lors de l'envoi du webhook
webhook_payload = {
    'job_id': job_id,  # ⬅️ Utiliser le job_id de la requête
    'status': 'completed',
    'timestamp': datetime.now().isoformat(),
    'environment': os.getenv('ENVIRONMENT', 'development'),
    'data': {
        'job_id': job_id,
        'images': generated_images,
        'metadata': {
            'model_name': 'gemini-2.5-flash-image',
            'version': '1.0',
            'generation_time_seconds': elapsed_time,
            # ...
        }
    }
}
```

### URL de Webhook

Le backend doit envoyer les webhooks à :

```bash
# Development
WEBHOOK_URL=http://localhost:3000/api/webhooks/image-completion

# Production
WEBHOOK_URL=https://votre-domaine.com/api/webhooks/image-completion
```

### Variables d'Environnement Backend

```bash
# .env
ENVIRONMENT=development
WEBHOOK_URL=http://localhost:3000/api/webhooks/image-completion
WEBHOOK_SECRET=sorami-webhook-secret-key-2025
```

### Payload du Webhook (Complet)

```json
{
  "job_id": "cm4abc123def456ghi789",
  "status": "completed",
  "timestamp": "2025-10-23T14:30:00.000Z",
  "environment": "development",
  "data": {
    "job_id": "cm4abc123def456ghi789",
    "images": [
      {
        "file_path": "images/cm4abc123def456ghi789/image_1.png",
        "url": "https://s3.amazonaws.com/.../image_1.png",
        "description": "Un chat mignon avec des lunettes de soleil",
        "format": "PNG",
        "size_bytes": 524288,
        "dimensions": "1024x1024"
      }
    ],
    "metadata": {
      "model_name": "gemini-2.5-flash-image",
      "version": "1.0",
      "generation_time_seconds": 12.5,
      "input_tokens": 50,
      "output_size_bytes": 524288,
      "timestamp": "2025-10-23T14:30:00.000Z"
    },
    "status": "completed",
    "generated_at": "2025-10-23T14:30:00.000Z"
  }
}
```

### Statuts Intermédiaires (Optionnel)

Pour un meilleur UX, envoyer des webhooks de progression :

```json
// Status: initializing
{
  "job_id": "cm4abc123def456ghi789",
  "status": "initializing",
  "timestamp": "2025-10-23T14:28:00.000Z",
  "message": "Initialisation du modèle...",
  "progress": 25
}

// Status: generating
{
  "job_id": "cm4abc123def456ghi789",
  "status": "generating",
  "timestamp": "2025-10-23T14:29:00.000Z",
  "message": "Génération en cours...",
  "progress": 60
}

// Status: saving
{
  "job_id": "cm4abc123def456ghi789",
  "status": "saving",
  "timestamp": "2025-10-23T14:29:30.000Z",
  "message": "Enregistrement des images...",
  "progress": 90
}
```

### Gestion d'Erreur

```json
{
  "job_id": "cm4abc123def456ghi789",
  "status": "failed",
  "timestamp": "2025-10-23T14:30:00.000Z",
  "error_message": "Erreur lors de la génération: Quota API dépassé",
  "message": "La génération a échoué"
}
```

## 🧪 Test du Backend

### 1. Test Direct du Backend

```bash
curl -X POST http://localhost:9006/api/images/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "prompt": "Un chat mignon test",
    "job_id": "test-job-123",
    "user_id": "test-user",
    "num_images": 1,
    "size": "1024x1024"
  }'
```

### 2. Vérifier que le Webhook est Envoyé

```bash
# Dans les logs du backend, vous devriez voir :
📡 Envoi du webhook pour le job test-job-123 vers http://localhost:3000/api/webhooks/image-completion
✅ Webhook envoyé avec succès (status 200)
```

### 3. Vérifier dans Prisma

```sql
SELECT * FROM image_generations WHERE id = 'test-job-123';
SELECT * FROM image_files WHERE generationId = 'test-job-123';
```

## 📋 Checklist Backend

- [ ] Accepter `job_id` optionnel dans `/api/images/generate`
- [ ] Utiliser ce `job_id` pour toute la génération
- [ ] Envoyer le `job_id` dans le webhook
- [ ] Configurer `WEBHOOK_URL` correctement
- [ ] Configurer `WEBHOOK_SECRET`
- [ ] Envoyer le header `X-Webhook-Secret` avec le webhook
- [ ] Tester la génération end-to-end

## 🔗 Voir Aussi

- `IMAGE_GENERATION_PRISMA_FIX.md` - Fix frontend complet
- `IMAGE_WEBHOOK_DOCUMENTATION.md` - Spec du webhook
- `BACKEND_CREWAI_CONFIG.md` - Config pour les livres (même pattern)
