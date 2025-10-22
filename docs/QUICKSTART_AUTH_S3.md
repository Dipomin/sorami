# 🚀 GUIDE DE DÉMARRAGE RAPIDE - Authentification & Stockage

## ✨ En 5 Minutes

Ce guide vous permet de mettre en place le système d'authentification Clerk et de stockage AWS S3 en 5 minutes.

---

## 📋 Étape 1: Installer les Dépendances (1 min)

```bash
pip install PyJWT cryptography boto3
```

**Vérification:**
```bash
python test_auth_s3_setup.py
```

✅ Si vous voyez "🎉 Tous les tests sont passés", continuez !

---

## 🔑 Étape 2: Configuration Clerk (2 min)

### A. Créer un compte Clerk

1. Aller sur https://clerk.com
2. Cliquer sur "Sign up"
3. Créer une nouvelle application

### B. Récupérer les clés

1. Dashboard → API Keys
2. Copier:
   - **Publishable Key** (commence par `pk_test_` ou `pk_live_`)
   - **Secret Key** (commence par `sk_test_` ou `sk_live_`)

### C. Configurer .env

```bash
# Copier le template
cp .env.example .env

# Éditer avec vos clés
nano .env
```

Ajouter dans `.env`:
```bash
CLERK_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_ICI
CLERK_SECRET_KEY=sk_test_VOTRE_CLE_ICI
```

---

## 📦 Étape 3: Configuration AWS S3 (2 min)

### Option A: AWS Console (Recommandé pour débutants)

1. **Créer un bucket:**
   - Aller sur https://console.aws.amazon.com/s3/
   - Cliquer "Create bucket"
   - Nom: `sorami-generated-content`
   - Région: `EU (Paris) eu-west-3`
   - Bloquer l'accès public: ✅ Activé
   - Cliquer "Create bucket"

2. **Créer un utilisateur IAM:**
   - Aller sur https://console.aws.amazon.com/iam/
   - Users → Add users
   - Nom: `sorami-api`
   - Access key: ✅ Activé
   - Permissions: Attacher "AmazonS3FullAccess"
   - Créer l'utilisateur
   - **IMPORTANT:** Copier Access Key ID et Secret Access Key

3. **Configurer .env:**
   ```bash
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   S3_BUCKET_NAME=sorami-generated-content
   AWS_REGION=eu-west-3
   ```

### Option B: AWS CLI (Pour utilisateurs avancés)

```bash
# Créer le bucket
aws s3 mb s3://sorami-generated-content --region eu-west-3

# Bloquer l'accès public
aws s3api put-public-access-block \
  --bucket sorami-generated-content \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Créer utilisateur IAM
aws iam create-user --user-name sorami-api

# Attacher politique S3
aws iam attach-user-policy \
  --user-name sorami-api \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Générer clés
aws iam create-access-key --user-name sorami-api
```

---

## 🔧 Étape 4: Intégration dans l'API (<1 min)

### Modifier `complete_crewai_api.py`

Ajouter après les imports existants:

```python
# AJOUT: Import du Blueprint sécurisé
from routes.secure_api import secure_api

# ... (code existant) ...

# AJOUT: Enregistrement du Blueprint
app.register_blueprint(secure_api)
```

**Exemple complet:**
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.secure_api import secure_api  # ← NOUVEAU

app = Flask(__name__)
CORS(app)

# Enregistrer le Blueprint sécurisé
app.register_blueprint(secure_api)  # ← NOUVEAU

# ... reste du code existant ...

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9006)
```

---

## ✅ Étape 5: Test & Vérification (<1 min)

### A. Test de Configuration

```bash
python test_auth_s3_setup.py
```

**Sortie attendue:**
```
🔍 Vérification des dépendances pour Authentification Clerk & AWS S3

✅ PyJWT v2.8.0 - Vérification des tokens JWT Clerk
✅ cryptography v41.0.7 - Cryptographie pour signatures RSA
✅ boto3 v1.34.51 - Client AWS S3
...
🎉 Tous les tests sont passés avec succès!
```

### B. Démarrer l'API

```bash
python complete_crewai_api.py
```

**Vérification:**
```bash
curl http://localhost:9006/health
```

Devrait contenir:
```json
{
  "status": "healthy",
  "features": ["books", "blog_articles", "image_generation", "video_generation"],
  "clerk_auth_available": true,
  "s3_storage_available": true
}
```

---

## 🎉 C'est Prêt !

Votre système d'authentification et de stockage est maintenant opérationnel !

### Endpoints Disponibles

| Endpoint | Description |
|----------|-------------|
| `POST /api/secure/books/generate` | Génère un livre (Auth + Pro) |
| `POST /api/secure/blog/generate` | Génère un article (Auth) |
| `GET /api/secure/files/list` | Liste les fichiers (Auth) |
| `GET /api/secure/files/download/<key>` | Télécharge un fichier (Auth) |
| `DELETE /api/secure/files/delete/<key>` | Supprime un fichier (Auth) |

---

## 🧪 Test Manuel

### 1. Obtenir un Token Clerk

**Depuis Next.js:**
```typescript
import { useAuth } from '@clerk/nextjs';

