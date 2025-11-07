/**
 * Script de migration des images de blog
 * Copie les images depuis sorami-generated-content-9872 vers sorami-blog
 * Et met à jour les URLs en base de données
 */

import { S3Client, ListObjectsV2Command, CopyObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

// Configuration S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const OLD_BUCKET = 'sorami-generated-content-9872';
const NEW_BUCKET = 'sorami-blog';

async function main() {
  console.log('🚀 Migration des images de blog vers bucket public');
  console.log(`   Source: ${OLD_BUCKET}`);
  console.log(`   Destination: ${NEW_BUCKET}\n`);

  try {
    // 1. Lister toutes les images de blog dans l'ancien bucket
    console.log('📋 Listage des images...');
    const listCommand = new ListObjectsV2Command({
      Bucket: OLD_BUCKET,
      Prefix: 'blog/images/',
    });

    const listResponse = await s3Client.send(listCommand);
    const images = listResponse.Contents || [];
    
    console.log(`   ✓ ${images.length} images trouvées\n`);

    if (images.length === 0) {
      console.log('⚠️  Aucune image à migrer');
      return;
    }

    // 2. Copier chaque image vers le nouveau bucket
    console.log('📦 Copie des images...');
    let successCount = 0;
    let errorCount = 0;

    for (const image of images) {
      try {
        const copyCommand = new CopyObjectCommand({
          Bucket: NEW_BUCKET,
          CopySource: `${OLD_BUCKET}/${image.Key}`,
          Key: image.Key,
          ACL: 'public-read', // Rendre l'image publique
          MetadataDirective: 'COPY',
        });

        await s3Client.send(copyCommand);
        successCount++;
        console.log(`   ✓ ${image.Key}`);
      } catch (error) {
        errorCount++;
        console.error(`   ✗ ${image.Key}: ${error.message}`);
      }
    }

    console.log(`\n✅ Copie terminée: ${successCount} succès, ${errorCount} erreurs\n`);

    // 3. Mettre à jour les URLs en base de données
    console.log('🔄 Mise à jour de la base de données...');
    
    const oldUrlPattern = `https://${OLD_BUCKET}.s3.`;
    const newUrlPattern = `https://${NEW_BUCKET}.s3.`;

    // Compter les articles à mettre à jour
    const postsToUpdate = await prisma.blogPost.findMany({
      where: {
        OR: [
          { coverImage: { contains: OLD_BUCKET } },
          { content: { contains: OLD_BUCKET } },
        ],
      },
      select: { id: true, title: true, coverImage: true },
    });

    console.log(`   ${postsToUpdate.length} articles à mettre à jour`);

    let dbSuccessCount = 0;
    let dbErrorCount = 0;

    for (const post of postsToUpdate) {
      try {
        const updates = {};
        
        // Mettre à jour coverImage si nécessaire
        if (post.coverImage && post.coverImage.includes(OLD_BUCKET)) {
          updates.coverImage = post.coverImage.replace(oldUrlPattern, newUrlPattern);
        }

        // Récupérer et mettre à jour le contenu
        const fullPost = await prisma.blogPost.findUnique({
          where: { id: post.id },
          select: { content: true },
        });

        if (fullPost.content && fullPost.content.includes(OLD_BUCKET)) {
          updates.content = fullPost.content.replace(
            new RegExp(oldUrlPattern.replace('.', '\\.'), 'g'),
            newUrlPattern
          );
        }

        if (Object.keys(updates).length > 0) {
          await prisma.blogPost.update({
            where: { id: post.id },
            data: updates,
          });
          
          dbSuccessCount++;
          console.log(`   ✓ ${post.title}`);
        }
      } catch (error) {
        dbErrorCount++;
        console.error(`   ✗ ${post.title}: ${error.message}`);
      }
    }

    console.log(`\n✅ Base de données mise à jour: ${dbSuccessCount} articles modifiés, ${dbErrorCount} erreurs\n`);

    // 4. Résumé
    console.log('📊 Résumé de la migration:');
    console.log(`   Images copiées: ${successCount}/${images.length}`);
    console.log(`   Articles mis à jour: ${dbSuccessCount}/${postsToUpdate.length}`);
    console.log(`   Nouveau bucket: ${NEW_BUCKET}`);
    console.log('\n✨ Migration terminée !');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
