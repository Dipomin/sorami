#!/usr/bin/env node
/**
 * Script pour lister tous les objets dans le bucket S3
 */

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
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

async function listAllObjects(prefix = '') {
  console.log('\n📦 Liste des objets S3\n');
  console.log('Bucket:', BUCKET_NAME);
  console.log('Région:', process.env.AWS_REGION || 'eu-north-1');
  if (prefix) console.log('Préfixe:', prefix);
  console.log('---\n');

  try {
    let continuationToken = undefined;
    let totalObjects = 0;
    let page = 1;

    do {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        MaxKeys: 100,
        ContinuationToken: continuationToken,
      });

      const response = await s3Client.send(command);

      if (!response.Contents || response.Contents.length === 0) {
        if (page === 1) {
          console.log('❌ Aucun objet trouvé' + (prefix ? ` avec le préfixe "${prefix}"` : ''));
        }
        break;
      }

      console.log(`\n📄 Page ${page} (${response.Contents.length} objets):\n`);

      response.Contents.forEach((obj, index) => {
        const size = ((obj.Size || 0) / 1024).toFixed(2);
        const date = obj.LastModified?.toLocaleString() || 'N/A';
        console.log(`${totalObjects + index + 1}. ${obj.Key}`);
        console.log(`   Taille: ${size} KB | Modifié: ${date}`);
      });

      totalObjects += response.Contents.length;
      continuationToken = response.NextContinuationToken;
      page++;

    } while (continuationToken);

    console.log(`\n✅ Total: ${totalObjects} objet(s) trouvé(s)`);

  } catch (error) {
    console.log('\n❌ Erreur:', error.message);
    console.log('Code:', error.code || error.name);
    
    if (error.name === 'CredentialsError' || error.name === 'InvalidAccessKeyId') {
      console.log('\n⚠️  Vérifiez vos credentials AWS dans .env.local');
    } else if (error.name === 'NoSuchBucket') {
      console.log('\n⚠️  Le bucket n\'existe pas ou le nom est incorrect');
    } else if (error.name === 'AccessDenied') {
      console.log('\n⚠️  Accès refusé - vérifiez les permissions IAM');
    }
  }
}

// Récupérer le préfixe depuis les arguments
const args = process.argv.slice(2);
const prefix = args[0] || '';

listAllObjects(prefix);
