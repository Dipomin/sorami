#!/bin/bash

# Script pour tester la validité de la clé Paystack
# Usage: ./test-paystack-key.sh

set -e

echo "🔑 Test de validité de la clé Paystack"
echo "======================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Charger les variables d'environnement
if [ -f .env.local ]; then
  source .env.local
elif [ -f .env ]; then
  source .env
else
  echo -e "${RED}❌ Aucun fichier .env ou .env.local trouvé${NC}"
  exit 1
fi

# Vérifier que la clé existe
if [ -z "$PAYSTACK_SECRET_KEY" ]; then
  echo -e "${RED}❌ PAYSTACK_SECRET_KEY non définie dans .env${NC}"
  echo ""
  echo "Veuillez ajouter votre clé Paystack dans .env ou .env.local :"
  echo -e "${YELLOW}PAYSTACK_SECRET_KEY=\"sk_test_xxx\"${NC}"
  exit 1
fi

# Masquer la clé pour la sécurité
MASKED_KEY="${PAYSTACK_SECRET_KEY:0:12}...${PAYSTACK_SECRET_KEY: -4}"
echo -e "📍 Clé détectée : ${BLUE}${MASKED_KEY}${NC}"
echo ""

# Test 1 : Vérifier le format
echo "Test 1 : Vérification du format de la clé"
echo "------------------------------------------"
if [[ $PAYSTACK_SECRET_KEY == sk_test_* ]]; then
  echo -e "${GREEN}✓ Format valide : Mode TEST (sk_test_xxx)${NC}"
elif [[ $PAYSTACK_SECRET_KEY == sk_live_* ]]; then
  echo -e "${YELLOW}⚠ Format valide : Mode PRODUCTION (sk_live_xxx)${NC}"
  echo -e "${YELLOW}  Attention : Vous utilisez une clé de production !${NC}"
else
  echo -e "${RED}✗ Format invalide : La clé doit commencer par sk_test_ ou sk_live_${NC}"
  echo -e "${YELLOW}  Format reçu : ${PAYSTACK_SECRET_KEY:0:8}...${NC}"
  exit 1
fi
echo ""

# Test 2 : Tester la connexion à l'API Paystack
echo "Test 2 : Connexion à l'API Paystack"
echo "------------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer ${PAYSTACK_SECRET_KEY}" \
  -H "Content-Type: application/json" \
  "https://api.paystack.co/plan" 2>/dev/null)

# Extraire le code HTTP et le body
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Clé valide : Connexion API réussie (200 OK)${NC}"
  
  # Compter le nombre de plans
  PLAN_COUNT=$(echo "$BODY" | grep -o '"plan_code"' | wc -l | tr -d ' ')
  echo -e "${GREEN}  → ${PLAN_COUNT} plan(s) trouvé(s) sur Paystack${NC}"
  
elif [ "$HTTP_CODE" = "401" ]; then
  echo -e "${RED}✗ Clé invalide : Erreur d'authentification (401 Unauthorized)${NC}"
  echo ""
  echo -e "${YELLOW}Raisons possibles :${NC}"
  echo "  1. La clé est expirée"
  echo "  2. La clé a été révoquée"
  echo "  3. La clé est incorrecte (erreur de copier-coller)"
  echo "  4. La clé ne correspond pas au compte Paystack"
  echo ""
  echo -e "${BLUE}Solution :${NC}"
  echo "  1. Allez sur https://dashboard.paystack.com"
  echo "  2. Settings → API Keys & Webhooks"
  echo "  3. Copiez la nouvelle clé Test Secret Key"
  echo "  4. Mettez à jour .env.local :"
  echo -e "${YELLOW}     PAYSTACK_SECRET_KEY=\"sk_test_VOTRE_NOUVELLE_CLE\"${NC}"
  echo "  5. Redémarrez le serveur : npm run dev"
  echo ""
  echo "📖 Guide complet : GUIDE_FIX_PAYSTACK_KEY.md"
  exit 1
  
elif [ "$HTTP_CODE" = "000" ]; then
  echo -e "${RED}✗ Erreur réseau : Impossible de contacter Paystack${NC}"
  echo "  Vérifiez votre connexion Internet"
  exit 1
  
else
  echo -e "${YELLOW}⚠ Code HTTP inattendu : ${HTTP_CODE}${NC}"
  echo "  Body : ${BODY:0:100}..."
fi
echo ""

# Test 3 : Tester l'initialisation d'une transaction (simulation)
echo "Test 3 : Simulation d'initialisation de transaction"
echo "---------------------------------------------------"
TEST_PAYLOAD='{
  "email": "test@example.com",
  "amount": 500000,
  "currency": "XOF",
  "metadata": {
    "type": "test",
    "source": "test-script"
  }
}'

