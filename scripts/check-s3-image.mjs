#!/usr/bin/env node
/**
 * Script pour vérifier l'existence d'une image S3
 */

import { S3Client, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'sorami-generated-content-9872';

async function checkImage(key) {
  console.log('\n🔍 Vérification de l\'image S3...\n');
  console.log('Bucket:', BUCKET_NAME);
  console.log('Région:', process.env.AWS_REGION || 'eu-north-1');
  console.log('Clé:', key);
  console.log('---');

  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    console.log('\n✅ Image trouvée !');
    console.log('---');
    console.log('Taille:', (response.ContentLength / 1024).toFixed(2), 'KB');
    console.log('Type:', response.ContentType);
    console.log('Dernière modification:', response.LastModified);
    console.log('ETag:', response.ETag);

    return true;
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      console.log('\n❌ Image non trouvée sur S3');
      console.log('---');
      console.log('L\'image n\'existe pas à cet emplacement.');
      
      // Essayer de lister les images disponibles dans le dossier blog/images
      await listBlogImages();
    } else if (error.name === 'Forbidden' || error.$metadata?.httpStatusCode === 403) {
      console.log('\n🚫 Accès refusé');
      console.log('---');
      console.log('Vérifiez les permissions IAM de votre compte AWS.');
    } else {
      console.log('\n⚠️ Erreur:', error.message);
      console.log('Code:', error.code || error.name);
    }
    return false;
  }
}

async function listBlogImages() {
  console.log('\n📂 Liste des images dans blog/images/...\n');

  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'blog/images/',
      MaxKeys: 20,
    });

    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      console.log('Aucune image trouvée dans blog/images/');
      return;
    }

    console.log(`Trouvé ${response.Contents.length} image(s):`);
    response.Contents.forEach((obj) => {
      const size = (obj.Size / 1024).toFixed(2);
      console.log(`  - ${obj.Key} (${size} KB)`);
    });

  } catch (error) {
    console.log('Erreur lors de la liste:', error.message);
  }
}

// Récupérer la clé depuis les arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node check-s3-image.mjs <s3-key>');
  console.log('Exemple: node check-s3-image.mjs blog/images/1762214208016-pvrr2w6chp.webp');
  process.exit(1);
}

const key = args[0];
checkImage(key);
