# 🚨 ACTION IMMÉDIATE : Configurer CORS S3

## Problème actuel

```
Access to image at 'https://sorami-blog.s3.eu-north-1.amazonaws.com/...'
from origin 'http://localhost:3000' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution : Configuration CORS via AWS Console (2 minutes)

### Étape 1 : Accéder au bucket
1. Ouvrez votre navigateur
2. Allez sur : https://s3.console.aws.amazon.com/s3/buckets/sorami-blog?region=eu-north-1&tab=permissions
3. Connectez-vous avec vos identifiants AWS

### Étape 2 : Accéder aux paramètres CORS
- Vous êtes déjà dans l'onglet **Permissions**
- Scrollez vers le bas jusqu'à la section **"Cross-origin resource sharing (CORS)"**
- Cliquez sur le bouton **"Edit"**

### Étape 3 : Coller la configuration CORS

**Supprimez tout** ce qui est dans la zone de texte, puis collez ceci :

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:3001",
      "http://localhost:3000",
      "https://sorami.qg-it.net",
      "https://*.qg-it.net"
    ],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

### Étape 4 : Enregistrer
- Cliquez sur **"Save changes"** en bas de la page
- Vous devriez voir un message de confirmation vert ✅

---

## Vérification immédiate

### 1. Videz le cache du navigateur
**Important** : Le navigateur garde les anciennes réponses CORS en cache !

- **Chrome/Edge** : 
  - Appuyez sur `Cmd+Shift+Delete` (Mac) ou `Ctrl+Shift+Delete` (Windows)
  - Cochez "Images et fichiers en cache"
  - Cliquez "Effacer les données"

- **OU simplement** : Appuyez sur `Cmd+Shift+R` (Mac) ou `Ctrl+Shift+F5` (Windows) pour forcer le rechargement

### 2. Rechargez votre page
```
http://localhost:3000/admin/blog/editor
```

### 3. Ouvrez la console DevTools (F12)
- Onglet **Network**
- Rechargez la page
- Cliquez sur une requête d'image (`.webp`)
- Dans l'onglet **Headers**, vous devriez maintenant voir :
  ```
  access-control-allow-origin: http://localhost:3000
  ```

---

## Test du crop d'image

1. Ouvrez le gestionnaire d'images
2. Cliquez sur l'icône de crop (bleue) sur une image
3. Ajustez la zone de rognage
4. Cliquez "Valider et Enregistrer"
5. **Plus d'erreur "Tainted canvas" !** ✅

---

## Si ça ne marche toujours pas

### Option 1 : Vérifier la région
Assurez-vous que vous êtes bien dans la région **eu-north-1** (Stockholm)

### Option 2 : Vérifier le nom du bucket
Le bucket doit s'appeler exactement **sorami-blog** (sans majuscules, sans espaces)

### Option 3 : Permissions AWS
Votre compte AWS doit avoir la permission `s3:PutBucketCORS`

Si vous avez un doute, contactez l'administrateur AWS de votre compte.

---

## Liens directs

- **Bucket S3** : https://s3.console.aws.amazon.com/s3/buckets/sorami-blog?region=eu-north-1&tab=permissions
- **Documentation AWS CORS** : https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html

---

## Résumé visuel

```
┌─────────────────────────────────────────┐
│  AWS Console → S3 → sorami-blog         │
│  → Permissions → CORS → Edit            │
│  → Coller la config JSON → Save         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Navigateur → Vider cache (Cmd+Shift+R) │
│  → Recharger l'app                      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  ✅ Images chargées                     │
│  ✅ Crop fonctionne                     │
│  ✅ Plus d'erreur CORS                  │
└─────────────────────────────────────────┘
```

---

**Temps estimé : 2 minutes** ⏱️
