/**
 * Test de configuration AWS avec chargement .env
 */

import { config } from 'dotenv';
import { join } from 'path';

// Charger les variables d'environnement
config({ path: join(process.cwd(), '.env.local') });
config({ path: join(process.cwd(), '.env') });

console.log('🔍 Configuration AWS S3 après chargement .env:\n');

const awsConfig = {
  'AWS_REGION': process.env.AWS_REGION,
  'AWS_S3_BUCKET_NAME': process.env.AWS_S3_BUCKET_NAME,
  'AWS_ACCESS_KEY_ID': process.env.AWS_ACCESS_KEY_ID ? '✅ Configuré' : '❌ Manquant',
  'AWS_SECRET_ACCESS_KEY': process.env.AWS_SECRET_ACCESS_KEY ? '✅ Configuré' : '❌ Manquant',
};

for (const [key, value] of Object.entries(awsConfig)) {
  console.log(`${key}: ${value}`);
}

console.log('\n🌐 URL S3 qui sera générée:');
const bucketName = process.env.AWS_S3_BUCKET_NAME || 'sorami-generated-content-9872';
const region = process.env.AWS_REGION || 'eu-north-1';
console.log(`https://${bucketName}.s3.${region}.amazonaws.com/`);

// Vérification de la région
const validRegions = ['eu-north-1', 'us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1'];
if (validRegions.includes(region)) {
  console.log(`✅ Région "${region}" valide`);
} else {
  console.log(`❌ Région "${region}" invalide`);
  console.log(`💡 Vérifiez que cette région existe dans AWS`);
}

// Test de résolution DNS (simulation)
console.log('\n🔍 Vérification de l\'URL:');
const expectedUrl = `https://${bucketName}.s3.${region}.amazonaws.com/`;
console.log(`URL attendue: ${expectedUrl}`);

if (region === 'us-north-1') {
  console.log('❌ PROBLÈME DÉTECTÉ: "us-north-1" n\'existe pas dans AWS!');
  console.log('💡 Corrigez vers "us-east-1" ou "eu-north-1"');
} else {
  console.log('✅ Région semble correcte');
}