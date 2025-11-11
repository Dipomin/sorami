# 🎨 Test Complet - Génération d'Images Backend API.SORAMI.APP

## 📊 Résultat des Tests

### ✅ SUCCÈS
Le backend `https://api.sorami.app` est **accessible**, **sécurisé** et **fonctionnel**.

### ❌ PROBLÈME IDENTIFIÉ
La fonctionnalité de **génération d'images n'est pas activée** côté backend.

---

## 🔍 Diagnostic Détaillé

### Health Check
```json
{
  "status": "healthy",
  "environment": "production",
  "python_version": "3.12.3",
  "clerk_auth_configured": true,
  "s3_storage_configured": true,
  "crewai_available": true,
  "webhook_enabled": true,
  "features": ["books", "blog_articles"],
  
  "image_generation_available": false,  ⬅️ ❌ PROBLÈME
  "video_generation_available": false,  ⬅️ ❌ PROBLÈME
  "secure_api_available": false
}
```

### Tests d'Authentification
| Test | Résultat | Verdict |
|------|----------|---------|
| Sans token | 401 UNAUTHORIZED | ✅ Correct |
| Token invalide | 401 UNAUTHORIZED | ✅ Correct |
| Token expiré | 401 UNAUTHORIZED | ✅ Correct |

### Routes API Testées
| Endpoint | Méthode | Status | Note |
|----------|---------|--------|------|
| `/health` | GET | 200 OK | ✅ Opérationnel |
| `/api/health` | GET | 404 | ❌ N'existe pas |
| `/api/images/generate` | POST | 401 | 🔐 Auth requise |
| `/api/images/status` | GET | 404 | ❌ N'existe pas |
| `/api/blog/generate` | POST | 401 | 🔐 Auth requise |
| `/api/videos/generate` | POST | 401 | 🔐 Auth requise |

---

## 🛠️ Solution Recommandée

### Étape 1: Se connecter au serveur
```bash
ssh votre-user@vps72807.serveur-vps.net
```

### Étape 2: Localiser le backend
```bash
# Trouver le processus backend
ps aux | grep python | grep -E "api|backend|flask"

# Ou avec PM2
pm2 list

# Ou avec Docker
docker ps
```

### Étape 3: Ajouter la configuration

**Fichier `.env` du backend (à créer/modifier)**:
```bash
# Google Gemini (Recommandé pour génération d'images)
GOOGLE_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX"

# Activation des fonctionnalités
ENABLE_IMAGE_GENERATION=true
ENABLE_VIDEO_GENERATION=true

# Configuration S3 (déjà existante normalement)
AWS_ACCESS_KEY_ID="AKIAS2F6LWF6VHZ73FOY"
AWS_SECRET_ACCESS_KEY="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"
AWS_REGION="eu-north-1"
AWS_S3_BUCKET_NAME="sorami-generated-content-9872"
```

### Étape 4: Vérifier les dépendances
```bash
cd /chemin/vers/backend
pip list | grep -E "google|gemini|pillow"

# Si manquantes:
pip install google-generativeai pillow
```

### Étape 5: Modifier la configuration du backend

**Dans le fichier principal (app.py, config.py ou __init__.py)**:
```python
# Configuration des fonctionnalités
FEATURES = {
    'books': True,
    'blog': True,
    'images': True,   # ← Changer de False à True
    'videos': True,   # ← Changer de False à True
}

# Ou si c'est dans config.py
IMAGE_GENERATION_ENABLED = True
VIDEO_GENERATION_ENABLED = True
```

### Étape 6: Redémarrer le backend
```bash
# Avec PM2
pm2 restart sorami-backend
pm2 logs sorami-backend

# Avec Systemd
sudo systemctl restart sorami-backend
sudo journalctl -u sorami-backend -f

# Avec Docker
docker-compose restart backend
docker-compose logs -f backend
```

### Étape 7: Vérifier l'activation
```bash
curl https://api.sorami.app/health | jq '.image_generation_available'
# Devrait retourner: true (au lieu de false)
```

---

## 🧪 Scripts de Test Disponibles

### Test Basique (sans auth)
```bash
node test-image-generation.mjs
```
Résultat attendu: 401 (authentification requise)

### Test Complet avec Diagnostic
```bash
node test-image-backend-simple.mjs
```
Affiche le health check et teste tous les endpoints.

