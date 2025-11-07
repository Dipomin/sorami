# Fix: Canvas Tainted - Configuration CORS S3

## Problème

```
Erreur lors du rognage: Failed to execute 'toBlob' on 'HTMLCanvasElement': 
Tainted canvases may not be exported.
```

## Cause

Le canvas devient "tainted" (contaminé) lorsqu'on charge une image provenant d'une source externe (S3) sans les bons en-têtes CORS. Le navigateur bloque alors l'export du canvas pour des raisons de sécurité.

## Solution

### 1. Code Frontend ✅ (Déjà corrigé)

Ajout de `crossOrigin="anonymous"` sur la balise `<img>` dans le composant de crop :

```tsx
<img
  ref={cropImageRef}
  src={cropImage}
  alt="Crop"
  onLoad={onImageLoad}
  crossOrigin="anonymous"  // ← Permet l'export du canvas
  className="max-w-full h-auto"
  style={{ maxHeight: "calc(100vh - 200px)" }}
/>
```

### 2. Configuration CORS S3 (À faire)

#### Option A : Via AWS CLI (Recommandé)

Exécutez le script fourni :

```bash
chmod +x configure-s3-cors.sh
./configure-s3-cors.sh
```

#### Option B : Via AWS Console (Manuel)

1. **Accédez à S3**
   - Allez sur https://console.aws.amazon.com/s3/
   - Sélectionnez le bucket `sorami-blog`

2. **Permissions → CORS**
   - Cliquez sur l'onglet "Permissions"
   - Scrollez jusqu'à "Cross-origin resource sharing (CORS)"
   - Cliquez sur "Edit"

3. **Configuration CORS**
   
   Collez cette configuration :

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

4. **Enregistrer**
   - Cliquez sur "Save changes"

### 3. Vérification

Une fois CORS configuré :

1. **Vider le cache du navigateur** (important !)
   - Chrome/Edge : Ctrl+Shift+Delete → "Cached images and files"
   - Firefox : Ctrl+Shift+Delete → "Cache"
   - Safari : Cmd+Option+E

2. **Tester le crop**
   - Rechargez la page (Cmd+R ou Ctrl+R)
   - Ouvrez le gestionnaire d'images
   - Cliquez sur l'icône de crop (bleue)
   - Ajustez la zone de rognage
   - Cliquez sur "Valider et Enregistrer"

3. **Vérifier la console**
   - Ouvrez DevTools (F12)
   - Allez dans l'onglet "Network"
   - Rechargez une image S3
   - Vérifiez que la réponse contient les en-têtes :
     ```
     access-control-allow-origin: http://localhost:3001
     access-control-expose-headers: ETag, Content-Length
     ```

## Explication Technique

### Pourquoi CORS ?

1. **Politique Same-Origin** : Par défaut, les navigateurs bloquent l'accès aux ressources cross-origin pour des raisons de sécurité

2. **Canvas Tainted** : Quand une image cross-origin est dessinée sur un canvas sans CORS, le canvas devient "tainted" et ne peut plus être exporté (toBlob, toDataURL)

3. **crossOrigin="anonymous"** : Cette propriété indique au navigateur de faire une requête CORS pour l'image

4. **En-têtes CORS S3** : S3 doit répondre avec `Access-Control-Allow-Origin` pour autoriser le navigateur

### Flux complet

```
1. Frontend : <img crossOrigin="anonymous" src="https://sorami-blog.s3.amazonaws.com/...">
              ↓
2. Navigateur: Requête GET avec en-tête Origin: http://localhost:3001
              ↓
3. S3 (CORS) : Vérifie si Origin est dans AllowedOrigins
              ↓
4. S3        : Répond avec Access-Control-Allow-Origin: http://localhost:3001
              ↓
5. Navigateur: Autorise le canvas à être "non-tainted"
              ↓
6. Frontend  : canvas.toBlob() fonctionne ✅
```

## Troubleshooting

### Erreur persiste après configuration CORS

1. **Cache navigateur** : Videz le cache et rechargez
2. **Cache S3/CloudFront** : Si vous utilisez CloudFront, attendez 5-10 minutes ou invalidez le cache
3. **Credentials AWS CLI** : Assurez-vous d'utiliser un utilisateur avec la permission `s3:PutBucketCORS`

### Vérifier CORS en ligne de commande

```bash
aws s3api get-bucket-cors --bucket sorami-blog --region eu-north-1
```

### Tester CORS avec curl

```bash
curl -I \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: GET" \
  https://sorami-blog.s3.eu-north-1.amazonaws.com/blog/images/test.jpg
```

Vous devriez voir `access-control-allow-origin: http://localhost:3001` dans la réponse.

## Résumé des changements

✅ **Frontend** : Ajout `crossOrigin="anonymous"` dans S3ImageManager.tsx
⏳ **Backend** : Configuration CORS sur bucket sorami-blog (à faire)

Une fois CORS configuré, le rognage d'images fonctionnera parfaitement ! 🎉
