#!/usr/bin/env tsx
/**
 * Script pour ajouter des images de couverture aux articles de blog existants
 * Upload vers S3 et mise à jour de la base de données
 */

import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const prisma = new PrismaClient();

// Configuration S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'sorami-generated-content-9872';

// Images de placeholder depuis Unsplash (thème IA et technologie)
const placeholderImages = [
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop', // AI art
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&h=630&fit=crop', // AI robot
  'https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?w=1200&h=630&fit=crop', // Digital art
];

async function downloadImage(url: string): Promise<Buffer> {
  console.log(`📥 Téléchargement de l'image: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadImageToS3(buffer: Buffer, fileName: string): Promise<string> {
  // Optimiser l'image avec Sharp
  const optimizedBuffer = await sharp(buffer)
    .resize(1200, 630, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 85 })
    .toBuffer();

  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const s3Key = `blog/images/${timestamp}-${randomString}-${fileName}.webp`;

  // Upload vers S3
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: optimizedBuffer,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000',
  });

  await s3Client.send(command);
  console.log(`✅ Image uploadée: ${s3Key}`);
  
  return s3Key;
}

async function addCoverImagesToBlogPosts() {
  try {
    console.log('🚀 Début de l\'ajout d\'images de couverture...\n');

    // Récupérer les articles sans image de couverture
    const postsWithoutImages = await prisma.blogPost.findMany({
      where: {
        OR: [
          { coverImage: null },
          { coverImage: '' },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    if (postsWithoutImages.length === 0) {
      console.log('✅ Tous les articles ont déjà une image de couverture !');
      return;
    }

    console.log(`📝 ${postsWithoutImages.length} article(s) sans image trouvé(s)\n`);

    // Ajouter une image à chaque article
    for (let i = 0; i < postsWithoutImages.length; i++) {
      const post = postsWithoutImages[i];
      const imageUrl = placeholderImages[i % placeholderImages.length];

      try {
        console.log(`\n📸 Traitement: "${post.title}"`);
        
        // Télécharger l'image
        const imageBuffer = await downloadImage(imageUrl);
        
        // Upload vers S3
        const s3Key = await uploadImageToS3(imageBuffer, post.slug);
        
        // Mettre à jour l'article dans la base de données
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { coverImage: s3Key },
        });
        
        console.log(`✅ Image ajoutée pour: "${post.title}"`);
        console.log(`   S3 Key: ${s3Key}`);
        
      } catch (error) {
        console.error(`❌ Erreur pour "${post.title}":`, error);
      }
    }

    console.log('\n🎉 Traitement terminé !');
    console.log(`📊 ${postsWithoutImages.length} article(s) mis à jour`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  addCoverImagesToBlogPosts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default addCoverImagesToBlogPosts;
