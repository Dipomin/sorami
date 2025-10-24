/**
 * Script pour vérifier les images de l'utilisateur dans la base de données
 * Usage: npx tsx scripts/check-user-images.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserImages() {
  try {
    console.log('🔍 Vérification des images dans la base de données...\n');

    // Compter toutes les générations d'images
    const totalGenerations = await prisma.imageGeneration.count();
    console.log(`📊 Total générations d'images: ${totalGenerations}`);

    // Compter les générations complétées
    const completedGenerations = await prisma.imageGeneration.count({
      where: { status: 'COMPLETED' }
    });
    console.log(`✅ Générations complétées: ${completedGenerations}`);

    // Compter toutes les images
    const totalImages = await prisma.imageFile.count();
    console.log(`🖼️ Total images fichiers: ${totalImages}\n`);

    // Récupérer les 5 dernières générations complétées
    console.log('📋 Dernières générations complétées:\n');
    const recentGenerations = await prisma.imageGeneration.findMany({
      where: { status: 'COMPLETED' },
      include: {
        images: true,
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: { completedAt: 'desc' },
      take: 5
    });

    if (recentGenerations.length === 0) {
      console.log('❌ Aucune génération complétée trouvée');
    } else {
      recentGenerations.forEach((gen, index) => {
        console.log(`${index + 1}. Génération ${gen.id}`);
        console.log(`   Utilisateur: ${gen.author.email} (${gen.author.firstName} ${gen.author.lastName})`);
        console.log(`   Prompt: ${gen.prompt.substring(0, 60)}...`);
        console.log(`   Images: ${gen.images.length}`);
        gen.images.forEach((img, idx) => {
          console.log(`      ${idx + 1}. ${img.filename}`);
          console.log(`         URL: ${img.fileUrl || 'N/A'}`);
          console.log(`         S3 Key: ${img.s3Key}`);
        });
        console.log(`   Date: ${gen.completedAt?.toLocaleString('fr-FR')}\n`);
      });
    }

    // Statistiques par utilisateur
    console.log('👥 Statistiques par utilisateur:\n');
    const userStats = await prisma.imageGeneration.groupBy({
      by: ['authorId'],
      where: { status: 'COMPLETED' },
      _count: {
        id: true
      }
    });

    for (const stat of userStats) {
      const user = await prisma.user.findUnique({
        where: { id: stat.authorId },
        select: { email: true, firstName: true, lastName: true }
      });
      console.log(`${user?.email || 'Unknown'}: ${stat._count.id} générations`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserImages();
