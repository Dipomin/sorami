#!/bin/bash

# 🧪 Script de test - Fonctionnalité Blog avec Backend Indisponible
# Ce script teste que l'application fonctionne même sans le backend CrewAI

echo "🧪 Test de la fonctionnalité Blog (Backend indisponible)"
echo "=========================================================="
echo ""

# Configuration
FRONTEND_URL="http://localhost:3001"
API_URL="$FRONTEND_URL/api/blog"

echo "📍 Frontend URL: $FRONTEND_URL"
echo "📍 API URL: $API_URL"
echo ""

# Test 1 : Vérifier que le frontend est accessible
echo "✅ Test 1 : Frontend accessible"
curl -s -o /dev/null -w "Status: %{http_code}\n" $FRONTEND_URL
echo ""

# Test 2 : Tester la création d'un job (devrait fonctionner même sans backend)
echo "✅ Test 2 : Création d'un job sans backend"
echo "   Note: Devrait retourner un warning mais pas d'erreur"
echo ""

# Créer un payload de test
cat > /tmp/blog-test-request.json << 'EOF'
{
  "topic": "Les meilleures pratiques SEO en 2025",
  "goal": "Aider les développeurs à optimiser leur contenu",
  "target_word_count": 2000
}
EOF

# Appeler l'API (nécessite authentification - à adapter)
echo "   Payload:"
cat /tmp/blog-test-request.json
echo ""
echo "   Pour tester, ouvrez votre navigateur à:"
echo "   👉 $FRONTEND_URL/blog/create"
echo ""

# Test 3 : Simuler un webhook de complétion
echo "✅ Test 3 : Simulation webhook (sans backend)"
echo "   Pour simuler un webhook:"
echo "   👉 ./test-blog-webhook.sh"
echo ""

# Test 4 : Vérifier Prisma Studio
echo "✅ Test 4 : Vérifier les données en DB"
echo "   Ouvrir Prisma Studio:"
echo "   👉 npx prisma studio"
echo "   Vérifier les tables:"
echo "   - blog_jobs (jobs créés)"
echo "   - blog_articles (articles après webhook)"
echo ""

# Résumé
echo "📊 Résumé des tests"
echo "===================="
echo ""
echo "Tests manuels à effectuer:"
echo ""
echo "1. 🌐 Ouvrir le frontend"
echo "   open $FRONTEND_URL/blog/create"
echo ""
echo "2. 📝 Remplir le formulaire et soumettre"
echo "   - Topic: 'Test SEO 2025'"
echo "   - Goal: 'Tester la résilience'"
echo "   - Word Count: 2000"
echo ""
echo "3. ✅ Vérifier le résultat attendu"
echo "   - ✅ Job créé (pas de crash)"
echo "   - ⚠️ Message: 'Backend non disponible'"
echo "   - ✅ Redirection vers page de progression"
echo ""
echo "4. 🔍 Vérifier dans Prisma Studio"
echo "   npx prisma studio"
echo "   - Table blog_jobs → Nouveau job avec status PENDING"
echo "   - Champ error → 'Backend CrewAI non disponible'"
echo ""
echo "5. 🎭 Simuler le webhook"
echo "   ./test-blog-webhook.sh"
echo "   - ✅ Article créé dans blog_articles"
echo "   - ✅ Visible dans /blog"
echo ""
echo "6. 📄 Voir l'article créé"
echo "   open $FRONTEND_URL/blog"
echo "   - ✅ Article affiché avec score SEO"
echo "   - ✅ Cliquer → Page détail fonctionne"
echo ""

echo "🎯 Résultat attendu global"
echo "=========================="
echo ""
echo "✅ Pas d'erreur ECONNREFUSED"
echo "✅ Application utilisable sans backend"
echo "✅ Messages d'avertissement clairs"
echo "✅ Jobs créés en base de données"
echo "✅ Webhook de simulation fonctionne"
echo "✅ Articles consultables"
echo ""

echo "📚 Documentation"
echo "================"
echo ""
echo "- Corrections détaillées: BACKEND_FALLBACK_FIX.md"
echo "- Guide de test complet: TEST_BLOG_FEATURE.md"
echo "- Documentation complète: BLOG_DOCUMENTATION_INDEX.md"
echo ""

echo "✨ Test ready! Suivez les étapes ci-dessus."
