# Documentation API - Génération d'Images avec Gemini AI

## Vue d'ensemble

Cette API permet de générer des images à partir de descriptions textuelles et/ou d'images sources en utilisant le modèle **Google Gemini 2.0 Flash Experimental** (`gemini-2.0-flash-exp`).

## Configuration

### 1. Installation des dépendances

```bash
pip install google-generativeai pillow requests
```

### 2. Configuration de la clé API

Ajoutez votre clé API Google dans le fichier `.env` :

```env
GOOGLE_API_KEY=votre_clé_api_google_ici
```

Pour obtenir une clé API :
1. Rendez-vous sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Créez une nouvelle clé API
3. Copiez-la dans votre fichier `.env`

### 3. Création du dossier de stockage

```bash
mkdir -p generated_images
```

## Endpoints disponibles

### 1. POST `/api/images/generate` - Générer des images

Démarre une tâche de génération d'images.

#### Requête

```json
{
  "prompt": "Un magnifique coucher de soleil sur l'océan avec des vagues dorées",
  "input_image_url": "https://example.com/image.jpg",  // Optionnel
  "num_images": 1,
  "size": "1024x1024",
  "format": "PNG",
  "style": "photorealistic",
  "quality": "high"
}
```

**Paramètres :**

| Paramètre | Type | Requis | Valeurs | Description |
|-----------|------|--------|---------|-------------|
| `prompt` | string | ✅ | - | Description textuelle de l'image à générer |
| `input_image_url` | string | ❌ | URL valide | URL d'une image source pour la génération multimodale |
| `num_images` | integer | ❌ | 1-4 | Nombre d'images à générer (défaut: 1) |
| `size` | string | ❌ | "512x512", "1024x1024", "1792x1024" | Dimensions de l'image (défaut: "1024x1024") |
| `format` | string | ❌ | "PNG", "JPEG", "WEBP" | Format de sortie (défaut: "PNG") |
| `style` | string | ❌ | "photorealistic", "artistic", "illustration", "3d-render" | Style visuel (défaut: "photorealistic") |
| `quality` | string | ❌ | "standard", "high", "ultra" | Qualité de génération (défaut: "high") |

#### Réponse

```json
{
  "job_id": "img_abc123xyz",
  "status": "PENDING",
  "message": "Tâche de génération d'images créée avec succès"
}
```

### 2. GET `/api/images/status/<job_id>` - Vérifier le statut

Retourne l'état actuel de la génération.

#### Réponse

```json
{
  "job_id": "img_abc123xyz",
  "status": "GENERATING",
  "message": "Génération en cours...",
  "progress": 50,
  "created_at": "2025-01-15T10:30:00",
  "updated_at": "2025-01-15T10:30:15"
}
```

**Statuts possibles :**
- `PENDING` : En attente de démarrage
- `INITIALIZING` : Initialisation du modèle Gemini
- `GENERATING` : Génération en cours
- `SAVING` : Sauvegarde des images
- `COMPLETED` : Terminé avec succès
- `FAILED` : Échec de la génération

### 3. GET `/api/images/result/<job_id>` - Récupérer les résultats

Retourne les images générées et leurs métadonnées.

#### Réponse (succès)

```json
{
  "job_id": "img_abc123xyz",
  "status": "COMPLETED",
  "message": "1 image(s) générée(s) avec succès",
  "images": [
    {
      "file_path": "./generated_images/img_abc123xyz/image_1.png",
      "url": "http://localhost:9006/generated_images/img_abc123xyz/image_1.png",
      "description": "Un magnifique coucher de soleil sur l'océan avec des vagues dorées",
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
    "timestamp": "2025-01-15T10:30:25"
  }
}
```

#### Réponse (erreur)

```json
{
  "job_id": "img_abc123xyz",
  "status": "FAILED",
  "message": "Échec de la génération",
  "errors": [
    "Clé API Google invalide ou expirée"
  ]
}
```

