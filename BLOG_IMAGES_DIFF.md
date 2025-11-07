# 📝 Changements de Code - Correction Images Blog

## Fichier Modifié: `src/components/ui/BlogImage.tsx`

### AVANT (Accès direct URLs S3)

```typescript
/**
 * Composant pour afficher les images de blog
 * Gère à la fois les URLs complètes et les clés S3
 */

"use client";

import React, { useState } from "react";

interface BlogImageProps {
  src: string | null | undefined;
  alt: string;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Détermine si une URL est une URL complète ou une clé S3
 */
function isFullUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convertit une clé S3 ou URL S3 en URL publique directe
 */
function getImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;

  // Si c'est déjà une URL HTTP/HTTPS complète, on la retourne
  if (isFullUrl(src)) {
    // Si c'est une URL S3, on la convertit en URL publique
    if (src.includes("amazonaws.com")) {
      return src; // ❌ PROBLÈME: Accès direct à S3 privé
    }
    return src;
  }

  // Si c'est une clé S3 (ex: blog/images/xxx.webp)
  // On construit l'URL S3 publique
  const bucket =
    process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME ||
    "sorami-generated-content-9872";
  const region = process.env.NEXT_PUBLIC_AWS_REGION || "eu-north-1";

  return `https://${bucket}.s3.${region}.amazonaws.com/${src}`;
  // ❌ PROBLÈME: URL publique ne fonctionne pas pour bucket privé
}

export function BlogImage({
  src,
  alt,
  fallback,
  className = "",
}: BlogImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const imageUrl = getImageUrl(src); // ❌ URL non signée

  // Si pas d'URL ou erreur de chargement, afficher le fallback
  if (!imageUrl || imageError) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className={/* ... */}>
        {/* fallback content */}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 animate-pulse">
          <div className="text-gray-400 text-sm">Chargement...</div>
        </div>
      )}
      <img
        src={imageUrl} // ❌ URL non signée → 403 Forbidden
        alt={alt}
        className={/* ... */}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          console.warn("Failed to load blog image:", {
            originalSrc: src,
            resolvedUrl: imageUrl,
          });
          setImageError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}
```

### APRÈS (URLs Présignées S3)

```typescript
/**
 * Composant pour afficher les images de blog avec URLs présignées S3
 * Utilise des liens présignés pour accéder aux images privées sur S3
 */

"use client";

import React, { useState } from "react";
import { usePresignedUrl, extractS3Key } from "@/hooks/usePresignedUrl"; // ✅ Import hook

interface BlogImageProps {
  src: string | null | undefined;
  alt: string;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Composant principal pour afficher les images de blog
 * Gère automatiquement les URLs présignées S3
 */
export function BlogImage({
  src,
  alt,
  fallback,
  className = "",
}: BlogImageProps) {
  const [imageError, setImageError] = useState(false);
  
  // ✅ Extraire la clé S3 depuis l'URL ou utiliser directement la clé
  const s3Key = extractS3Key(src);
  
  // ✅ Obtenir l'URL présignée via le hook
  const { presignedUrl, isLoading, error } = usePresignedUrl(s3Key);

  // Afficher le fallback si pas d'URL, erreur ou échec de chargement
  if (!src || error || imageError || (!isLoading && !presignedUrl)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-indigo-600/20 ${className}`}
      >
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📝</div>
          <div className="text-sm text-slate-400">Image de blog</div>
        </div>
      </div>
    );
  }

  // ✅ État de chargement géré par le hook
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 animate-pulse ${className}`}>
        <div className="text-gray-400 text-sm">Chargement...</div>
      </div>
    );
  }

  return (
    <img
      src={presignedUrl || undefined} // ✅ URL signée AWS valide 1h
      alt={alt}
      className={className}
      onError={() => {
        console.warn("Failed to load blog image:", {
          originalSrc: src,
          s3Key,
          presignedUrl: presignedUrl?.substring(0, 100) + "...",
        });
        setImageError(true);
      }}
    />
  );
}
```

## Changements Clés

### 1. Suppression de la Logique Manuelle
```diff
- function isFullUrl(url: string): boolean { ... }
- function getImageUrl(src: string | null | undefined): string | null { ... }
```
❌ Remplacé par le hook `usePresignedUrl` qui gère tout automatiquement

### 2. Ajout du Hook `usePresignedUrl`
```diff
+ import { usePresignedUrl, extractS3Key } from "@/hooks/usePresignedUrl";

