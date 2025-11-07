#!/bin/bash

# Script de test pour le webhook de génération d'images e-commerce
# Ce script simule l'envoi d'un webhook depuis le backend CrewAI

# Configuration
WEBHOOK_URL="http://localhost:3000/api/webhooks/image-ecommerce-completion"
WEBHOOK_SECRET="sorami-webhook-secret-key-2025"

# Couleurs pour les logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛍️  Test du Webhook Image E-commerce${NC}"
echo -e "${BLUE}=====================================${NC}\n"

# Générer une date ISO 8601 valide
ISO_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Payload simulé correspondant au format du backend
PAYLOAD='{
  "job_id": "test-ecommerce-'$(date +%s)'",
  "status": "completed",
  "content_type": "image",
  "timestamp": "'"$ISO_DATE"'",
  "has_data": true,
  "environment": "development",
  "data": {
    "job_id": "test-ecommerce-'$(date +%s)'",
    "user_id": "user_34ZEeU9ldUhuaxVHPeuD3wVy4Lr",
    "num_images": 1,
    "images": [
      {
        "file_path": "user_user_34ZEeU9ldUhuaxVHPeuD3wVy4Lr/images/ecommerce_standard_'$(date +%Y%m%d_%H%M%S)'_1.png",
        "url": "https://sorami-generated-content-9872.s3.us-east-1.amazonaws.com/user_user_34ZEeU9ldUhuaxVHPeuD3wVy4Lr/images/ecommerce_standard_test.png",
        "description": "Image produit e-commerce générée avec IA",
        "format": "PNG",
        "size_bytes": 1063000,
        "dimensions": "832x1248"
      }
    ],
    "generation_metadata": {
      "model_name": "gemini-2.5-flash-image",
      "version": "2.5",
      "generation_time_seconds": 12.5,
      "input_tokens": 1500,
      "output_size_bytes": 1063000,
      "timestamp": "'"$ISO_DATE"'"
    },
    "status": "completed",
    "generated_at": "'"$ISO_DATE"'"
  }
}'

echo -e "${YELLOW}📦 Payload envoyé:${NC}"
echo "$PAYLOAD" | python3 -m json.tool 2>/dev/null || echo "$PAYLOAD"
echo ""

echo -e "${BLUE}📡 Envoi du webhook...${NC}"
echo -e "${BLUE}URL: ${WEBHOOK_URL}${NC}\n"

# Envoi de la requête
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $WEBHOOK_SECRET" \
  -d "$PAYLOAD")

# Extraire le code HTTP et le corps de la réponse
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

# Affichage du résultat
echo -e "${YELLOW}📥 Réponse du serveur:${NC}"
echo -e "${BLUE}Code HTTP: ${HTTP_CODE}${NC}"

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
  echo -e "${GREEN}✅ Succès !${NC}\n"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
  echo -e "${RED}❌ Erreur !${NC}\n"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
fi

echo ""
echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}✨ Test terminé${NC}"
