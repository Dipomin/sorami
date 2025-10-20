#!/bin/bash

# Script de test du webhook book-completion
# Usage: ./test-webhook.sh [development|production]

set -e

ENVIRONMENT=${1:-development}
WEBHOOK_URL="http://localhost:3000/api/webhooks/book-completion"

echo "🧪 Test du webhook book-completion"
echo "   Environment: $ENVIRONMENT"
echo "   URL: $WEBHOOK_URL"
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ $2${NC}"
  else
    echo -e "${RED}❌ $2${NC}"
  fi
}

# Test 1: Webhook de succès (completed)
echo "📝 Test 1: Webhook de succès (completed)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: sorami-webhook-secret-key-2025" \
  -d '{
    "job_id": "test-webhook-'$(date +%s)'",
    "status": "completed",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "environment": "'$ENVIRONMENT'",
    "book_data": {
      "book_title": "Livre de Test Webhook",
      "topic": "Test Automation",
      "goal": "Valider le système de webhook",
      "outline": [
        {
          "title": "Chapitre 1",
          "description": "Introduction aux tests"
        }
      ],
      "chapters": [
        {
          "title": "Chapitre 1: Introduction",
          "content": "# Chapitre 1: Introduction\n\nCeci est un livre de test pour valider le webhook.\n\nLe système fonctionne correctement.",
          "description": "Introduction aux tests automatisés"
        }
      ],
      "generated_at": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
      "word_count": 150,
      "chapter_count": 1
    }
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ]; then
  print_result 0 "Webhook completed accepté (HTTP $HTTP_CODE)"
  echo "   Réponse: $BODY" | jq '.' 2>/dev/null || echo "   Réponse: $BODY"
else
  print_result 1 "Erreur HTTP $HTTP_CODE"
  echo "   Réponse: $BODY"
fi

echo ""

# Test 2: Webhook d'échec (failed)
echo "📝 Test 2: Webhook d'échec (failed)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: sorami-webhook-secret-key-2025" \
  -d '{
    "job_id": "test-webhook-failed-'$(date +%s)'",
    "status": "failed",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "environment": "'$ENVIRONMENT'",
    "error": "Test error: Generation timeout"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 404 ]; then
  print_result 0 "Webhook failed accepté (HTTP $HTTP_CODE)"
  echo "   Réponse: $BODY" | jq '.' 2>/dev/null || echo "   Réponse: $BODY"
else
  print_result 1 "Erreur HTTP $HTTP_CODE"
  echo "   Réponse: $BODY"
fi

echo ""

# Test 3: Idempotence (envoyer 2x le même webhook)
echo "📝 Test 3: Test d'idempotence"
JOB_ID="test-idempotence-$(date +%s)"

# Premier envoi
RESPONSE1=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: sorami-webhook-secret-key-2025" \
  -d '{
    "job_id": "'$JOB_ID'",
    "status": "completed",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "environment": "'$ENVIRONMENT'",
    "book_data": {
      "book_title": "Test Idempotence",
      "topic": "Idempotence",
      "goal": "Test",
      "outline": [],
      "chapters": [
        {
          "title": "Chapter 1",
          "content": "# Test",
          "description": "Test"
        }
      ],
      "generated_at": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
      "word_count": 10,
      "chapter_count": 1
    }
  }')

HTTP_CODE1=$(echo "$RESPONSE1" | tail -n 1)
echo -e "${YELLOW}   Premier envoi: HTTP $HTTP_CODE1${NC}"

# Attendre 2 secondes
sleep 2

# Deuxième envoi (devrait être détecté comme duplicate)
RESPONSE2=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: sorami-webhook-secret-key-2025" \
  -d '{
    "job_id": "'$JOB_ID'",
    "status": "completed",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "environment": "'$ENVIRONMENT'",
    "book_data": {
      "book_title": "Test Idempotence",
      "topic": "Idempotence",
      "goal": "Test",
      "outline": [],
      "chapters": [
        {
          "title": "Chapter 1",
          "content": "# Test",
          "description": "Test"
        }
      ],
      "generated_at": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
      "word_count": 10,
      "chapter_count": 1
    }
  }')

HTTP_CODE2=$(echo "$RESPONSE2" | tail -n 1)
BODY2=$(echo "$RESPONSE2" | head -n -1)

echo -e "${YELLOW}   Deuxième envoi: HTTP $HTTP_CODE2${NC}"

if echo "$BODY2" | grep -q "already processed" || echo "$BODY2" | grep -q "idempotent"; then
  print_result 0 "Idempotence détectée correctement"
  echo "   Réponse: $BODY2" | jq '.' 2>/dev/null || echo "   Réponse: $BODY2"
else
  print_result 1 "Idempotence non détectée (possible double création)"
  echo "   Réponse: $BODY2"
fi

echo ""

# Test 4: Données invalides
echo "📝 Test 4: Validation des données (job_id manquant)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: sorami-webhook-secret-key-2025" \
  -d '{
    "status": "completed",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 400 ]; then
  print_result 0 "Validation correcte (HTTP 400 pour données invalides)"
  echo "   Réponse: $BODY" | jq '.' 2>/dev/null || echo "   Réponse: $BODY"
else
  print_result 1 "Validation incorrecte (attendu HTTP 400, reçu HTTP $HTTP_CODE)"
  echo "   Réponse: $BODY"
fi

echo ""

# Test 5: Méthode HTTP non autorisée (GET)
echo "📝 Test 5: Méthode HTTP non autorisée (GET)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$WEBHOOK_URL")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 405 ]; then
  print_result 0 "Méthode GET refusée correctement (HTTP 405)"
  echo "   Réponse: $BODY" | jq '.' 2>/dev/null || echo "   Réponse: $BODY"
else
  print_result 1 "Erreur de validation de méthode HTTP (attendu 405, reçu $HTTP_CODE)"
  echo "   Réponse: $BODY"
fi

echo ""
echo "✅ Tests terminés !"
echo ""
echo "Pour vérifier les livres créés en base de données :"
echo "   npx prisma studio"