+ const s3Key = extractS3Key(src);
+ const { presignedUrl, isLoading, error } = usePresignedUrl(s3Key);
```
✅ Utilise le système existant d'URLs présignées

### 3. Gestion Améliorée des États
```diff
- const [isLoading, setIsLoading] = useState(true);
+ // isLoading géré par usePresignedUrl

+ if (isLoading) {
+   return <div>Chargement...</div>;
+ }
```
✅ État de chargement cohérent avec l'API

### 4. URL Image Signée
```diff
- <img src={imageUrl} />
+ <img src={presignedUrl || undefined} />
```
✅ URL AWS signée avec `X-Amz-Signature`

## Exemple d'URL Générée

### AVANT
```
https://sorami-generated-content-9872.s3.eu-north-1.amazonaws.com/blog/images/1762357112915-ovtz4m2w6ve.webp
```
❌ Accès refusé (403 Forbidden) car bucket privé

### APRÈS
```
https://sorami-generated-content-9872.s3.eu-north-1.amazonaws.com/blog/images/1762357112915-ovtz4m2w6ve.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA...&X-Amz-Date=20250105T120000Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=abc123def456...
```
✅ Accès autorisé avec signature AWS valide pendant 1h

## Flux de Traitement

### AVANT
```
BlogPost.coverImage (DB)
  → getImageUrl() → URL S3 publique
  → <img src={url} /> → ❌ 403 Forbidden
```

### APRÈS
```
BlogPost.coverImage (DB)
  → extractS3Key() → "blog/images/xxx.webp"
  → usePresignedUrl() → GET /api/s3/presigned-url
  → AWS SDK getSignedUrl()
  → URL présignée valide 1h
  → <img src={presignedUrl} /> → ✅ 200 OK
```

## Tests de Validation

### Test 1: Console Navigateur
```javascript
// Dans la page /blog, vérifier la console
// AVANT: Erreurs 403
❌ GET https://bucket.s3.../image.webp → 403 Forbidden

// APRÈS: Requêtes réussies
✅ GET /api/s3/presigned-url?key=blog/images/xxx.webp → 200 OK
✅ GET https://bucket.s3.../image.webp?X-Amz-... → 200 OK
```

### Test 2: Network Tab
```
Requêtes observées:
1. GET /api/blog/posts → 200 OK
   → Response contient coverImage: "https://bucket.s3.../xxx.webp"

2. GET /api/s3/presigned-url?key=blog/images/xxx.webp → 200 OK
   → Response: { url: "https://...?X-Amz-...", expiresIn: 3600 }

3. GET https://bucket.s3.../xxx.webp?X-Amz-Signature=... → 200 OK
   → Content-Type: image/webp
   → Image affichée correctement
```

## Avantages du Changement

| Aspect | AVANT | APRÈS |
|--------|-------|-------|
| **Sécurité** | ❌ URLs publiques | ✅ URLs signées |
| **Bucket S3** | ❌ Doit être public | ✅ Reste privé |
| **Expiration** | ❌ Jamais | ✅ 1h configurable |
| **Cache** | ❌ Aucun | ✅ Intelligent (1h TTL) |
| **Erreurs 403** | ❌ Fréquentes | ✅ Éliminées |
| **Maintenance** | ❌ Code custom | ✅ Utilise infra existante |

## Impact sur les Autres Composants

### `BlogCoverImage` (wrapper)
```typescript
// Aucun changement requis
export function BlogCoverImage({ src, alt, className }) {
  return (
    <BlogImage
      src={src} // ✅ Fonctionne automatiquement
      alt={alt}
      className={`object-cover ${className}`}
      fallback={/* ... */}
    />
  );
}
```
✅ Compatible sans modification

### Pages utilisant `BlogImage`
- `/blog` → ✅ Fonctionne
- `/blog/[slug]` → ✅ Fonctionne
- `BlogPreview` → ✅ Fonctionne

## Conclusion

✅ **1 fichier modifié**: `src/components/ui/BlogImage.tsx`
✅ **Changement minimal**: Utilise infra existante
✅ **Pas de breaking change**: API compatible
✅ **Performance maintenue**: Cache intelligent
✅ **Sécurité améliorée**: Bucket S3 privé
