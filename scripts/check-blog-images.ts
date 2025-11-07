#!/usr/bin/env tsx
/**
 * Script pour vérifier les URLs d'images dans les articles de blog
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBlogImages() {
  try {
    console.log('🔍 Vérification des images de blog...\n');

    const posts = await prisma.blogPost.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        published: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (posts.length === 0) {
      console.log('❌ Aucun article trouvé');
      return;
    }

    console.log(`📊 ${posts.length} article(s) trouvé(s):\n`);

    posts.forEach((post, index) => {
      console.log(`\n${index + 1}. "${post.title}"`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Publié: ${post.published ? 'Oui' : 'Non'}`);
      console.log(`   CoverImage: ${post.coverImage || '(aucune)'}`);
      
      if (post.coverImage) {
        // Analyser le format de l'URL
        if (post.coverImage.startsWith('http')) {
          console.log(`   Format: URL complète`);
          if (post.coverImage.includes('amazonaws.com')) {
            console.log(`   Type: URL S3`);
          }
        } else if (post.coverImage.includes('/')) {
          console.log(`   Format: Clé S3 (${post.coverImage.split('/')[0]}/...)`);
        } else {
          console.log(`   Format: Inconnu`);
        }
      }
    });

    console.log('\n✅ Vérification terminée');
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkBlogImages();