## Exemples d'utilisation

### Exemple 1 : Génération simple (texte seul)

```bash
curl -X POST http://localhost:9006/api/images/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Un chat astronaute flottant dans l'espace",
    "num_images": 1,
    "size": "1024x1024",
    "format": "PNG",
    "style": "photorealistic",
    "quality": "high"
  }'
```

### Exemple 2 : Génération multimodale (texte + image)

```bash
curl -X POST http://localhost:9006/api/images/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Transforme cette image en style cyberpunk futuriste avec des néons bleus et roses",
    "input_image_url": "https://example.com/photo.jpg",
    "num_images": 2,
    "size": "1792x1024",
    "format": "JPEG",
    "style": "artistic",
    "quality": "ultra"
  }'
```

### Exemple 3 : Vérification du statut

```bash
curl -X GET http://localhost:9006/api/images/status/img_abc123xyz
```

### Exemple 4 : Récupération des résultats

```bash
curl -X GET http://localhost:9006/api/images/result/img_abc123xyz
```

## Code Python client

```python
import requests
import time

# URL de l'API
API_URL = "http://localhost:9006"

# 1. Créer une tâche de génération
response = requests.post(
    f"{API_URL}/api/images/generate",
    json={
        "prompt": "Un paysage de montagne majestueux au lever du soleil",
        "num_images": 1,
        "size": "1024x1024",
        "format": "PNG",
        "style": "photorealistic",
        "quality": "high"
    }
)

result = response.json()
job_id = result['job_id']
print(f"✅ Tâche créée : {job_id}")

# 2. Vérifier le statut périodiquement
while True:
    status_response = requests.get(f"{API_URL}/api/images/status/{job_id}")
    status_data = status_response.json()
    
    print(f"📊 Statut : {status_data['status']} - {status_data['message']}")
    
    if status_data['status'] in ['COMPLETED', 'FAILED']:
        break
    
    time.sleep(2)  # Attendre 2 secondes avant la prochaine vérification

# 3. Récupérer les résultats
if status_data['status'] == 'COMPLETED':
    result_response = requests.get(f"{API_URL}/api/images/result/{job_id}")
    result_data = result_response.json()
    
    print(f"\n🎨 Images générées :")
    for i, image in enumerate(result_data['images'], 1):
        print(f"\n  Image {i}:")
        print(f"    - Chemin : {image['file_path']}")
        print(f"    - URL : {image['url']}")
        print(f"    - Format : {image['format']}")
        print(f"    - Dimensions : {image['dimensions']}")
        print(f"    - Taille : {image['size_bytes'] / 1024:.2f} KB")
    
    print(f"\n📊 Métadonnées :")
    metadata = result_data['metadata']
    print(f"    - Modèle : {metadata['model_name']}")
    print(f"    - Temps de génération : {metadata['generation_time_seconds']:.2f}s")
    print(f"    - Tokens utilisés : {metadata['input_tokens']}")
else:
    print(f"\n❌ Erreur : {status_data['message']}")
    if 'errors' in status_data:
        for error in status_data['errors']:
            print(f"    - {error}")
```

## Gestion des erreurs

### Erreurs courantes

| Code HTTP | Message | Solution |
|-----------|---------|----------|
| 400 | "Prompt requis" | Fournir un `prompt` non vide |
| 400 | "num_images doit être entre 1 et 4" | Ajuster la valeur de `num_images` |
| 500 | "Clé API Google non configurée" | Ajouter `GOOGLE_API_KEY` dans `.env` |
| 500 | "Modèle Gemini non disponible" | Vérifier la validité de la clé API |
| 404 | "Tâche introuvable" | Vérifier le `job_id` |

### Gestion des timeouts

La génération peut prendre de 5 à 30 secondes selon la complexité. Il est recommandé de :
- Utiliser un système de polling avec `time.sleep(2)` entre chaque vérification
- Implémenter un timeout maximum (ex: 60 secondes)
- Gérer les cas de `FAILED` status

