#!/bin/bash

# Script de test pour le webhook de génération d'images
# Usage: ./test-image-webhook.sh

echo "🧪 Test du webhook de génération d'images"
echo "=========================================="
echo ""

# Configuration
API_URL="http://localhost:3000/api/webhooks/image-completion"
JOB_ID="test-$(date +%s)"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📍 URL du webhook:${NC} $API_URL"
echo -e "${BLUE}🔑 Job ID:${NC} $JOB_ID"
echo ""

# Test 1: Webhook avec succès (completed)
echo -e "${YELLOW}Test 1: Génération réussie (completed)${NC}"
echo "--------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d @- << EOF
{
  "job_id": "$JOB_ID",
  "status": "completed",
  "timestamp": "$TIMESTAMP",
  "environment": "development",
  "data": {
    "job_id": "$JOB_ID",
    "images": [
      {
        "file_path": "./generated_images/test/image_1.png",
        "url": "http://localhost:9006/generated_images/test/image_1.png",
        "description": "Un magnifique coucher de soleil sur l'océan",
        "format": "PNG",
        "size_bytes": 2048576,
        "dimensions": "1024x1024"
      },
      {
        "file_path": "./generated_images/test/image_2.png",
        "url": "http://localhost:9006/generated_images/test/image_2.png",
        "description": "Un magnifique coucher de soleil sur l'océan (variation 2)",
        "format": "PNG",
        "size_bytes": 2150000,
        "dimensions": "1024x1024"
      }
    ],
    "metadata": {
      "model_name": "gemini-2.0-flash-exp",
      "version": "latest",
      "generation_time_seconds": 12.5,
      "input_tokens": 45,
      "output_size_bytes": 4198576,
      "timestamp": "$TIMESTAMP"
    },
    "status": "COMPLETED",
    "generated_at": "$TIMESTAMP"
  }
}
EOF
)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Test réussi (HTTP $HTTP_CODE)${NC}"
    echo -e "${GREEN}Response:${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Test échoué (HTTP $HTTP_CODE)${NC}"
    echo -e "${RED}Response:${NC}"
    echo "$BODY"
fi

echo ""
sleep 1

# Test 2: Webhook avec échec (failed)
echo -e "${YELLOW}Test 2: Génération échouée (failed)${NC}"
echo "-----------------------------------"

JOB_ID_FAIL="test-fail-$(date +%s)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d @- << EOF
{
  "job_id": "$JOB_ID_FAIL",
  "status": "failed",
  "timestamp": "$TIMESTAMP",
  "environment": "development",
  "error_message": "Clé API Google invalide ou expirée",
  "message": "Échec de la génération d'images"
}
EOF
)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Test réussi (HTTP $HTTP_CODE)${NC}"
    echo -e "${GREEN}Response:${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Test échoué (HTTP $HTTP_CODE)${NC}"
    echo -e "${RED}Response:${NC}"
    echo "$BODY"
fi

echo ""
sleep 1

# Test 3: Webhook avec statut intermédiaire (generating)
echo -e "${YELLOW}Test 3: Statut intermédiaire (generating)${NC}"
echo "----------------------------------------"

JOB_ID_PROGRESS="test-progress-$(date +%s)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d @- << EOF
{
  "job_id": "$JOB_ID_PROGRESS",
  "status": "generating",
  "timestamp": "$TIMESTAMP",
  "environment": "development",
  "progress": 50,
  "message": "Génération en cours..."
}
EOF
)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Test réussi (HTTP $HTTP_CODE)${NC}"
    echo -e "${GREEN}Response:${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Test échoué (HTTP $HTTP_CODE)${NC}"
    echo -e "${RED}Response:${NC}"
    echo "$BODY"
fi

echo ""
sleep 1

# Test 4: Idempotence (renvoyer le même job)
echo -e "${YELLOW}Test 4: Idempotence (job déjà traité)${NC}"
echo "-------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d @- << EOF
{
  "job_id": "$JOB_ID",
  "status": "completed",
  "timestamp": "$TIMESTAMP",
  "environment": "development",
  "data": {
    "job_id": "$JOB_ID",
    "images": [
      {
        "file_path": "./generated_images/test/image_1.png",
        "url": "http://localhost:9006/generated_images/test/image_1.png",
        "description": "Test",
        "format": "PNG",
        "size_bytes": 1024000,
        "dimensions": "1024x1024"
      }
    ],
    "metadata": {
      "model_name": "gemini-2.0-flash-exp",
      "generation_time_seconds": 10.0
    }
  }
}
EOF
)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Test réussi (HTTP $HTTP_CODE)${NC}"
    echo -e "${GREEN}Response:${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if echo "$BODY" | grep -q "déjà traité"; then
        echo -e "${GREEN}✅ Idempotence confirmée${NC}"
    else
        echo -e "${YELLOW}⚠️  Idempotence non détectée${NC}"
    fi
else
    echo -e "${RED}❌ Test échoué (HTTP $HTTP_CODE)${NC}"
    echo -e "${RED}Response:${NC}"
    echo "$BODY"
fi

echo ""
sleep 1

# Test 5: Payload invalide (données manquantes)
echo -e "${YELLOW}Test 5: Payload invalide (données manquantes)${NC}"
echo "--------------------------------------------"

JOB_ID_INVALID="test-invalid-$(date +%s)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d @- << EOF
{
  "job_id": "$JOB_ID_INVALID",
  "status": "completed",
  "timestamp": "$TIMESTAMP",
  "environment": "development",
  "data": {
    "job_id": "$JOB_ID_INVALID",
    "images": [],
    "metadata": {}
  }
}
EOF
)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✅ Test réussi (HTTP $HTTP_CODE - erreur attendue)${NC}"
    echo -e "${GREEN}Response:${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${YELLOW}⚠️  Code HTTP inattendu: $HTTP_CODE${NC}"
    echo -e "${YELLOW}Response:${NC}"
    echo "$BODY"
fi

echo ""
echo "=========================================="
echo -e "${BLUE}✨ Tests terminés !${NC}"
echo ""
echo "📝 Vérifiez les logs du frontend pour plus de détails:"
echo "   Logs avec emojis: 🎨 📦 ✅ ❌ ⚠️ 💾 ⏱️"
echo ""
