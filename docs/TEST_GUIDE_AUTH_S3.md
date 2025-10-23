# Guide de Test Rapide - Sécurité Clerk + AWS S3

## 🎯 Objectif
Tester les nouvelles fonctionnalités d'authentification Clerk et stockage S3 pour la génération d'images et vidéos.

## ⚡ Tests Rapides (5 minutes)

### 1. Test Prisma Models (30 secondes)

```typescript
// Dans la console Next.js ou un script Node
import { prisma } from '@/lib/prisma';

// Créer une génération d'image de test
const testImage = await prisma.imageGeneration.create({
  data: {
    prompt: "Un coucher de soleil sur l'océan",
    authorId: "user_2abc123", // Remplacer par votre Clerk userId
    numImages: 1,
    size: "1024x1024",
    status: "PENDING",
    storageProvider: "AWS_S3",
    s3Bucket: "sorami-content",
    model: "gemini-2.0-flash-exp",
    images: {
      create: {
        filename: "test_sunset.png",
        s3Key: "user_2abc123/images/test_sunset_1234567890.png",
        fileSize: 512000,
        width: 1024,
        height: 1024,
        format: "PNG",
        aspectRatio: "1:1"
      }
    }
  },
  include: { images: true }
});

console.log("✅ Image generation created:", testImage);

// Créer une génération vidéo de test
const testVideo = await prisma.videoGeneration.create({
  data: {
    prompt: "Un chat jouant avec une pelote de laine",
    authorId: "user_2abc123",
    numberOfVideos: 1,
    durationSeconds: 8,
    aspectRatio: "16:9",
    status: "PENDING",
    storageProvider: "AWS_S3",
    s3Bucket: "sorami-content",
    model: "veo-2.0-generate-001",
    videos: {
      create: {
        filename: "test_cat.mp4",
        s3Key: "user_2abc123/videos/test_cat_1234567890.mp4",
        fileSize: 2048000,
        durationSeconds: 8,
        aspectRatio: "16:9",
        width: 1920,
        height: 1080,
        format: "mp4"
      }
    }
  },
  include: { videos: true }
});

console.log("✅ Video generation created:", testVideo);
```

### 2. Test S3 Service (1 minute)

Créer un fichier de test: `src/app/test-s3/page.tsx`

