#!/usr/bin/env node
/**
 * Test simple de l'API blog
 */

async function testBlogAPI() {
  console.log('🧪 Test API Blog Posts\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/blog/posts?limit=2');
    
    if (!response.ok) {
      console.error('❌ Erreur HTTP:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    
    console.log('📊 Résultat:');
    console.log('Total articles:', data.pagination?.total || 0);
    console.log('');
    
    if (data.posts && data.posts.length > 0) {
      data.posts.forEach((post, index) => {
        console.log(`🔍 Article ${index + 1}:`);
        console.log('  Titre:', post.title);
        console.log('  Slug:', post.slug);
        console.log('  CoverImage:', post.coverImage || '(aucune)');
        console.log('  Auteur:', post.author?.name || '(inconnu)');
        console.log('  Publié:', post.published ? 'Oui' : 'Non');
        console.log('');
      });
    } else {
      console.log('❌ Aucun article trouvé');
    }
    
    console.log('✅ Test terminé');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testBlogAPI();
