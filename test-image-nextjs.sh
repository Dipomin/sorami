#!/bin/bash

# Script de test pour la génération d'images avec Next.js
# Ce script teste le nouveau flux où Next.js crée l'entrée Prisma avant d'appeler le backend

echo "🧪 Test de génération d'images via Next.js API"
echo "=============================================="
echo ""

# Configuration
NEXTJS_URL="http://localhost:3000"
API_ENDPOINT="${NEXTJS_URL}/api/images/generate"

# Obtenir le token d'authentification (simulé - à remplacer par un vrai token Clerk)
# Pour tester, vous devez être connecté dans le navigateur et copier le token depuis les DevTools
# ou utiliser l'API Clerk pour obtenir un token

echo "⚠️  Note: Ce test nécessite un token d'authentification Clerk valide"
echo "Vous pouvez obtenir le token depuis les DevTools du navigateur (Application > Cookies > __session)"
echo ""

read -p "Entrez votre token Clerk (ou appuyez sur Entrée pour passer): " CLERK_TOKEN

if [ -z "$CLERK_TOKEN" ]; then
  echo "❌ Token manquant. Utilisez le navigateur ou l'interface pour tester."
  exit 1
fi

# Payload de test
PAYLOAD='{
  "prompt": "Un chat mignon avec des lunettes de soleil dans un style cartoon",
  "num_images": 1,
  "size": "1024x1024",
  "format": "PNG",
  "style": "illustration",
  "quality": "high"
}'

echo "📦 Envoi de la requête..."
echo "Prompt: Un chat mignon avec des lunettes de soleil dans un style cartoon"
echo ""

# Appel à l'API
RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d "$PAYLOAD")

echo "📥 Réponse reçue:"
echo "$RESPONSE" | jq '.'

# Extraire le job_id
JOB_ID=$(echo "$RESPONSE" | jq -r '.job_id')

if [ "$JOB_ID" != "null" ] && [ -n "$JOB_ID" ]; then
  echo ""
  echo "✅ Job créé avec succès!"
  echo "Job ID: $JOB_ID"
  echo ""
  echo "📊 Vous pouvez suivre le statut avec:"
  echo "curl -H 'Authorization: Bearer YOUR_TOKEN' ${NEXTJS_URL}/api/images/${JOB_ID}/status | jq"
  echo ""
  echo "🖼️  Une fois terminé, récupérez les résultats avec:"
  echo "curl -H 'Authorization: Bearer YOUR_TOKEN' ${NEXTJS_URL}/api/images/${JOB_ID}/result | jq"
else
  echo ""
  echo "❌ Erreur lors de la création du job"
  echo "Vérifiez les logs du serveur Next.js"
fi