### Test avec Token Réel
```bash
# 1. Récupérer un token:
#    - Aller sur https://sorami.app
#    - Se connecter
#    - DevTools > Network > Copier Authorization header

# 2. Tester:
node test-with-real-token.mjs "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Script Complet
```bash
./test-all-image-backend.sh
```

---

## 📁 Documentation Créée

| Fichier | Description |
|---------|-------------|
| `docs/IMAGE_GENERATION_DIAGNOSTIC.md` | Diagnostic détaillé avec solutions |
| `docs/BACKEND_IMAGE_TEST_SUMMARY.md` | Résumé exécutif complet |
| `test-image-generation.mjs` | Test basique |
| `test-image-backend-simple.mjs` | Test avec diagnostic |
| `test-with-real-token.mjs` | Test authentifié |
| `test-all-image-backend.sh` | Script bash complet |

---

## 📋 Checklist de Validation

Après avoir configuré le backend:

- [ ] Health check montre `image_generation_available: true`
- [ ] Test sans auth retourne bien 401
- [ ] Test avec token valide retourne 200/202
- [ ] Un job_id est retourné
- [ ] Le webhook de completion fonctionne
- [ ] Les images sont uploadées sur S3
- [ ] Les crédits sont déduits correctement
- [ ] Le frontend affiche les images générées

---

## 🔗 Endpoints à Valider

Une fois activé, tester:

1. **Génération**
   ```bash
   POST /api/images/generate
   Headers: Authorization: Bearer {token}
   Body: {
     "prompt": "test",
     "num_images": 1,
     "size": "1024x1024",
     "style": "photorealistic"
   }
   ```

2. **Status d'un job**
   ```bash
   GET /api/images/status/{job_id}
   Headers: Authorization: Bearer {token}
   ```

3. **Webhook de completion**
   ```bash
   POST https://sorami.app/api/webhooks/image-completion
   Headers: x-webhook-secret: {secret}
   Body: {job_id, status, images[]}
   ```

---

## ⚠️ Points d'Attention

### Crédits
- 1 crédit = 1 image générée
- Vérifier que l'utilisateur a des crédits avant de tester

### API Keys
- Google Gemini requiert une API key valide
- Vérifier les quotas de l'API
- Vérifier la facturation Google Cloud

### S3 Storage
- Bucket: `sorami-generated-content-9872`
- Région: `eu-north-1`
- Les credentials AWS doivent être valides

### Webhooks
- Frontend URL: `https://sorami.app` (ou localhost:3000)
- Secret: `sorami-webhook-secret-key-2025`
- Endpoint: `/api/webhooks/image-completion`

---

## 🎯 Résultat Attendu

Une fois la configuration terminée:

```bash
$ node test-with-real-token.mjs "eyJhbGc..."

✅ SUCCÈS! La requête a été acceptée

📋 Job ID: img_abc123xyz
   → Utiliser ce Job ID pour suivre la progression
   → Endpoint: GET https://api.sorami.app/api/images/status/img_abc123xyz

📊 Status: PENDING
💬 Message: Génération d'images démarrée

✅ LA GÉNÉRATION D'IMAGES FONCTIONNE!
```

---

## 📞 Support

En cas de problème persistant:

1. **Consulter les logs backend**
   ```bash
   pm2 logs sorami-backend --lines 100
   ```

2. **Vérifier les variables d'environnement**
   ```bash
   cd /chemin/vers/backend
   cat .env | grep -E "GOOGLE|IMAGE|ENABLE"
   ```

3. **Tester l'API Google manuellement**
   ```python
   import google.generativeai as genai
   genai.configure(api_key="VOTRE_CLE")
   # Test basique
   ```

4. **Vérifier les quotas Google Cloud**
   - Console: https://console.cloud.google.com
   - APIs & Services > Gemini API > Quotas

---

## ✅ Conclusion

Le backend `api.sorami.app` est **opérationnel** et **sécurisé**.

**Action immédiate requise**:
- Activer `image_generation_available` côté backend
- Configurer `GOOGLE_API_KEY` (ou autre provider)
- Redémarrer le service

**Temps estimé**: 15-30 minutes

**Impact**: 🔴 Critique - Fonctionnalité indisponible pour les utilisateurs

---

_Tests effectués le 7 novembre 2025_  
_Backend: https://api.sorami.app_  
_Frontend: https://sorami.app_
