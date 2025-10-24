/**
 * Script pour tester l'API /api/images/user
 * Usage: npx tsx scripts/test-images-api.ts <userId>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testImagesApi() {
  try {
    const userId = process.argv[2];
    
    if (!userId) {
      console.error('❌ Usage: npx tsx scripts/test-images-api.ts <userId>');
      process.exit(1);
    }

    console.log(`🔍 Test API /api/images/user pour l'utilisateur: ${userId}\n`);

    // Simuler ce que fait l'API
    const imageGenerations = await prisma.imageGeneration.findMany({
      where: {
        authorId: userId,
        status: 'COMPLETED',
      },
      include: {
        images: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    console.log(`📊 Générations trouvées: ${imageGenerations.length}\n`);

    // Transformer comme l'API
    const generations = imageGenerations.map((gen) => ({
      id: gen.id,
      prompt: gen.prompt,
      status: gen.status,
      numImages: gen.numImages,
      createdAt: gen.createdAt.toISOString(),
      completedAt: gen.completedAt?.toISOString() || null,
      model: gen.model,
      processingTime: gen.processingTime,
      images: gen.images.map((img) => ({
        id: img.id,
        filename: img.filename,
        fileUrl: img.fileUrl || '',
        fileSize: img.fileSize,
        format: img.format,
        width: img.width,
        height: img.height,
        aspectRatio: img.aspectRatio,
        createdAt: img.createdAt.toISOString(),
      })),
    }));

    // Afficher les résultats
    console.log('📦 Réponse API simulée:');
    console.log(JSON.stringify({ success: true, count: generations.length, generations }, null, 2));

    // Extraire toutes les images comme le fait le frontend
    const allImages: any[] = [];
    generations.forEach((gen) => {
      if (gen.images && gen.images.length > 0) {
        gen.images.forEach((img) => {
          if (img.fileUrl) {
            allImages.push(img);
          }
        });
      }
    });

    console.log(`\n🖼️ Images extraites pour affichage: ${allImages.length}`);
    allImages.forEach((img, idx) => {
      console.log(`\n${idx + 1}. ${img.filename}`);
      console.log(`   URL: ${img.fileUrl.substring(0, 100)}...`);
      console.log(`   Dimensions: ${img.width}x${img.height}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testImagesApi();
