#!/usr/bin/env node
/**
 * Script pour tester la génération d'URL présignée directement
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: resolve(__dirname, '.env.local') });

console.log('🔍 Configuration AWS détectée:');
console.log('  - AWS_REGION:', process.env.AWS_REGION || 'NOT SET');
console.log('  - AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME || 'NOT SET');
console.log('  - AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✓ SET' : '✗ NOT SET');
console.log('  - AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ SET' : '✗ NOT SET');
console.log('');

async function testPresignedUrl() {
  try {
    // Configuration S3
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'sorami-generated-content-9872';
    const TEST_KEY = 'blog/images/1762293105452-392i5zwragk.webp';

    console.log('🚀 Génération de l\'URL présignée...');
    console.log('  - Bucket:', BUCKET_NAME);
    console.log('  - Key:', TEST_KEY);
    console.log('');

    // Générer URL présignée
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: TEST_KEY,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 heure
    });

    console.log('✅ URL présignée générée avec succès!');
    console.log('');
    console.log('🔗 URL présignée:');
    console.log(presignedUrl);
    console.log('');
    console.log('⏱️  Expire dans: 3600 secondes (1 heure)');

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
    console.error('');
    console.error('Détails de l\'erreur:');
    console.error('  - Code:', error.code);
    console.error('  - Name:', error.name);
    console.error('  - Message:', error.message);
    process.exit(1);
  }
}

testPresignedUrl();
