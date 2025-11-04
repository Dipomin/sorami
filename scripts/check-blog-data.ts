import { prisma } from '../src/lib/prisma';

async function checkBlogPosts() {
  try {
    console.log('🔍 Vérification des articles de blog...');
    
    const posts = await prisma.blogPost.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 Nombre total d'articles: ${posts.length}`);
    
    if (posts.length > 0) {
      console.log('\n📝 Articles trouvés:');
      posts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   📝 Slug: ${post.slug}`);
        console.log(`   👤 Auteur: ${post.author?.name || 'Inconnu'}`);
        console.log(`   📊 Statut: ${post.status}`);
        console.log(`   📅 Créé: ${post.createdAt.toLocaleDateString('fr-FR')}`);
        console.log(`   👁️ Vues: ${post.viewsCount}`);
        console.log(`   ⏱️ Lecture: ${post.readingTime || 'N/A'} min`);
        console.log('   ---');
      });
    } else {
      console.log('❌ Aucun article trouvé en base de données');
    }
    
    // Vérifier les catégories
    const categories = await prisma.blogCategory.findMany();
    console.log(`\n📂 Catégories disponibles: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

checkBlogPosts();