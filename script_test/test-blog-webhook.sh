#!/bin/bash

# Script de test pour le webhook de complétion d'articles de blog
# Usage: ./test-blog-webhook.sh

echo "🧪 Test du webhook de complétion d'article de blog"
echo "=================================================="
echo ""

# Configuration
WEBHOOK_URL="http://localhost:3000/api/webhooks/blog-completion"
WEBHOOK_SECRET="your-secret-key"
PAYLOAD_FILE="test-blog-webhook-payload.json"

# Vérifier que le fichier payload existe
if [ ! -f "$PAYLOAD_FILE" ]; then
    echo "❌ Erreur : Fichier $PAYLOAD_FILE introuvable"
    exit 1
fi

echo "📤 Envoi du webhook à : $WEBHOOK_URL"
echo ""

# Envoyer le webhook
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $WEBHOOK_SECRET" \
  -d @"$PAYLOAD_FILE")

# Extraire le code HTTP
http_code=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

echo "📥 Réponse reçue"
echo "Status HTTP: $http_code"
echo ""
echo "Body:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo ""

# Vérifier le résultat
if [ "$http_code" = "200" ]; then
    echo "✅ Test réussi !"
    echo ""
    echo "💡 Vérifications recommandées :"
    echo "1. Ouvrir Prisma Studio : npx prisma studio"
    echo "2. Vérifier la table BlogArticle"
    echo "3. Vérifier la table BlogJob"
    echo "4. Aller sur http://localhost:3000/blog pour voir l'article"
else
    echo "❌ Test échoué avec le code $http_code"
fi

echo ""
echo "=================================================="
