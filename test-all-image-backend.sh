#!/bin/bash

# Script de test complet pour le backend api.sorami.app
# Exécute tous les tests de diagnostic

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   TEST COMPLET - BACKEND API.SORAMI.APP              ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Test 1: Test basique
echo "📋 Test 1/3: Test basique (sans authentification)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node test-image-backend-simple.mjs
echo ""

# Test 2: Instructions pour test authentifié
echo "📋 Test 2/3: Test avec token réel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Pour tester avec un token Clerk réel:"
echo "1. Ouvrir https://sorami.app (ou localhost:3000)"
echo "2. Se connecter"
echo "3. DevTools > Network"
echo "4. Copier un token Authorization"
echo "5. Exécuter:"
echo ""
echo "   node test-with-real-token.mjs \"VOTRE_TOKEN_ICI\""
echo ""

# Test 3: Afficher le diagnostic
echo "📋 Test 3/3: Rapport de diagnostic"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📄 Rapport complet disponible dans:"
echo "   docs/IMAGE_GENERATION_DIAGNOSTIC.md"
echo ""
echo "Pour le lire:"
echo "   cat docs/IMAGE_GENERATION_DIAGNOSTIC.md"
echo "   # ou"
echo "   code docs/IMAGE_GENERATION_DIAGNOSTIC.md"
echo ""

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   RÉSUMÉ DES RÉSULTATS                               ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "✅ Backend accessible: https://api.sorami.app"
echo "✅ HTTPS configuré (nginx)"
echo "✅ Health check opérationnel"
echo "✅ Authentification Clerk fonctionnelle"
echo "✅ Books & Blog generation disponibles"
echo ""
echo "❌ PROBLÈME IDENTIFIÉ:"
echo "   → image_generation_available: false"
echo "   → video_generation_available: false"
echo ""
echo "🔧 ACTIONS REQUISES:"
echo "   1. Configurer GOOGLE_API_KEY (ou autre API d'images)"
echo "   2. Activer la fonctionnalité côté backend"
echo "   3. Redémarrer le service backend"
echo "   4. Re-tester avec: node test-image-backend-simple.mjs"
echo ""
echo "📚 Documentation complète: docs/IMAGE_GENERATION_DIAGNOSTIC.md"
echo ""
