#!/bin/bash

# Script de test pour le Pack Créateur (paiement unique)
# Usage: ./test-pack-createur.sh

set -e

echo "🧪 Test du système Pack Créateur"
echo "================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL=${NEXT_PUBLIC_APP_URL:-"http://localhost:3000"}

echo "📡 API URL: $API_URL"
echo ""

# Test 1: Vérifier que l'endpoint existe
echo "Test 1: Vérifier l'endpoint d'initialisation"
echo "---------------------------------------------"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/payments/one-time/initialize" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{}' 2>/dev/null || echo "000")

if [ "$RESPONSE" = "401" ]; then
  echo -e "${GREEN}✓ Endpoint existe (401 Unauthorized - normal sans auth)${NC}"
elif [ "$RESPONSE" = "000" ]; then
  echo -e "${RED}✗ Serveur inaccessible${NC}"
  exit 1
else
  echo -e "${YELLOW}⚠ Code HTTP: $RESPONSE${NC}"
fi
echo ""

# Test 2: Vérifier le webhook
echo "Test 2: Vérifier le webhook Paystack"
echo "-------------------------------------"
WEBHOOK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/webhooks/paystack" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{}' 2>/dev/null || echo "000")

if [ "$WEBHOOK_RESPONSE" = "400" ]; then
  echo -e "${GREEN}✓ Webhook existe (400 - signature manquante, normal)${NC}"
elif [ "$WEBHOOK_RESPONSE" = "000" ]; then
  echo -e "${RED}✗ Webhook inaccessible${NC}"
else
  echo -e "${YELLOW}⚠ Code HTTP webhook: $WEBHOOK_RESPONSE${NC}"
fi
echo ""

# Test 3: Vérifier les variables d'environnement
echo "Test 3: Vérifier les variables d'environnement"
echo "----------------------------------------------"

check_env_var() {
  local var_name=$1
  local var_value="${!var_name}"
  
  if [ -z "$var_value" ]; then
    echo -e "${RED}✗ $var_name non définie${NC}"
    return 1
  else
    # Masquer la valeur pour la sécurité
    local masked_value="${var_value:0:10}..."
    echo -e "${GREEN}✓ $var_name définie: $masked_value${NC}"
    return 0
  fi
}

check_env_var "PAYSTACK_SECRET_KEY" || true
check_env_var "PAYSTACK_WEBHOOK_SECRET" || true
check_env_var "DATABASE_URL" || true
echo ""

# Test 4: Test de payload webhook simulé
echo "Test 4: Test de payload webhook (charge.success)"
echo "------------------------------------------------"

cat > /tmp/test-pack-createur-webhook.json << 'EOF'
{
  "event": "charge.success",
  "data": {
    "reference": "test_pack_createur_001",
    "amount": 500000,
    "currency": "XOF",
    "status": "success",
    "paid_at": "2025-01-04T12:00:00.000Z",
    "customer": {
      "email": "test@example.com",
      "customer_code": "CUS_test"
    },
    "metadata": {
      "userId": "test_user_id",
      "type": "one-time-purchase",
      "offerType": "pack-createur",
      "credits": {
        "images": 20,
        "blogPosts": 2
      }
    }
  }
}
EOF

echo "Payload créé dans /tmp/test-pack-createur-webhook.json"
echo ""
echo "Pour tester manuellement le webhook :"
echo -e "${YELLOW}curl -X POST $API_URL/api/webhooks/paystack \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'x-paystack-signature: YOUR_SIGNATURE' \\"
echo -e "  -d @/tmp/test-pack-createur-webhook.json${NC}"
echo ""

# Test 5: Vérifier les fichiers créés
echo "Test 5: Vérifier les fichiers créés"
echo "------------------------------------"

FILES=(
  "src/app/api/payments/one-time/initialize/route.ts"
  "src/hooks/useOneTimePurchase.ts"
  "src/components/pricing/PackCreateurCard.tsx"
  "docs/PACK_CREATEUR_DOCUMENTATION.md"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓ $file${NC}"
  else
    echo -e "${RED}✗ $file manquant${NC}"
  fi
done
echo ""

# Test 6: Vérifier la page pricing
echo "Test 6: Vérifier la page pricing"
echo "---------------------------------"
if [ -f "src/app/pricing/page.tsx" ]; then
  if grep -q "handleBuyOneTime" "src/app/pricing/page.tsx"; then
    echo -e "${GREEN}✓ Fonction handleBuyOneTime présente${NC}"
  else
    echo -e "${RED}✗ Fonction handleBuyOneTime manquante${NC}"
  fi
  
  if grep -q "Pack Créateur" "src/app/pricing/page.tsx"; then
    echo -e "${GREEN}✓ Section Pack Créateur présente${NC}"
  else
    echo -e "${RED}✗ Section Pack Créateur manquante${NC}"
  fi
else
  echo -e "${RED}✗ src/app/pricing/page.tsx manquant${NC}"
fi
echo ""

echo "================================"
echo "✅ Tests terminés"
echo ""
echo "📝 Prochaines étapes :"
echo "1. Lancer le serveur : npm run dev"
echo "2. Ouvrir http://localhost:3000/pricing"
echo "3. Tester l'achat Pack Créateur avec une carte test Paystack"
echo "4. Vérifier les logs du webhook dans la console"
echo "5. Vérifier les crédits dans la DB : SELECT credits FROM users WHERE email='test@example.com';"
echo ""
