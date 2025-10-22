# 🎬 API de Génération de Vidéos - Documentation Complète

## Vue d'ensemble

Cette API permet de générer des vidéos cinématographiques à partir de descriptions textuelles en utilisant le modèle **Gemini Veo 2.0** de Google. Le système suit l'architecture modulaire du projet et s'intègre parfaitement avec les fonctionnalités existantes de génération de livres, articles de blog et images.

---

## 🚀 Installation et Configuration

### 1. Installer les dépendances

```bash
pip install google-genai pillow
```

### 2. Configurer la clé API

Dans votre fichier `.env`, ajoutez :

```bash
# Clé API Google Gemini (pour les vidéos)
GEMINI_API_KEY=votre_cle_api_google_gemini

# Alternative (compatible avec la génération d'images)
GOOGLE_API_KEY=votre_cle_api_google
```

**Note :** La clé `GEMINI_API_KEY` est prioritaire. Si elle n'existe pas, le système utilisera `GOOGLE_API_KEY`.

### 3. Vérifier l'installation

```bash
# Tester que l'API fonctionne
curl http://localhost:9006/health
```

Réponse attendue :
```json
{
  "status": "healthy",
  "video_generation_available": true,
  "features": ["books", "blog_articles", "image_generation", "video_generation"]
}
```

---

## 📡 Endpoints API

### 1. POST `/api/videos/generate`

Démarre une génération de vidéo asynchrone.

**Request Body :**

```json
{
  "prompt": "Un magnifique lever de soleil sur l'océan avec des vagues douces et des mouettes volant dans le ciel",
  "aspect_ratio": "16:9",
  "number_of_videos": 1,
  "duration_seconds": 8,
  "person_generation": "ALLOW_ALL",
  "input_image_base64": null,
  "save_to_cloud": false
}
```

**Paramètres :**

| Paramètre | Type | Requis | Valeurs | Description |
|-----------|------|--------|---------|-------------|
| `prompt` | string | ✅ | - | Description textuelle de la vidéo |
| `aspect_ratio` | string | ❌ | `"16:9"`, `"16:10"` | Ratio d'aspect (défaut: `"16:9"`) |
| `number_of_videos` | int | ❌ | 1-4 | Nombre de vidéos à générer (défaut: 1) |
| `duration_seconds` | int | ❌ | 5-8 | Durée en secondes (défaut: 8) |
| `person_generation` | string | ❌ | `"ALLOW_ALL"`, `"DENY_ALL"` | Autorisation de générer des personnes |
| `input_image_base64` | string | ❌ | - | Image de référence en base64 (optionnel) |
| `save_to_cloud` | bool | ❌ | - | Sauvegarder sur le cloud (défaut: false) |

**Response (202 Accepted) :**

```json
{
  "job_id": "a3f2c1d9-8e7b-4f5a-9c2d-1e3f4a5b6c7d",
  "status": "pending",
  "message": "Génération de vidéo(s) démarrée",
  "created_at": "2025-10-22T14:30:00.123456",
  "estimated_duration": "10-120 secondes"
}
```

---

### 2. GET `/api/videos/status/<job_id>`

Obtient le statut d'une génération de vidéo.

**Response :**

```json
{
  "job_id": "a3f2c1d9-8e7b-4f5a-9c2d-1e3f4a5b6c7d",
  "status": "generating",
  "message": "Génération des vidéos en cours (cela peut prendre jusqu'à 2 minutes)...",
  "progress": 20,
  "videos": [],
  "generation_metadata": null,
  "error": null,
  "created_at": "2025-10-22T14:30:00.123456",
  "updated_at": "2025-10-22T14:30:15.789012",
  "completed_at": null
}
```

**Statuts possibles :**

- `pending` : Job créé, en attente
- `processing` : Initialisation
- `generating` : Génération en cours
- `downloading` : Téléchargement des vidéos
- `completed` : Terminé avec succès
- `failed` : Échec

---

### 3. GET `/api/videos/result/<job_id>`

Récupère les résultats complets d'une génération terminée.

**Response (200 OK) :**

