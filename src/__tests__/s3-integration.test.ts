/**
 * Tests d'Intégration S3
 * 
 * Tests E2E pour vérifier le workflow complet:
 * - Upload fichier
 * - Liste fichiers
 * - Génération presigned URL
 * - Téléchargement
 * - Suppression
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
let authToken: string;
let testS3Key: string;
let testUserId: string;

// Mock d'un fichier de test
function createTestFile(): File {
  const content = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG header
  const blob = new Blob([content], { type: 'image/jpeg' });
  return new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
}

describe('S3 Integration Tests', () => {
  beforeAll(async () => {
    // TODO: Obtenir un token Clerk de test
    // authToken = await getTestClerkToken();
    // testUserId = 'user_test_123';
    
    console.log('⚠️  Tests nécessitent un token Clerk valide');
    console.log('⚠️  Définir AUTH_TOKEN et USER_ID dans les variables d\'environnement');
  });

  describe('Upload File', () => {
    it('should upload a file to S3', async () => {
      if (!authToken) {
        console.log('⏭️  Skipping: No auth token');
        return;
      }

      const file = createTestFile();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('content_type', 'image');

      const response = await fetch(`${API_URL}/api/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('s3Key');
      expect(data).toHaveProperty('bucket');
      expect(data.s3Key).toContain(testUserId);
      
      testS3Key = data.s3Key;
      console.log('✅ File uploaded:', testS3Key);
    });

    it('should reject upload without auth', async () => {
      const file = createTestFile();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/files/upload`, {
        method: 'POST',
        body: formData,
      });

      expect(response.status).toBe(401);
    });
  });

  describe('List Files', () => {
    it('should list user files', async () => {
      if (!authToken) {
        console.log('⏭️  Skipping: No auth token');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/files/list?contentType=image`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('files');
      expect(Array.isArray(data.files)).toBe(true);
      expect(data).toHaveProperty('userId');
      
      console.log(`✅ Listed ${data.files.length} files`);
    });

    it('should filter files by contentType', async () => {
      if (!authToken) {
        console.log('⏭️  Skipping: No auth token');
        return;
      }

      const responseImages = await fetch(
        `${API_URL}/api/files/list?contentType=image`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const responseBooks = await fetch(
        `${API_URL}/api/files/list?contentType=book`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect(responseImages.status).toBe(200);
      expect(responseBooks.status).toBe(200);
      
      const dataImages = await responseImages.json();
      const dataBooks = await responseBooks.json();
      
      console.log(`✅ Images: ${dataImages.files.length}, Books: ${dataBooks.files.length}`);
    });
  });

  describe('Presigned URL', () => {
    it('should generate presigned URL', async () => {
      if (!authToken || !testS3Key) {
        console.log('⏭️  Skipping: No auth token or test file');
        return;
      }

      const response = await fetch(`${API_URL}/api/files/presigned-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          s3Key: testS3Key,
          expiresIn: 3600,
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('url');
      expect(data).toHaveProperty('expiresIn');
      expect(data).toHaveProperty('expiresAt');
      expect(data.url).toContain('amazonaws.com');
      
      console.log('✅ Presigned URL generated');
      console.log('   Expires in:', data.expiresIn, 'seconds');
    });

    it('should reject unauthorized file access', async () => {
      if (!authToken) {
        console.log('⏭️  Skipping: No auth token');
        return;
      }

      // Tenter d'accéder au fichier d'un autre utilisateur
      const otherUserKey = 'user_other123/images/test.png';

      const response = await fetch(`${API_URL}/api/files/presigned-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          s3Key: otherUserKey,
          expiresIn: 3600,
        }),
      });

      expect(response.status).toBe(403);
      console.log('✅ Unauthorized access blocked');
    });
  });

  describe('Download File', () => {
    it('should download file via presigned URL', async () => {
      if (!authToken || !testS3Key) {
        console.log('⏭️  Skipping: No auth token or test file');
        return;
      }

      // Générer presigned URL
      const urlResponse = await fetch(`${API_URL}/api/files/presigned-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          s3Key: testS3Key,
          expiresIn: 3600,
        }),
      });

      const urlData = await urlResponse.json();
      const presignedUrl = urlData.url;

      // Télécharger via presigned URL
      const downloadResponse = await fetch(presignedUrl);
      
      expect(downloadResponse.status).toBe(200);
      expect(downloadResponse.headers.get('content-type')).toContain('image');
      
      const blob = await downloadResponse.blob();
      expect(blob.size).toBeGreaterThan(0);
      
      console.log('✅ File downloaded:', blob.size, 'bytes');
    });
  });

  describe('Delete File', () => {
    it('should delete file', async () => {
      if (!authToken || !testS3Key) {
        console.log('⏭️  Skipping: No auth token or test file');
        return;
      }

      const response = await fetch(`${API_URL}/api/files/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          s3Key: testS3Key,
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      
      console.log('✅ File deleted:', testS3Key);
    });

    it('should reject unauthorized delete', async () => {
      if (!authToken) {
        console.log('⏭️  Skipping: No auth token');
        return;
      }

      const otherUserKey = 'user_other123/images/test.png';

      const response = await fetch(`${API_URL}/api/files/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          s3Key: otherUserKey,
        }),
      });

      expect(response.status).toBe(403);
      console.log('✅ Unauthorized delete blocked');
    });
  });

  describe('Security Tests', () => {
    it('should require authentication for all endpoints', async () => {
      const endpoints = [
        { method: 'GET', path: '/api/files/list' },
        { method: 'POST', path: '/api/files/presigned-url' },
        { method: 'DELETE', path: '/api/files/delete' },
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`${API_URL}${endpoint.path}`, {
          method: endpoint.method,
          ...(endpoint.method !== 'GET' && {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          }),
        });

        expect(response.status).toBe(401);
        console.log(`✅ ${endpoint.method} ${endpoint.path} requires auth`);
      }
    });

    it('should enforce ownership checks', async () => {
      if (!authToken) {
        console.log('⏭️  Skipping: No auth token');
        return;
      }

      const otherUserFiles = [
        'user_other123/images/test1.png',
        'user_other123/books/test.pdf',
        'user_other123/videos/test.mp4',
      ];

      for (const s3Key of otherUserFiles) {
        // Test presigned URL
        const urlResponse = await fetch(`${API_URL}/api/files/presigned-url`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ s3Key }),
        });

        expect(urlResponse.status).toBe(403);

        // Test delete
        const deleteResponse = await fetch(`${API_URL}/api/files/delete`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ s3Key }),
        });

        expect(deleteResponse.status).toBe(403);
      }

      console.log('✅ Ownership checks enforced');
    });
  });
});

// Script pour exécuter les tests manuellement
if (require.main === module) {
  console.log('🧪 Running S3 Integration Tests...\n');
  console.log('⚠️  Set AUTH_TOKEN and USER_ID environment variables\n');
  
  // Exemple d'exécution manuelle
  authToken = process.env.AUTH_TOKEN || '';
  testUserId = process.env.USER_ID || '';
  
  if (!authToken) {
    console.error('❌ AUTH_TOKEN not set');
    console.log('   Get token from DevTools → Application → Cookies → __session');
    process.exit(1);
  }
  
  console.log('✅ Auth token set');
  console.log('✅ User ID:', testUserId);
  console.log('\n🚀 Starting tests...\n');
}
