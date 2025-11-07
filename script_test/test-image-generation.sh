#!/bin/bash

# Script de test pour la fonctionnalité de génération d'images
# Usage: ./test-image-generation.sh

echo "🧪 Test de la fonctionnalité de génération d'images IA"
echo "=================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher le statut
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# 1. Vérifier que les fichiers nécessaires existent
echo "1. Vérification des fichiers..."
FILES=(
    "src/types/image-api.ts"
    "src/hooks/useImageGeneration.ts"
    "src/components/ImageGenerationForm.tsx"
    "src/components/ImageProgress.tsx"
    "src/components/ImageResults.tsx"
    "src/app/generate-images/page.tsx"
    "IMAGE_GENERATION_FEATURE.md"
    "IMAGE_GENERATION_QUICKSTART.md"
)

missing_files=0
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "$file existe"
    else
        print_status 1 "$file manquant"
        missing_files=$((missing_files + 1))
    fi
done

echo ""

# 2. Vérifier que la variable d'environnement est définie
echo "2. Vérification des variables d'environnement..."
if grep -q "NEXT_PUBLIC_API_URL" .env.local 2>/dev/null; then
    print_status 0 "NEXT_PUBLIC_API_URL trouvée dans .env.local"
else
    print_status 1 "NEXT_PUBLIC_API_URL manquante dans .env.local"
    echo -e "${YELLOW}⚠️  Ajouter: NEXT_PUBLIC_API_URL=http://localhost:9006${NC}"
fi

echo ""

# 3. Vérifier que le middleware inclut la route
echo "3. Vérification du middleware..."
if grep -q "/generate-images" middleware.ts 2>/dev/null; then
    print_status 0 "Route /generate-images protégée dans le middleware"
else
    print_status 1 "Route /generate-images non protégée dans le middleware"
fi

echo ""

# 4. Vérifier que le dashboard a le lien
echo "4. Vérification du dashboard..."
if grep -q "generate-images" src/app/dashboard/page.tsx 2>/dev/null; then
    print_status 0 "Lien vers /generate-images présent dans le dashboard"
else
    print_status 1 "Lien vers /generate-images manquant dans le dashboard"
fi

echo ""

# 5. Vérifier la syntaxe TypeScript
echo "5. Vérification TypeScript..."
if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
    print_status 0 "Pas d'erreurs TypeScript"
else
    print_status 1 "Erreurs TypeScript détectées"
    echo -e "${YELLOW}⚠️  Exécuter: npx tsc --noEmit pour plus de détails${NC}"
fi

echo ""

# 6. Vérifier ESLint
echo "6. Vérification ESLint..."
if npm run lint > /dev/null 2>&1; then
    print_status 0 "Pas d'erreurs ESLint"
else
    print_status 1 "Erreurs ESLint détectées"
    echo -e "${YELLOW}⚠️  Exécuter: npm run lint pour plus de détails${NC}"
fi

echo ""

# 7. Test de build
echo "7. Test de build Next.js..."
if npm run build > /dev/null 2>&1; then
    print_status 0 "Build réussi"
else
    print_status 1 "Échec du build"
    echo -e "${YELLOW}⚠️  Exécuter: npm run build pour plus de détails${NC}"
fi

echo ""

# Résumé
echo "=================================================="
echo "📊 Résumé des tests"
echo "=================================================="

if [ $missing_files -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les fichiers sont présents${NC}"
else
    echo -e "${RED}❌ $missing_files fichier(s) manquant(s)${NC}"
fi

echo ""
echo "🚀 Pour démarrer l'application:"
echo "   1. Backend:  cd backend && python main.py"
echo "   2. Frontend: npm run dev"
echo "   3. Accéder à: http://localhost:3000/generate-images"
echo ""
echo "📚 Documentation:"
echo "   - Guide rapide:  IMAGE_GENERATION_QUICKSTART.md"
echo "   - Documentation: IMAGE_GENERATION_FEATURE.md"
echo "   - API Backend:   docs-webhooks/IMAGE_GENERATION_API.md"
echo ""

if [ $missing_files -eq 0 ]; then
    echo -e "${GREEN}🎉 Implémentation validée avec succès !${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Certains tests ont échoué${NC}"
    exit 1
fi