```json
{
  "job_id": "a3f2c1d9-8e7b-4f5a-9c2d-1e3f4a5b6c7d",
  "status": "completed",
  "message": "1 vidéo(s) générée(s) avec succès!",
  "progress": 100,
  "videos": [
    {
      "filename": "video_20251022_143245_0.mp4",
      "file_path": "/chemin/absolu/vers/generated_videos/video_20251022_143245_0.mp4",
      "file_url": null,
      "file_size": 15728640,
      "format": "mp4",
      "duration_seconds": 8,
      "aspect_ratio": "16:9",
      "dimensions": {
        "width": 1920,
        "height": 1080
      },
      "created_at": "2025-10-22T14:32:45.123456",
      "remote_uri": "https://generativelanguage.googleapis.com/v1beta/files/xyz123"
    }
  ],
  "generation_metadata": {
    "model_name": "veo-2.0-generate-001",
    "model_version": "2.0",
    "processing_time": 125.45,
    "generation_time": 110.32,
    "download_time": 15.13,
    "prompt_used": "Un magnifique lever de soleil sur l'océan avec des vagues douces",
    "num_videos_requested": 1,
    "num_videos_generated": 1,
    "config_used": {
      "aspect_ratio": "16:9",
      "duration_seconds": 8,
      "person_generation": "ALLOW_ALL"
    }
  },
  "error": null,
  "created_at": "2025-10-22T14:30:00.123456",
  "completed_at": "2025-10-22T14:32:45.678901"
}
```

---

## 💻 Exemples d'utilisation

### Python (requests)

```python
import requests
import time
import json

API_URL = "http://localhost:9006"

# 1. Lancer une génération
response = requests.post(f"{API_URL}/api/videos/generate", json={
    "prompt": "Un chat astronaute flottant dans l'espace avec des étoiles scintillantes",
    "aspect_ratio": "16:9",
    "number_of_videos": 1,
    "duration_seconds": 8
})

job_data = response.json()
job_id = job_data['job_id']
print(f"✅ Job créé : {job_id}")

# 2. Polling du statut
while True:
    status_response = requests.get(f"{API_URL}/api/videos/status/{job_id}")
    status_data = status_response.json()
    
    print(f"📊 Statut: {status_data['status']} - {status_data['message']} ({status_data['progress']}%)")
    
    if status_data['status'] == 'completed':
        print("✅ Génération terminée!")
        break
    elif status_data['status'] == 'failed':
        print(f"❌ Erreur: {status_data['error']}")
        break
    
    time.sleep(5)

# 3. Récupérer les résultats
result_response = requests.get(f"{API_URL}/api/videos/result/{job_id}")
result_data = result_response.json()

print(f"\n🎬 Vidéos générées:")
for video in result_data['videos']:
    print(f"  - {video['filename']} ({video['file_size'] / 1024 / 1024:.2f} MB)")
    print(f"    Chemin: {video['file_path']}")
    print(f"    Durée: {video['duration_seconds']}s")
```

### cURL

```bash
# 1. Lancer une génération
curl -X POST http://localhost:9006/api/videos/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Une cascade majestueuse dans une forêt tropicale avec des oiseaux colorés",
    "aspect_ratio": "16:9",
    "duration_seconds": 8
  }'

# Réponse:
# {"job_id": "abc123...", "status": "pending", ...}

# 2. Vérifier le statut
curl http://localhost:9006/api/videos/status/abc123...

# 3. Récupérer les résultats
curl http://localhost:9006/api/videos/result/abc123...
```

### JavaScript (fetch)