```typescript
'use client';

import { useS3Files } from '@/hooks/useS3Files';
import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';

export default function TestS3Page() {
  const { userId } = useAuth();
  const { files, uploadFile, deleteFile, downloadFile, loading, uploading, uploadProgress } = useS3Files({ 
    contentType: 'image' 
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      const result = await uploadFile(selectedFile);
      alert(`✅ Upload réussi!\nS3 Key: ${result.key}`);
    } catch (err: any) {
      alert(`❌ Erreur: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Test S3 Service</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <p><strong>User ID:</strong> {userId}</p>
        <p><strong>Files:</strong> {files.length}</p>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      </div>

      {/* Upload Section */}
      <div className="mb-8 border p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">Upload Test</h2>
        <input 
          type="file" 
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          accept="image/*"
          className="mb-4"
        />
        <button 
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {uploading ? `Uploading... ${uploadProgress}%` : 'Upload'}
        </button>
      </div>

      {/* Files List */}
      <div className="border p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">Files ({files.length})</h2>
        {files.map((file) => (
          <div key={file.key} className="flex items-center justify-between p-2 border-b">
            <div>
              <p className="font-medium">{file.filename}</p>
              <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => downloadFile(file.key, file.filename)}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                Download
              </button>
              <button 
                onClick={() => deleteFile(file.key)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Accéder à: http://localhost:3000/test-s3

### 3. Test API Endpoints (2 minutes)

```bash
# Obtenir le token Clerk depuis le navigateur (DevTools → Application → Cookies → __session)
export CLERK_TOKEN="votre_token_jwt"

# Test 1: Lister les fichiers
curl -X GET "http://localhost:3000/api/files/list?contentType=image" \
  -H "Authorization: Bearer $CLERK_TOKEN"

# Test 2: Générer presigned URL
curl -X POST "http://localhost:3000/api/files/presigned-url" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "s3Key": "user_2abc123/images/test.png",
    "expiresIn": 3600
  }'

# Test 3: Supprimer un fichier
curl -X DELETE "http://localhost:3000/api/files/delete" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "s3Key": "user_2abc123/images/test.png"
  }'
```

### 4. Test Auth Helpers (1 minute)

Créer: `src/app/test-auth-helpers/page.tsx`

```typescript
import { requireAuth, hasSubscription, hasFeatureAccess, getAuthenticatedUser } from '@/lib/auth';

export default async function TestAuthHelpersPage() {
  // Test 1: Authentification
  const user = await requireAuth();

  // Test 2: Subscription
  const isPro = await hasSubscription('pro');
  const isPremium = await hasSubscription('premium');

  // Test 3: Feature Access
  const canGenerateImages = await hasFeatureAccess('image-generation');
  const canGenerateVideos = await hasFeatureAccess('video-generation');

  // Test 4: Authenticated User
  const authUser = await getAuthenticatedUser();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Test Auth Helpers</h1>

      <div className="space-y-4">
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-semibold mb-2">User Info</h2>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Subscription Checks</h2>
          <p>✓ Is Pro: {isPro ? 'Yes' : 'No'}</p>
          <p>✓ Is Premium: {isPremium ? 'Yes' : 'No'}</p>
        </div>

        <div className="bg-purple-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Feature Access</h2>
          <p>✓ Image Generation: {canGenerateImages ? 'Allowed' : 'Denied'}</p>
          <p>✓ Video Generation: {canGenerateVideos ? 'Allowed' : 'Denied'}</p>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Authenticated User</h2>
          <pre>{JSON.stringify(authUser, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
```

Accéder à: http://localhost:3000/test-auth-helpers

---

## 🔍 Tests Détaillés (15 minutes)

### Test 1: Upload Real File

```typescript
// Dans test-s3/page.tsx ou un composant
import { useS3Files } from '@/hooks/useS3Files';

function ImageUploadTest() {
  const { uploadFile, uploading, uploadProgress } = useS3Files({ contentType: 'image' });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('📤 Starting upload...', file.name, file.size);
      
      const result = await uploadFile(file, {
        metadata: { purpose: 'test-upload' }
      });
      
      console.log('✅ Upload successful:', result);
      alert(`File uploaded!\nKey: ${result.key}\nSize: ${result.size} bytes`);
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      alert('Upload failed: ' + error.message);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      {uploading && <p>Uploading... {uploadProgress}%</p>}
    </div>
  );
}
```

### Test 2: List & Filter Files

```typescript
import { useEffect } from 'react';
import { useS3Files } from '@/hooks/useS3Files';

function FilesListTest() {
  const { files, listFiles, loading } = useS3Files({ contentType: 'image' });

  useEffect(() => {
    listFiles({ limit: 50 });
  }, []);

  return (
    <div>
      <h2>Files ({files.length})</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {files.map(file => (
            <li key={file.key}>
              {file.filename} - {(file.size / 1024).toFixed(2)} KB
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Test 3: Generate & Download Presigned URL

```typescript
import { useS3Files } from '@/hooks/useS3Files';

function PresignedUrlTest() {
  const { getDownloadUrl } = useS3Files();

  const testPresignedUrl = async () => {
    try {
      const s3Key = 'user_2abc123/images/test.png';
      
      console.log('🔗 Generating presigned URL for:', s3Key);
      const url = await getDownloadUrl(s3Key, 3600);
      
      console.log('✅ Presigned URL:', url);
      console.log('⏰ Expires in: 1 hour');
      
      // Ouvrir dans un nouvel onglet
      window.open(url, '_blank');
    } catch (error: any) {
      console.error('❌ Failed:', error);
    }
  };

  return (
    <button onClick={testPresignedUrl}>
      Generate & Open Presigned URL
    </button>
  );
}
```

### Test 4: Delete File with Verification

```typescript
import { useS3Files } from '@/hooks/useS3Files';

function DeleteFileTest() {
  const { deleteFile, files, listFiles } = useS3Files({ contentType: 'image' });

  const handleDelete = async (s3Key: string) => {
    if (!confirm(`Delete ${s3Key}?`)) return;

    try {
      console.log('🗑️  Deleting:', s3Key);
      await deleteFile(s3Key);
      console.log('✅ Deleted successfully');
      
      // Refresh list
      await listFiles();
    } catch (error: any) {
      console.error('❌ Delete failed:', error);
      alert('Delete failed: ' + error.message);
    }
  };

  return (
    <div>
      {files.map(file => (
        <div key={file.key}>
          <span>{file.filename}</span>
          <button onClick={() => handleDelete(file.key)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

---

## ✅ Checklist de Validation

### Backend Flask (Prérequis)
- [ ] Backend Flask démarré (`python app.py` sur port 9006)
- [ ] Variables d'environnement configurées:
  - [ ] `CLERK_SECRET_KEY`
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `S3_BUCKET=sorami-content`
- [ ] Endpoints S3 disponibles:
  - [ ] POST `/api/s3/upload`
  - [ ] POST `/api/s3/presigned-url`
  - [ ] DELETE `/api/s3/delete`
  - [ ] GET `/api/s3/list`

### Frontend Next.js
- [ ] Variables d'environnement configurées:
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - [ ] `CLERK_SECRET_KEY`
  - [ ] `NEXT_PUBLIC_BACKEND_API_URL=http://localhost:9006`
  - [ ] `NEXT_PUBLIC_S3_BUCKET=sorami-content`
- [ ] Prisma client généré (`npx prisma generate`)
- [ ] Build réussi (`npm run build`)
- [ ] Server démarré (`npm run dev`)

### Tests Fonctionnels
- [ ] Upload fichier image réussi
- [ ] Liste des fichiers récupérée
- [ ] Presigned URL générée et accessible
- [ ] Téléchargement fichier réussi
- [ ] Suppression fichier réussie
- [ ] Vérification propriété (tentative accès fichier autre user = erreur 403)

### Tests Sécurité
- [ ] Requête sans token = 401 Unauthorized
- [ ] Requête avec token invalide = 401
- [ ] Tentative accès fichier autre user = 403 Forbidden
- [ ] Presigned URL expire après 1 heure
- [ ] Structure S3 respectée: `user_{userId}/{contentType}s/`

---

## 🐛 Troubleshooting

### Erreur: "User not authenticated"
➡️ Vérifier que l'utilisateur est connecté via Clerk  
➡️ Ouvrir DevTools → Application → Cookies → Vérifier `__session`

### Erreur: "Failed to generate presigned URL"
➡️ Vérifier que le backend Flask est démarré (port 9006)  
➡️ Vérifier les variables AWS dans le backend  
➡️ Tester directement: `curl http://localhost:9006/health`

### Erreur: "Unauthorized: You can only access your own files"
➡️ Vérifier que le `s3Key` contient le bon `userId`  
➡️ Format attendu: `user_{userId}/images/filename.png`

### Erreur: "No space left on device" (build)
➡️ Libérer de l'espace disque  
➡️ Nettoyer cache: `rm -rf .next node_modules/.cache`

---

## 📊 Résultats Attendus

### Upload Réussi
```json
{
  "key": "user_2abc123/images/sunset_1234567890.png",
  "bucket": "sorami-content",
  "filename": "sunset_1234567890.png",
  "size": 512000,
  "contentType": "image/png",
  "url": "https://sorami-content.s3.amazonaws.com/..."
}
```

### Liste Fichiers
```json
{
  "files": [
    {
      "key": "user_2abc123/images/test1.png",
      "bucket": "sorami-content",
      "filename": "test1.png",
      "size": 512000,
      "contentType": "image/png",
      "lastModified": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "userId": "user_2abc123"
}
```

### Presigned URL
```json
{
  "url": "https://sorami-content.s3.amazonaws.com/user_2abc123/images/test.png?X-Amz-Algorithm=...",
  "expiresIn": 3600,
  "expiresAt": "2024-01-15T11:30:00Z"
}
```

**Temps total estimé:** 5-20 minutes selon les tests effectués
