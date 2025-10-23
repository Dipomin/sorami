# 🎬 Correction Urgente : URLs de Vidéos Manquantes

## 🔍 Problème Actuel

Les vidéos générées **ne s'affichent pas** sur la page car `fileUrl` est `null` dans la base de données :

```
✅ [Video Result API] Résultats récupérés: {
  job_id: 'cmh3lmwiy0001ggy4xovsxj8h',
  num_videos: 1,
  has_urls: false  // ❌ PROBLÈME !
}
```

## 📋 Diagnostic

### Ce qui fonctionne ✅
1. La génération de vidéo démarre correctement
2. Le webhook `/api/webhooks/video-completion` est appelé avec succès
3. Les métadonnées sont sauvegardées (temps de traitement, taille, etc.)
4. L'entrée `VideoFile` est créée dans Prisma

### Ce qui ne fonctionne pas ❌
Le backend Flask envoie `file_url: null` dans le payload webhook :

```json
{
  "videos": [
    {
      "filename": "video_123.mp4",
      "file_path": "/path/to/video.mp4",
      "file_url": null,  // ❌ NULL !
      "file_size": 12345,
      // ... autres champs
    }
  ]
}
```

## 🔧 Solutions Appliquées (Frontend)

### 1. Logs de Debug Ajoutés

**Webhook** (`/api/webhooks/video-completion/route.ts`) :
```typescript
console.log(`   🔗 URLs des vidéos:`, payload.data.videos.map(v => ({
  filename: v.filename,
  file_url: v.file_url,
  has_url: !!v.file_url
})));
```

**Result API** (`/api/videos/[id]/result/route.ts`) :
```typescript
console.log('✅ [Video Result API] Résultats récupérés:', {
  job_id: videoGeneration.id,
  num_videos: response.num_videos,
  has_urls: videoGeneration.videos.every(v => v.fileUrl),
  video_urls: videoGeneration.videos.map(v => ({
    filename: v.filename,
    fileUrl: v.fileUrl,
    has_url: !!v.fileUrl
  })),
});
```

### 2. Fallback Temporaire

Si `fileUrl` est `null`, utiliser `filePath` ou `s3Key` comme fallback :

```typescript
file_url: video.fileUrl || video.filePath || video.s3Key,
```

⚠️ **Note** : Ce fallback ne résout pas le problème fondamental. Les vidéos ne seront **toujours pas accessibles** car :
- `filePath` = chemin local du serveur (ex: `/Users/...`)
- `s3Key` = clé S3 sans domaine (ex: `generated_videos/video.mp4`)

## ✅ Action Requise : Backend Flask

### Problème Backend

Le backend Flask doit **uploader les vidéos sur S3** et **générer une URL présignée** avant d'envoyer le webhook.

### Code Backend à Modifier

**Fichier** : `backend/api/videos/generate.py` (ou équivalent)

```python
import boto3
from datetime import timedelta

s3_client = boto3.client('s3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'eu-north-1')
)

BUCKET_NAME = os.getenv('S3_BUCKET_NAME', 'sorami-generated-content-9872')

def upload_video_to_s3(local_path: str, s3_key: str, user_id: str) -> str:
    """
    Upload une vidéo sur S3 et retourne une URL présignée
    
    Args:
        local_path: Chemin local du fichier vidéo
        s3_key: Clé S3 (chemin dans le bucket)
        user_id: ID de l'utilisateur (pour organiser les fichiers)
    
    Returns:
        URL présignée valide pendant 1 heure
    """
    # Construire le chemin S3 avec organisation par utilisateur
    full_s3_key = f"user_{user_id}/videos/{os.path.basename(local_path)}"
    
    # Upload sur S3
    s3_client.upload_file(
        local_path,
        BUCKET_NAME,
        full_s3_key,
        ExtraArgs={
            'ContentType': 'video/mp4',
            'CacheControl': 'max-age=31536000'  # Cache 1 an
        }
    )
    
    # Générer URL présignée (valide 1 heure)
    presigned_url = s3_client.generate_presigned_url(
        'get_object',
        Params={
            'Bucket': BUCKET_NAME,
            'Key': full_s3_key
        },
        ExpiresIn=3600  # 1 heure
    )
    
    return presigned_url

# Dans la fonction de génération de vidéo :
def generate_video(job_id: str, prompt: str, user_id: str, **kwargs):
    # ... génération de la vidéo ...
    
    # Après génération réussie :
    local_video_path = f"generated_videos/video_{job_id}.mp4"
    
    # ✅ AJOUTER : Upload sur S3 et obtenir URL
    s3_key = f"videos/video_{job_id}.mp4"
    file_url = upload_video_to_s3(local_video_path, s3_key, user_id)
    
    # Construire le payload webhook
    webhook_payload = {
        "job_id": job_id,
        "status": "completed",
        "data": {
            "videos": [
                {
                    "filename": os.path.basename(local_video_path),
                    "file_path": s3_key,  # Chemin S3, pas local !
                    "file_url": file_url,  # ✅ URL présignée S3
                    "file_size": os.path.getsize(local_video_path),
                    # ... autres champs
                }
            ]
        }
    }
    
    # Envoyer le webhook à Next.js
    send_webhook(webhook_payload)
```

### Variables d'Environnement Requises (Backend)

```bash
AWS_ACCESS_KEY_ID=AKIAS2F6LWF67632IIG5
AWS_SECRET_ACCESS_KEY=<secret>
AWS_REGION=eu-north-1
S3_BUCKET_NAME=sorami-generated-content-9872
WEBHOOK_URL=http://localhost:3000/api/webhooks/video-completion
```

## 🎯 Workflow Correct

```
1. Backend génère la vidéo localement
   ↓
2. Backend upload sur S3 avec boto3
   ↓
3. Backend génère URL présignée (expire dans 1h)
   ↓
4. Backend envoie webhook avec file_url
   ↓
5. Next.js sauvegarde fileUrl dans Prisma
   ↓
6. Frontend affiche la vidéo avec <video src={file_url}>
   ✅ Ça marche !
```

## 📊 Tests à Effectuer

Après modification du backend :

1. Générer une nouvelle vidéo
2. Vérifier les logs webhook :
   ```
   🔗 URLs des vidéos: [
     {
       filename: 'video_xxx.mp4',
       file_url: 'https://sorami-generated-content-9872.s3.amazonaws.com/...',
       has_url: true  // ✅
     }
   ]
   ```
3. Vérifier les logs result :
   ```
   has_urls: true  // ✅
   ```
4. Vérifier l'affichage dans le navigateur

## 🚨 Alternative Temporaire

Si l'upload S3 côté backend n'est pas possible immédiatement, créer une route Next.js qui :
1. Récupère la vidéo depuis le backend Flask
2. L'upload sur S3 via Next.js
3. Retourne l'URL S3 au frontend

**Mais cette solution est sous-optimale** car :
- Double transfert réseau (backend → Next.js → S3)
- Plus lent
- Consomme plus de ressources

---

**Date** : 23 octobre 2025  
**Priorité** : 🔴 URGENT  
**Status** : ⏳ En attente de modification backend
