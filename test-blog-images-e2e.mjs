#!/usr/bin/env node
/**
 * Test End-to-End : Vérification complète du système d'images de blog
 */

console.log('🧪 Test E2E - Images de Blog avec URLs Présignées\n');
console.log('================================================\n');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testE2E() {
  const baseUrl = 'http://localhost:3001';
  
  try {
    // Test 1: API Blog Posts
    console.log('📡 Test 1: API Blog Posts');
    console.log('   GET /api/blog/posts?limit=2\n');
    
    const postsResponse = await fetch(`${baseUrl}/api/blog/posts?limit=2`);
    
    if (!postsResponse.ok) {
      throw new Error(`API Blog Posts failed: ${postsResponse.status}`);
    }
    
    const postsData = await postsResponse.json();
    console.log(`   ✅ ${postsData.posts.length} articles récupérés`);
    
    if (postsData.posts.length === 0) {
      console.log('   ⚠️  Aucun article trouvé\n');
      return;
    }
    
    const firstPost = postsData.posts[0];
    console.log(`   📄 Article: "${firstPost.title.substring(0, 50)}..."`);
    console.log(`   🖼️  CoverImage: ${firstPost.coverImage ? 'Présente' : 'Absente'}\n`);
    
    if (!firstPost.coverImage) {
      console.log('   ⚠️  Pas d\'image de couverture pour ce test\n');
      return;
    }
    
    // Test 2: Extraction de la clé S3
    console.log('🔑 Test 2: Extraction Clé S3');
    const s3Url = firstPost.coverImage;
    console.log(`   URL originale: ${s3Url.substring(0, 60)}...`);
    
    const urlObj = new URL(s3Url);
    const s3Key = urlObj.pathname.substring(1);
    console.log(`   ✅ Clé extraite: ${s3Key}\n`);
    
    // Test 3: Génération URL Présignée
    console.log('🔐 Test 3: API Presigned URL');
    console.log(`   GET /api/s3/presigned-url?key=${s3Key.substring(0, 30)}...\n`);
    
    const presignedResponse = await fetch(
      `${baseUrl}/api/s3/presigned-url?key=${encodeURIComponent(s3Key)}`
    );
    
    if (!presignedResponse.ok) {
      const errorData = await presignedResponse.json();
      throw new Error(`API Presigned URL failed: ${JSON.stringify(errorData)}`);
    }
    
    const presignedData = await presignedResponse.json();
    console.log(`   ✅ URL présignée générée`);
    console.log(`   ⏱️  Expire dans: ${presignedData.expiresIn}s`);
    console.log(`   🔗 URL: ${presignedData.url.substring(0, 80)}...\n`);
    
    // Test 4: Vérifier que l'URL présignée est valide
    console.log('🌐 Test 4: Validation URL Présignée');
    console.log('   HEAD request vers URL présignée...\n');
    
    const imageResponse = await fetch(presignedData.url, { method: 'HEAD' });
    
    if (!imageResponse.ok) {
      throw new Error(`Image not accessible: ${imageResponse.status}`);
    }
    
    const contentType = imageResponse.headers.get('content-type');
    const contentLength = imageResponse.headers.get('content-length');
    
    console.log(`   ✅ Image accessible`);
    console.log(`   📦 Content-Type: ${contentType}`);
    console.log(`   📊 Taille: ${(parseInt(contentLength) / 1024).toFixed(2)} KB\n`);
    
    // Test 5: Cache test (2e requête)
    console.log('💾 Test 5: Test Cache');
    console.log('   2e requête pour la même clé...\n');
    
    const start = Date.now();
    const cachedResponse = await fetch(
      `${baseUrl}/api/s3/presigned-url?key=${encodeURIComponent(s3Key)}`
    );
    const duration = Date.now() - start;
    
    if (!cachedResponse.ok) {
      throw new Error('Cache test failed');
    }
    
    console.log(`   ✅ Requête réussie en ${duration}ms`);
    console.log(`   📝 Note: Le cache côté client devrait éviter cette requête\n`);
    
    // Résumé
    console.log('═══════════════════════════════════════════════════\n');
    console.log('🎉 TOUS LES TESTS RÉUSSIS !\n');
    console.log('✅ API Blog Posts: OK');
    console.log('✅ Extraction clé S3: OK');
    console.log('✅ Génération URL présignée: OK');
    console.log('✅ Accessibilité image: OK');
    console.log('✅ API répond correctement: OK\n');
    console.log('📌 Les images de blog devraient maintenant s\'afficher');
    console.log('   correctement avec des URLs présignées S3 sécurisées.\n');
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error('\n💡 Vérifications:');
    console.error('   1. Le serveur Next.js est-il démarré ?');
    console.error('      → npm run dev');
    console.error('   2. Les variables AWS sont-elles configurées ?');
    console.error('      → Vérifier .env.local');
    console.error('   3. Le bucket S3 est-il accessible ?');
    console.error('      → Vérifier les credentials AWS\n');
    process.exit(1);
  }
}

// Exécuter le test
testE2E();
