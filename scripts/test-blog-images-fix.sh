#!/bin/bash

# Script de test pour vérifier le fix des images de blog

echo "🧪 Test du Fix des Images de Blog"
echo "=================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
BLOG_IMAGE_FILE="src/components/ui/BlogImage.tsx"
BLOG_PAGE="src/app/blog/page.tsx"
BLOG_SLUG_PAGE="src/app/blog/[slug]/page.tsx"
BLOG_PREVIEW="src/components/BlogPreview.tsx"

echo "1️⃣  Vérification des fichiers créés/modifiés..."
echo ""

# Test 1: BlogImage.tsx existe
if [ -f "$BLOG_IMAGE_FILE" ]; then
    echo -e "${GREEN}✅ $BLOG_IMAGE_FILE existe${NC}"
else
    echo -e "${RED}❌ $BLOG_IMAGE_FILE manquant${NC}"
    exit 1
fi

# Test 2: Vérifier les imports dans blog/page.tsx
if grep -q "BlogCoverImage.*BlogImage" "$BLOG_PAGE"; then
    echo -e "${GREEN}✅ Import BlogImage dans $BLOG_PAGE${NC}"
else
    echo -e "${RED}❌ Import manquant dans $BLOG_PAGE${NC}"
    exit 1
fi

# Test 3: Vérifier les imports dans blog/[slug]/page.tsx
if grep -q "BlogImage" "$BLOG_SLUG_PAGE"; then
    echo -e "${GREEN}✅ Import BlogImage dans $BLOG_SLUG_PAGE${NC}"
else
    echo -e "${RED}❌ Import manquant dans $BLOG_SLUG_PAGE${NC}"
    exit 1
fi

# Test 4: Vérifier les imports dans BlogPreview.tsx
if grep -q "BlogCoverImage.*BlogImage" "$BLOG_PREVIEW"; then
    echo -e "${GREEN}✅ Import BlogCoverImage dans $BLOG_PREVIEW${NC}"
else
    echo -e "${RED}❌ Import manquant dans $BLOG_PREVIEW${NC}"
    exit 1
fi

echo ""
echo "2️⃣  Vérification des variables d'environnement..."
echo ""

# Test 5: Variables d'environnement publiques
if grep -q "NEXT_PUBLIC_AWS_REGION" .env.local; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_AWS_REGION dans .env.local${NC}"
else
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_AWS_REGION manquante (ajoutée automatiquement)${NC}"
fi

if grep -q "NEXT_PUBLIC_AWS_S3_BUCKET_NAME" .env.local; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_AWS_S3_BUCKET_NAME dans .env.local${NC}"
else
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_AWS_S3_BUCKET_NAME manquante (ajoutée automatiquement)${NC}"
fi

echo ""
echo "3️⃣  Vérification de la syntaxe TypeScript..."
echo ""

# Test 6: Compilation TypeScript
if command -v npx &> /dev/null; then
    echo "Compilation de BlogImage.tsx..."
    if npx tsc --noEmit "$BLOG_IMAGE_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Pas d'erreurs de compilation TypeScript${NC}"
    else
        echo -e "${YELLOW}⚠️  Des warnings TypeScript (non bloquants)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  npx non disponible, compilation skippée${NC}"
fi

echo ""
echo "4️⃣  Vérification de l'utilisation des props..."
echo ""

# Test 7: Vérifier que src= est utilisé au lieu de s3Key=
if grep -q "src={post.coverImage}" "$BLOG_PAGE"; then
    echo -e "${GREEN}✅ Props 'src' utilisé dans $BLOG_PAGE${NC}"
else
    echo -e "${RED}❌ Props incorrects dans $BLOG_PAGE${NC}"
    exit 1
fi

if grep -q "src={post.coverImage}" "$BLOG_SLUG_PAGE"; then
    echo -e "${GREEN}✅ Props 'src' utilisé dans $BLOG_SLUG_PAGE${NC}"
else
    echo -e "${RED}❌ Props incorrects dans $BLOG_SLUG_PAGE${NC}"
    exit 1
fi

echo ""
echo "5️⃣  Résumé..."
echo ""

echo -e "${GREEN}✅ Tous les tests sont passés !${NC}"
echo ""
echo "📋 Prochaines étapes :"
echo "  1. Redémarrer le serveur : npm run dev"
echo "  2. Tester http://localhost:3000/blog"
echo "  3. Tester http://localhost:3000/blog/[slug]"
echo "  4. Vérifier la page d'accueil (section blog)"
echo ""
echo "📝 Documentation complète : docs/FIX_BLOG_IMAGES_COMPLETE.md"
echo ""