const { getToken } = useAuth();
const token = await getToken();
console.log('Token:', token);
```

**Ou depuis Clerk Dashboard:**
- Aller dans Dashboard → Users
- Cliquer sur un utilisateur
- Copier le JWT token

### 2. Tester l'Authentification

```bash
# Remplacer YOUR_TOKEN_HERE par votre token JWT
curl -X POST http://localhost:9006/api/secure/blog/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"topic": "Intelligence Artificielle"}'
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Génération d'article démarrée",
  "data": {
    "job_id": "abc-123-def-456",
    "status": "pending"
  }
}
```

### 3. Vérifier le Statut

```bash
curl -X GET http://localhost:9006/api/secure/jobs/abc-123-def-456/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🐛 Dépannage Rapide

### Erreur: "No module named 'jwt'"

```bash
pip install PyJWT
```

### Erreur: "No module named 'boto3'"

```bash
pip install boto3
```

### Erreur: "Authentication required"

- Vérifier que le header `Authorization: Bearer <token>` est présent
- Vérifier que le token est valide (pas expiré)
- Vérifier les clés Clerk dans `.env`

### Erreur: "Bucket not found"

- Vérifier que le bucket `sorami-generated-content` existe
- Vérifier la région: doit être `eu-west-3`
- Vérifier les credentials AWS dans `.env`

### Erreur: "Access denied"

- Vérifier les clés AWS (Access Key ID + Secret Access Key)
- Vérifier que l'utilisateur IAM a les permissions S3
- Tester avec `aws s3 ls` pour vérifier les credentials

---

## 📚 Documentation Complète

| Document | Description |
|----------|-------------|
| `CLERK_AUTH_S3_DOCUMENTATION.md` | Guide complet (1,500 lignes) |
| `DEPENDENCIES_AUTH_S3.md` | Installation & troubleshooting |
| `IMPLEMENTATION_AUTH_S3_SUMMARY.md` | Détails techniques |
| `LIVRAISON_AUTH_S3.md` | Résumé de livraison |

---

## 🚀 Intégration Frontend (Next.js)

### Hook `useSecureAPI`

Créer `hooks/useSecureAPI.ts`:

```typescript
'use client';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';

const API_URL = 'http://localhost:9006';

export function useSecureAPI() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const request = async (endpoint: string, options: any = {}) => {
    const token = await getToken();
    
    const response = await axios.request({
      ...options,
      url: `${API_URL}${endpoint}`,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.data;
  };

  return { request, isReady: isLoaded && isSignedIn };
}
```

### Utilisation

```typescript
import { useSecureAPI } from '@/hooks/useSecureAPI';

function MyComponent() {
  const { request, isReady } = useSecureAPI();

  const generateBook = async () => {
    const job = await request('/api/secure/books/generate', {
      method: 'POST',
      data: { topic: 'Intelligence Artificielle' }
    });
    
    console.log('Job ID:', job.job_id);
  };

  if (!isReady) return <div>Chargement...</div>;

  return <button onClick={generateBook}>Générer Livre</button>;
}
```

---

## ✨ Prochaines Étapes

Maintenant que votre système est opérationnel:

1. **Tester** les endpoints avec des vrais tokens Clerk
2. **Intégrer** dans votre frontend Next.js
3. **Générer** votre premier contenu sécurisé
4. **Vérifier** que les fichiers sont bien sur S3
5. **Explorer** la documentation complète pour les features avancées

---

**🎊 Félicitations ! Votre système d'authentification et de stockage est prêt !**

---

**Support:** Consultez `CLERK_AUTH_S3_DOCUMENTATION.md` pour plus de détails  
**Tests:** Exécutez `python test_auth_s3_setup.py` en cas de problème  
**Vérification:** Lancez `./verify_auth_s3.sh` pour un check rapide
