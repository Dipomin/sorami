#!/bin/bash

# 🧪 Script de Test - Déduction des Crédits
# Teste que tous les endpoints décomptent correctement les crédits

echo "🧪 Test de Déduction des Crédits"
echo "================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Fonction pour afficher un résultat de test
test_result() {
  local name=$1
  local status=$2
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  if [ "$status" = "PASS" ]; then
    echo -e "${GREEN}✅ $name${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ $name${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

# 1. Vérifier que le service de crédits compile
echo "1️⃣ Vérification du service de crédits..."
if [ -f "src/lib/credits.ts" ]; then
  test_result "Fichier credits.ts existe" "PASS"
else
  test_result "Fichier credits.ts existe" "FAIL"
fi

# 2. Vérifier l'import dans les APIs
echo ""
echo "2️⃣ Vérification des imports dans les APIs..."

for file in \
  "src/app/api/images/generate/route.ts" \
  "src/app/api/videos/generate/route.ts" \
  "src/app/api/blog/generate/route.ts" \
  "src/app/api/books/route.ts"
do
  if grep -q "import { deductCredits } from '@/lib/credits'" "$file"; then
    test_result "Import deductCredits dans $(basename $(dirname $file))" "PASS"
  else
    test_result "Import deductCredits dans $(basename $(dirname $file))" "FAIL"
  fi
done

# 3. Vérifier les appels à deductCredits
echo ""
echo "3️⃣ Vérification des appels deductCredits..."

for file in \
  "src/app/api/images/generate/route.ts" \
  "src/app/api/videos/generate/route.ts" \
  "src/app/api/blog/generate/route.ts" \
  "src/app/api/books/route.ts"
do
  if grep -q "await deductCredits(" "$file"; then
    test_result "Appel deductCredits dans $(basename $(dirname $file))" "PASS"
  else
    test_result "Appel deductCredits dans $(basename $(dirname $file))" "FAIL"
  fi
done

# 4. Vérifier la gestion des erreurs 402
echo ""
echo "4️⃣ Vérification de la gestion d'erreur 402..."

for file in \
  "src/app/api/images/generate/route.ts" \
  "src/app/api/videos/generate/route.ts" \
  "src/app/api/blog/generate/route.ts" \
  "src/app/api/books/route.ts"
do
  if grep -q "status: 402" "$file"; then
    test_result "Erreur 402 dans $(basename $(dirname $file))" "PASS"
  else
    test_result "Erreur 402 dans $(basename $(dirname $file))" "FAIL"
  fi
done

# 5. Vérifier les vérifications !creditResult.success
echo ""
echo "5️⃣ Vérification des checks de succès..."

for file in \
  "src/app/api/images/generate/route.ts" \
  "src/app/api/videos/generate/route.ts" \
  "src/app/api/blog/generate/route.ts" \
  "src/app/api/books/route.ts"
do
  if grep -q "!creditResult.success" "$file"; then
    test_result "Check success dans $(basename $(dirname $file))" "PASS"
  else
    test_result "Check success dans $(basename $(dirname $file))" "FAIL"
  fi
done

# 6. Vérifier les types de contenu
echo ""
echo "6️⃣ Vérification des types de contenu..."

if grep -q "contentType: 'IMAGE'" "src/app/api/images/generate/route.ts"; then
  test_result "Type IMAGE dans images/generate" "PASS"
else
  test_result "Type IMAGE dans images/generate" "FAIL"
fi

if grep -q "contentType: 'VIDEO'" "src/app/api/videos/generate/route.ts"; then
  test_result "Type VIDEO dans videos/generate" "PASS"
else
  test_result "Type VIDEO dans videos/generate" "FAIL"
fi

if grep -q "contentType: 'BLOG'" "src/app/api/blog/generate/route.ts"; then
  test_result "Type BLOG dans blog/generate" "PASS"
else
  test_result "Type BLOG dans blog/generate" "FAIL"
fi

if grep -q "contentType: 'BOOK'" "src/app/api/books/route.ts"; then
  test_result "Type BOOK dans books" "PASS"
else
  test_result "Type BOOK dans books" "FAIL"
fi

# 7. Vérifier la grille tarifaire
echo ""
echo "7️⃣ Vérification de la grille tarifaire dans credits.ts..."

if grep -q "IMAGE: 1" "src/lib/credits.ts"; then
  test_result "Coût IMAGE = 1 crédit" "PASS"
else
  test_result "Coût IMAGE = 1 crédit" "FAIL"
fi

if grep -q "VIDEO: 5" "src/lib/credits.ts"; then
  test_result "Coût VIDEO = 5 crédits" "PASS"
else
  test_result "Coût VIDEO = 5 crédits" "FAIL"
fi

if grep -q "BLOG: 2" "src/lib/credits.ts"; then
  test_result "Coût BLOG = 2 crédits" "PASS"
else
  test_result "Coût BLOG = 2 crédits" "FAIL"
fi

if grep -q "BOOK: 10" "src/lib/credits.ts"; then
  test_result "Coût BOOK = 10 crédits" "PASS"
else
  test_result "Coût BOOK = 10 crédits" "FAIL"
fi

# 8. Vérifier les logs de débogage
echo ""
echo "8️⃣ Vérification des logs de débogage..."

for file in \
  "src/app/api/images/generate/route.ts" \
  "src/app/api/videos/generate/route.ts" \
  "src/app/api/blog/generate/route.ts" \
  "src/app/api/books/route.ts"
do
  if grep -q "Crédits déduits" "$file"; then
    test_result "Log crédits déduits dans $(basename $(dirname $file))" "PASS"
  else
    test_result "Log crédits déduits dans $(basename $(dirname $file))" "FAIL"
  fi
done

# Résumé
echo ""
echo "======================================"
echo "📊 RÉSUMÉ DES TESTS"
echo "======================================"
echo -e "Total:   $TOTAL_TESTS tests"
echo -e "${GREEN}Réussis: $PASSED_TESTS tests${NC}"
echo -e "${RED}Échoués: $FAILED_TESTS tests${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}✅ TOUS LES TESTS PASSENT !${NC}"
  echo ""
  echo "🚀 Prochaines étapes:"
  echo "   1. Démarrer le serveur: npm run dev"
  echo "   2. Tester avec un vrai utilisateur"
  echo "   3. Vérifier la déduction dans le dashboard"
  exit 0
else
  echo -e "${RED}❌ CERTAINS TESTS ÉCHOUENT${NC}"
  echo ""
  echo "⚠️ Vérifiez les fichiers marqués comme FAIL"
  exit 1
fi