## Limitations

- **Nombre d'images** : Maximum 4 images par requête
- **Taille maximale** : 1792x1024 pixels
- **Formats supportés** : PNG, JPEG, WebP
- **Quotas Google** : Limites selon votre plan API Google
- **Stockage** : Les images sont sauvegardées localement dans `./generated_images/`

## Webhook

Si configuré, l'API enverra une notification webhook lorsque la génération est terminée.

### Configuration Backend

Configuration dans `.env` du backend :
```env
WEBHOOK_URL=http://localhost:3000/api/webhooks/image-completion
WEBHOOK_SECRET=sorami-webhook-secret-key-2025
WEBHOOK_ENABLED=true
```

### Endpoint Frontend

```
POST http://localhost:3000/api/webhooks/image-completion
```

### Format du webhook

#### Succès (completed)

```json
{
  "job_id": "img_abc123xyz",
  "status": "completed",
  "timestamp": "2025-10-21T16:45:00Z",
  "environment": "development",
  "data": {
    "job_id": "img_abc123xyz",
    "images": [
      {
        "file_path": "./generated_images/img_abc123xyz/image_1.png",
        "url": "http://localhost:9006/generated_images/img_abc123xyz/image_1.png",
        "description": "Un magnifique coucher de soleil sur l'océan",
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

#### Échec (failed)

```json
{
  "job_id": "img_abc123xyz",
  "status": "failed",
  "timestamp": "2025-10-21T16:45:00Z",
  "environment": "development",
  "error_message": "Clé API Google invalide",
  "message": "Échec de la génération d'images"
}
```

#### Progression (optionnel)

```json
{
  "job_id": "img_abc123xyz",
  "status": "generating",
  "timestamp": "2025-10-21T16:44:45Z",
  "progress": 50,
  "message": "Génération en cours..."
}
```

### Headers requis

En production uniquement :
```http
X-Webhook-Secret: sorami-webhook-secret-key-2025
```

### Documentation complète

Voir `IMAGE_WEBHOOK_DOCUMENTATION.md` pour plus de détails sur le webhook.

## Support et debugging

### Logs

Les logs détaillés sont disponibles dans la console de l'API :
```
INFO - Génération d'image démarrée pour job_id: img_abc123xyz
INFO - Modèle Gemini initialisé avec succès
INFO - Image 1/1 générée en 12.5 secondes
INFO - Images sauvegardées dans ./generated_images/img_abc123xyz/
```

### Health check

Vérifiez l'état de l'API :
```bash
curl http://localhost:9006/health
```

Réponse attendue :
```json
{
  "status": "healthy",
  "features": {
    "book_generation": true,
    "blog_generation": true,
    "image_generation": true
  }
}
```

## Intégration frontend

Exemple React/Next.js :

```typescript
async function generateImage(prompt: string) {
  // Créer la tâche
  const createResponse = await fetch('http://localhost:9006/api/images/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      num_images: 1,
      size: '1024x1024',
      format: 'PNG',
      quality: 'high'
    })
  });
  
  const { job_id } = await createResponse.json();
  
  // Polling du statut
  let status = 'PENDING';
  while (!['COMPLETED', 'FAILED'].includes(status)) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const statusResponse = await fetch(`http://localhost:9006/api/images/status/${job_id}`);
    const statusData = await statusResponse.json();
    status = statusData.status;
  }
  
  // Récupérer le résultat
  if (status === 'COMPLETED') {
    const resultResponse = await fetch(`http://localhost:9006/api/images/result/${job_id}`);
    return await resultResponse.json();
  }
  
  throw new Error('Image generation failed');
}
```

---

**Version** : 1.0.0  
**Dernière mise à jour** : 15 janvier 2025  
**Contact** : support@example.com