INIT_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Authorization: Bearer ${PAYSTACK_SECRET_KEY}" \
  -H "Content-Type: application/json" \
  -d "$TEST_PAYLOAD" \
  "https://api.paystack.co/transaction/initialize" 2>/dev/null)

INIT_HTTP_CODE=$(echo "$INIT_RESPONSE" | tail -n 1)
INIT_BODY=$(echo "$INIT_RESPONSE" | head -n -1)

if [ "$INIT_HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Initialisation de transaction : OK${NC}"
  
  # Extraire l'URL d'autorisation
  AUTH_URL=$(echo "$INIT_BODY" | grep -o '"authorization_url":"[^"]*"' | cut -d'"' -f4)
  if [ ! -z "$AUTH_URL" ]; then
    echo -e "${GREEN}  → URL d'autorisation générée${NC}"
    echo -e "${BLUE}     ${AUTH_URL:0:50}...${NC}"
  fi
  
elif [ "$INIT_HTTP_CODE" = "401" ]; then
  echo -e "${RED}✗ Erreur d'authentification (401)${NC}"
  echo "  La clé Paystack est invalide pour l'initialisation de transaction"
  exit 1
  
else
  echo -e "${YELLOW}⚠ Code HTTP : ${INIT_HTTP_CODE}${NC}"
  ERROR_MSG=$(echo "$INIT_BODY" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
  if [ ! -z "$ERROR_MSG" ]; then
    echo "  Message : ${ERROR_MSG}"
  fi
fi
echo ""

# Test 4 : Vérifier PAYSTACK_PUBLIC_KEY
echo "Test 4 : Vérification de la clé publique"
echo "-----------------------------------------"
if [ -z "$PAYSTACK_PUBLIC_KEY" ]; then
  echo -e "${YELLOW}⚠ PAYSTACK_PUBLIC_KEY non définie${NC}"
  echo "  Cette clé est nécessaire pour l'intégration frontend"
elif [[ $PAYSTACK_PUBLIC_KEY == pk_test_* ]]; then
  PUB_MASKED="${PAYSTACK_PUBLIC_KEY:0:12}...${PAYSTACK_PUBLIC_KEY: -4}"
  echo -e "${GREEN}✓ Clé publique valide (Mode TEST)${NC}"
  echo -e "${BLUE}  ${PUB_MASKED}${NC}"
elif [[ $PAYSTACK_PUBLIC_KEY == pk_live_* ]]; then
  PUB_MASKED="${PAYSTACK_PUBLIC_KEY:0:12}...${PAYSTACK_PUBLIC_KEY: -4}"
  echo -e "${YELLOW}⚠ Clé publique valide (Mode PRODUCTION)${NC}"
  echo -e "${BLUE}  ${PUB_MASKED}${NC}"
else
  echo -e "${RED}✗ Format invalide : Doit commencer par pk_test_ ou pk_live_${NC}"
fi
echo ""

# Test 5 : Vérifier PAYSTACK_WEBHOOK_SECRET
echo "Test 5 : Vérification du secret webhook"
echo "----------------------------------------"
if [ -z "$PAYSTACK_WEBHOOK_SECRET" ]; then
  echo -e "${YELLOW}⚠ PAYSTACK_WEBHOOK_SECRET non définie${NC}"
  echo "  Ce secret est nécessaire pour valider les webhooks"
  echo "  Conseil : Utilisez la même valeur que PAYSTACK_SECRET_KEY en dev"
else
  WEBHOOK_MASKED="${PAYSTACK_WEBHOOK_SECRET:0:12}...${PAYSTACK_WEBHOOK_SECRET: -4}"
  echo -e "${GREEN}✓ Secret webhook défini${NC}"
  echo -e "${BLUE}  ${WEBHOOK_MASKED}${NC}"
fi
echo ""

# Résumé
echo "======================================"
echo "✅ Tests terminés"
echo ""

if [ "$HTTP_CODE" = "200" ] && [ "$INIT_HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}🎉 Votre clé Paystack est VALIDE et fonctionnelle !${NC}"
  echo ""
  echo "Vous pouvez maintenant :"
  echo "  1. Lancer le serveur : npm run dev"
  echo "  2. Tester le Pack Créateur sur /pricing"
  echo "  3. Utiliser la carte test : 4084 0840 8408 4081"
  echo ""
else
  echo -e "${RED}❌ Des problèmes ont été détectés avec votre clé Paystack${NC}"
  echo ""
  echo "Consultez le guide : GUIDE_FIX_PAYSTACK_KEY.md"
  echo "Ou obtenez une nouvelle clé sur : https://dashboard.paystack.com"
  echo ""
fi
