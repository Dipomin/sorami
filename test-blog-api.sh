#!/bin/bash

echo "🧪 Test API Blog Posts"
echo "======================"
echo ""

# Attendre que le serveur démarre
sleep 3

# Tester l'API
echo "📡 Requête: GET /api/blog/posts?limit=2"
echo ""

curl -s "http://localhost:3001/api/blog/posts?limit=2" | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
console.log('📊 Résultat:');
console.log('Total articles:', data.pagination?.total || 0);
console.log('');
if (data.posts && data.posts.length > 0) {
  console.log('🔍 Premier article:');
  const post = data.posts[0];
  console.log('  Titre:', post.title);
  console.log('  Slug:', post.slug);
  console.log('  CoverImage:', post.coverImage || '(aucune)');
  console.log('  Auteur:', post.author?.name || '(inconnu)');
  console.log('  Publié:', post.published ? 'Oui' : 'Non');
  console.log('');
  if (data.posts.length > 1) {
    console.log('🔍 Deuxième article:');
    const post2 = data.posts[1];
    console.log('  Titre:', post2.title);
    console.log('  CoverImage:', post2.coverImage || '(aucune)');
  }
} else {
  console.log('❌ Aucun article trouvé');
}
"

echo ""
echo "✅ Test terminé"
