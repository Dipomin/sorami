#!/bin/bash

# Script de vérification pré-déploiement pour le fix pricing
# Usage: ./scripts/pre-deploy-check.sh

set -e

echo "🔍 Vérification pré-déploiement du fix pricing..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SUCCESS=0
WARNINGS=0
ERRORS=0

# Fonction de vérification
check() {
  local message=$1
  local command=$2
  
  echo -n "  Checking: $message... "
  
  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    SUCCESS=$((SUCCESS + 1))
    return 0
  else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
    return 1
  fi
}

warning() {
  local message=$1
  echo -e "  ${YELLOW}⚠${NC} Warning: $message"
  WARNINGS=$((WARNINGS + 1))
}

info() {
  local message=$1
  echo -e "  ${GREEN}ℹ${NC} $message"
}

# 1. Variables d'environnement
echo "📋 1. Variables d'environnement"
if [ -f .env ]; then
  check "Fichier .env existe" "test -f .env"
  
  if grep -q "PAYSTACK_SECRET_KEY" .env; then
    SECRET_KEY=$(grep "PAYSTACK_SECRET_KEY" .env | cut -d '=' -f2 | tr -d '"' | tr -d ' ')
    if [ -n "$SECRET_KEY" ] && [ "$SECRET_KEY" != "" ]; then
      check "PAYSTACK_SECRET_KEY configurée" "test -n '$SECRET_KEY'"
      
      if [[ $SECRET_KEY == sk_test_* ]]; then
        warning "Clé de TEST détectée (normal en dev)"
      elif [[ $SECRET_KEY == sk_live_* ]]; then
        info "Clé de PRODUCTION détectée"
      fi
    else
      warning "PAYSTACK_SECRET_KEY vide"
    fi
  else
    warning "PAYSTACK_SECRET_KEY non trouvée dans .env"
  fi
  
  check "DATABASE_URL configurée" "grep -q 'DATABASE_URL' .env"
else
  warning "Fichier .env non trouvé"
fi
echo ""

# 2. Fichiers modifiés
echo "📁 2. Fichiers du fix"
check "API route exists" "test -f src/app/api/plans/route.ts"
check "Pricing page exists" "test -f src/app/pricing/page.tsx"
check "Sync script exists" "test -f scripts/sync-paystack-plans.mjs"
check "Test script exists" "test -f scripts/test-plans-api.mjs"
check "Documentation exists" "test -f docs/FIX_PRICING_PLANS_ERROR.md"
echo ""

# 3. Dépendances
echo "📦 3. Dépendances"
check "Node modules installed" "test -d node_modules"
check "Prisma client generated" "test -d node_modules/.prisma/client"

if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  info "Node.js version: $NODE_VERSION"
fi

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  info "npm version: $NPM_VERSION"
fi
echo ""

# 4. Base de données
echo "🗄️  4. Base de données"
if command -v npx &> /dev/null; then
  if npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; then
    check "Connexion DB OK" "npx prisma db execute --stdin <<< 'SELECT 1'"
    
    # Vérifier la table PaystackPlan
    if npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM PaystackPlan" > /dev/null 2>&1; then
      check "Table PaystackPlan existe" "true"
      
      # Compter les plans
      PLAN_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM PaystackPlan" 2>/dev/null | tail -1 || echo "0")
      if [ "$PLAN_COUNT" -gt 0 ]; then
        info "Plans en cache: $PLAN_COUNT"
      else
        warning "Aucun plan en cache (exécuter: node scripts/sync-paystack-plans.mjs)"
      fi
    else
      warning "Table PaystackPlan non trouvée (exécuter: npx prisma db push)"
    fi
  else
    warning "Impossible de se connecter à la DB"
  fi
else
  warning "npx non disponible"
fi
echo ""

# 5. Build
echo "🔨 5. Build Next.js"
if [ -d .next ]; then
  info "Répertoire .next existe"
  
  if [ -f .next/BUILD_ID ]; then
    BUILD_ID=$(cat .next/BUILD_ID)
    info "Build ID: $BUILD_ID"
  fi
else
  warning "Pas de build Next.js (exécuter: npm run build)"
fi
echo ""

# 6. Syntaxe TypeScript
echo "📝 6. Vérification TypeScript"
if command -v npx &> /dev/null; then
  if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
    check "Pas d'erreur TypeScript" "npx tsc --noEmit --skipLibCheck"
  else
    warning "Erreurs TypeScript détectées (exécuter: npx tsc --noEmit)"
  fi
else
  warning "tsc non disponible"
fi
echo ""

# Résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}✓${NC} Succès:       $SUCCESS"
echo -e "  ${YELLOW}⚠${NC} Avertissements: $WARNINGS"
echo -e "  ${RED}✗${NC} Erreurs:      $ERRORS"
echo ""

if [ $ERRORS -eq 0 ]; then
  if [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les tests sont passés ! Prêt pour le déploiement.${NC}"
    exit 0
  else
    echo -e "${YELLOW}⚠️  Des avertissements ont été détectés. Vérifiez avant de déployer.${NC}"
    exit 0
  fi
else
  echo -e "${RED}❌ Des erreurs ont été détectées. Corrigez-les avant de déployer.${NC}"
  exit 1
fi
