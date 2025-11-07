# Migration vers Bucket S3 Public pour les Images de Blog

## 📋 Résumé
Migration du système d'images de blog depuis le bucket privé `sorami-generated-content-9872` vers le nouveau bucket public `sorami-blog`. Cette migration élimine le besoin d'URLs présignées et simplifie considérablement l'accès aux images.

## 🎯 Problème Résolu
- ❌ **Avant** : Erreur 403 Forbidden sur les images de blog
- ❌ Les credentials AWS `adm-sora` avaient un refus explicite (`explicit deny`)
- ❌ Système complexe d'URLs présignées avec cache et expiration
- ✅ **Après** : URLs publiques directes, pas de permission nécessaire

## 📝 Changements Effectués

### 1. Configuration Environnement (`.env`)
```bash
# Nouveau bucket PUBLIC pour les images de blog
AWS_S3_BLOG_BUCKET_NAME="sorami-blog"
```

### 2. Bibliothèque S3 Storage (`src/lib/s3-storage.ts`)

**Ajouts** :
- `const BLOG_BUCKET_NAME = process.env.AWS_S3_BLOG_BUCKET_NAME || 'sorami-blog'`
- `uploadBlogImage()` - Upload vers bucket public
- `deleteBlogImage()` - Suppression d'image blog
- `getBlogImagePublicUrl()` - Construction d'URL publique

**Fonctionnalités** :
```typescript
// Upload avec URL publique directe
const { url, key, size } = await uploadBlogImage({
  content: buffer,
  filename: 'image.webp',
  contentType: 'image/webp'
});
// url = "https://sorami-blog.s3.eu-north-1.amazonaws.com/blog/images/1234567890-abc123.webp"
```

### 3. Composant BlogImage (`src/components/ui/BlogImage.tsx`)

**Avant** (complexe) :
- Extraction de clé S3 depuis URL
- Hook `usePresignedUrl` avec cache
- Gestion d'expiration
- États de chargement multiples

**Après** (simplifié) :
```tsx
<BlogImage 
  src="https://sorami-blog.s3.eu-north-1.amazonaws.com/blog/images/123.webp"
  alt="Image de blog"
/>
// Pas de hook, pas de cache, juste une <img> standard !
```

### 4. API Upload (`src/app/api/blog/upload/route.ts`)

**Modifications** :
- `BUCKET_NAME` → `BLOG_BUCKET_NAME`
- Upload vers bucket public
- Import `DeleteObjectCommand` pour la suppression
- URLs publiques directes dans les réponses

**Exemple Réponse** :
```json
{
  "url": "https://sorami-blog.s3.eu-north-1.amazonaws.com/blog/images/1762293105452-abc123.webp",
  "fileName": "blog/images/1762293105452-abc123.webp",
  "size": 45678,
  "compressed": true
}
```

## 🔄 Migration des Images Existantes

### Option 1 : Copie AWS CLI (recommandé)
```bash
aws s3 cp s3://sorami-generated-content-9872/blog/images/ \
          s3://sorami-blog/blog/images/ \
          --recursive \
          --acl public-read
```

### Option 2 : Script Node.js
```bash
node scripts/migrate-blog-images-to-public-bucket.ts
```

### Option 3 : Mise à jour manuelle en base
```sql
UPDATE BlogPost 
SET coverImage = REPLACE(
  coverImage, 
  'sorami-generated-content-9872', 
  'sorami-blog'
)
WHERE coverImage LIKE '%sorami-generated-content-9872%';
```

## ✅ Avantages

1. **Simplicité** : Plus besoin de système d'URLs présignées
2. **Performance** : Pas de génération d'URL côté serveur
3. **Cache** : Les navigateurs peuvent cacher directement
4. **Sécurité** : Bucket dédié, isolation des contenus
5. **CDN Ready** : Facile d'ajouter CloudFront plus tard

## 🔧 Configuration Bucket S3 (sorami-blog)

### Politique de Bucket (Public Read)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::sorami-blog/*"
    }
  ]
}
```

### CORS Configuration
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["https://sorami.app", "http://localhost:3001"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## 🎨 Structure des URLs

### Anciennes URLs (bucket privé)
```
https://sorami-generated-content-9872.s3.eu-north-1.amazonaws.com/blog/images/xxx.webp
→ Erreur 403 Forbidden
```

### Nouvelles URLs (bucket public)
```
https://sorami-blog.s3.eu-north-1.amazonaws.com/blog/images/1762293105452-abc123.webp
→ ✅ Accès direct, pas de permission requise
```

## 📊 Impact sur les Composants

### Composants Modifiés
- ✅ `BlogImage.tsx` - Simplifié (pas de hook)
- ✅ `BlogCoverImage.tsx` - Utilise BlogImage simplifié
- ⚠️ Hook `usePresignedUrl` - Plus utilisé pour blog (conservé pour books)

### Pages Affectées
- `/blog` - Liste des articles
- `/blog/[slug]` - Article individuel
- `/blog/category/[slug]` - Catégories
- `/admin/blog/editor` - Éditeur d'articles
- `/admin/blog` - Gestion des articles

## 🧪 Tests

### Test d'Upload
```bash
# Upload via API
curl -X POST http://localhost:3001/api/blog/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg"

# Réponse attendue
{
  "url": "https://sorami-blog.s3.eu-north-1.amazonaws.com/blog/images/...",
  "size": 45678,
  "compressed": true
}
```

### Test d'Affichage
```bash
# Vérifier l'accès direct (doit retourner 200)
curl -I "https://sorami-blog.s3.eu-north-1.amazonaws.com/blog/images/test.webp"
```

## 📦 Fichiers à Deployer

```bash
.env                                    # Nouvelle variable AWS_S3_BLOG_BUCKET_NAME
src/lib/s3-storage.ts                  # Fonctions blog ajoutées
src/components/ui/BlogImage.tsx        # Simplifié (pas de presigned URLs)
src/app/api/blog/upload/route.ts       # Utilise nouveau bucket
```

## 🚀 Déploiement

1. **Créer le bucket S3** : `sorami-blog` avec accès public
2. **Copier `.env`** vers `.env.local` et `.env.production`
3. **Migrer les images** : Utiliser aws-cli ou script
4. **Déployer le code** : `npm run build && npm run start`
5. **Tester** : Vérifier affichage des images sur `/blog`

## 🔐 Permissions IAM Requises

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::sorami-blog/blog/images/*"
    }
  ]
}
```

Note : Pas besoin de `s3:GetObject` car le bucket est public !

---

**Date de migration** : 5 novembre 2025
**Auteur** : GitHub Copilot
**Status** : ✅ Complété