```javascript
const API_URL = 'http://localhost:9006';

async function generateVideo() {
  // 1. Lancer la génération
  const createResponse = await fetch(`${API_URL}/api/videos/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Un coucher de soleil sur une plage tropicale avec des palmiers',
      aspect_ratio: '16:9',
      duration_seconds: 8
    })
  });
  
  const { job_id } = await createResponse.json();
  console.log('✅ Job créé:', job_id);
  
  // 2. Polling du statut
  while (true) {
    const statusResponse = await fetch(`${API_URL}/api/videos/status/${job_id}`);
    const statusData = await statusResponse.json();
    
    console.log(`📊 ${statusData.status} - ${statusData.message} (${statusData.progress}%)`);
    
    if (statusData.status === 'completed') {
      // 3. Récupérer les résultats
      const resultResponse = await fetch(`${API_URL}/api/videos/result/${job_id}`);
      const resultData = await resultResponse.json();
      
      console.log('🎬 Vidéos générées:');
      resultData.videos.forEach(video => {
        console.log(`  - ${video.filename} (${(video.file_size / 1024 / 1024).toFixed(2)} MB)`);
      });
      break;
    }
    
    if (statusData.status === 'failed') {
      console.error('❌ Erreur:', statusData.error);
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

generateVideo();
```

---

## 🎯 Bonnes Pratiques

### Rédaction de prompts efficaces

✅ **BON :**
```
"Un lever de soleil cinématographique sur l'océan Pacifique, avec des vagues douces 
s'écrasant sur la plage, des mouettes volant dans le ciel orange et rose, mouvement 
de caméra fluide de gauche à droite, ambiance paisible et sereine"
```

❌ **MAUVAIS :**
```
"océan"
```

**Conseils :**
- Soyez descriptif et précis
- Mentionnez les mouvements de caméra souhaités
- Décrivez l'ambiance et l'éclairage
- Incluez des détails visuels importants
- Utilisez un vocabulaire cinématographique

### Gestion du temps de génération

- La génération peut prendre **10 secondes à 2 minutes**
- Utilisez un **intervalle de polling de 5-10 secondes**
- Affichez une **barre de progression** à l'utilisateur
- Gérez les **timeouts côté client** (3-5 minutes max)

### Gestion des erreurs

```python
try:
    response = requests.post(f"{API_URL}/api/videos/generate", json=request_data)
    response.raise_for_status()
except requests.exceptions.RequestException as e:
    print(f"❌ Erreur réseau: {e}")
except Exception as e:
    print(f"❌ Erreur inattendue: {e}")
```

---

## 🔧 Webhooks (Optionnel)

Pour être notifié automatiquement de la fin de génération :

**Configuration (.env) :**

```bash
WEBHOOK_URL_VIDEO=https://votre-domaine.com/api/webhooks/video-completion
WEBHOOK_SECRET=votre_secret_webhook
```

**Payload envoyé :**

```json
{
  "job_id": "abc123...",
  "status": "completed",
  "content_type": "video",
  "timestamp": "2025-10-22T14:35:00.123456",
  "has_data": true,
  "data": {
    "job_id": "abc123...",
    "status": "completed",
    "videos": [...],
    "metadata": {...},
    "generated_at": "2025-10-22T14:35:00.123456",
    "success": true,
    "num_videos": 1,
    "prompt": "..."
  },
  "environment": "production"
}
```

---

## 🐛 Dépannage

### Erreur : "Module de génération de vidéos non disponible"

**Solution :**
```bash
pip install google-genai
```

### Erreur : "Clé API non configurée"

**Solution :**
```bash
# Ajoutez dans .env
GEMINI_API_KEY=votre_cle_api
```

### Timeout lors de la génération

**Cause :** La génération de vidéos peut être longue (jusqu'à 2 minutes).

**Solution :**
- Augmentez le timeout côté client
- Utilisez le polling avec des intervalles appropriés
- Implémentez un système de webhooks pour les notifications

### Vidéo non téléchargée

**Vérifiez :**
- Les permissions du dossier `./generated_videos`
- L'espace disque disponible
- Les logs de l'API pour plus de détails

---

## 📊 Limites et Quotas

| Paramètre | Limite |
|-----------|--------|
| Nombre de vidéos par requête | 1-4 |
| Durée par vidéo | 5-8 secondes |
| Ratios d'aspect | `16:9`, `16:10` |
| Taille moyenne d'une vidéo 8s | ~15 MB |
| Temps de génération moyen | 30-120 secondes |

---

## 🔗 Intégration avec Next.js

Exemple de hook React :

```typescript
// hooks/useVideoGeneration.ts
import { useState } from 'react';

interface VideoGenerationOptions {
  prompt: string;
  aspectRatio?: '16:9' | '16:10';
  durationSeconds?: number;
}

export function useVideoGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videos, setVideos] = useState<any[]>([]);
  
  const generateVideo = async (options: VideoGenerationOptions) => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      // 1. Créer le job
      const createRes = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      const { job_id } = await createRes.json();
      
      // 2. Polling
      const pollInterval = setInterval(async () => {
        const statusRes = await fetch(`/api/videos/status/${job_id}`);
        const statusData = await statusRes.json();
        
        setProgress(statusData.progress);
        
        if (statusData.status === 'completed') {
          clearInterval(pollInterval);
          const resultRes = await fetch(`/api/videos/result/${job_id}`);
          const resultData = await resultRes.json();
          setVideos(resultData.videos);
          setIsGenerating(false);
        } else if (statusData.status === 'failed') {
          clearInterval(pollInterval);
          throw new Error(statusData.error);
        }
      }, 5000);
      
    } catch (error) {
      setIsGenerating(false);
      console.error('Erreur:', error);
    }
  };
  
  return { generateVideo, isGenerating, progress, videos };
}
```

---

## 📝 Changelog

### v1.0.0 (22 octobre 2025)
- ✨ Première version de l'API de génération de vidéos
- ✅ Support du modèle Gemini Veo 2.0
- ✅ Génération asynchrone avec polling
- ✅ Webhooks pour notifications
- ✅ Documentation complète

---

## 🆘 Support

Pour toute question ou problème :
- Consultez les logs de l'API
- Vérifiez l'endpoint `/health`
- Consultez la documentation officielle : https://ai.google.dev/gemini-api/docs/video

---

**🎬 Bonne génération de vidéos !**
