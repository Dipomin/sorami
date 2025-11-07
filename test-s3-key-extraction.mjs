#!/usr/bin/env node
/**
 * Test de l'extraction de clé S3
 */

function extractS3Key(url) {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    
    if (urlObj.hostname.includes('amazonaws.com')) {
      return urlObj.pathname.substring(1);
    }
    
    return url;
  } catch {
    return url;
  }
}

// Test avec une vraie URL
const testUrl = 'https://sorami-generated-content-9872.s3.eu-north-1.amazonaws.com/blog/images/1762357112915-ovtz4m2w6ve.webp';

console.log('🧪 Test extraction clé S3\n');
console.log('URL originale:', testUrl);
console.log('');

const key = extractS3Key(testUrl);
console.log('Clé extraite:', key);
console.log('');

// Tester l'API de presigned URL
async function testPresignedUrl() {
  try {
    const response = await fetch(`http://localhost:3001/api/s3/presigned-url?key=${encodeURIComponent(key)}`);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Erreur API:', error);
      return;
    }
    
    const data = await response.json();
    console.log('✅ URL présignée générée:');
    console.log('URL:', data.url?.substring(0, 100) + '...');
    console.log('Expire dans:', data.expiresIn, 'secondes');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testPresignedUrl();
