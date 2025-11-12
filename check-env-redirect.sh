#!/bin/bash

# 🔍 Script de vérification des variables d'environnement Clerk

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/home/sorami/sorami"
ENV_FILE="$APP_DIR/.env.production"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 Vérification des variables Clerk${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$APP_DIR"

echo ""
echo -e "${YELLOW}Fichier: $ENV_FILE${NC}"
echo "-------------------------------------------"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}✗${NC} Fichier non trouvé"
    exit 1
fi

echo ""
echo -e "${YELLOW}Variables CLERK trouvées:${NC}"
echo ""

# Afficher toutes les variables Clerk avec numéros de ligne
grep -n 'CLERK' "$ENV_FILE" | while IFS=':' read -r line_number line_content; do
    # Extraire le nom et la valeur
    var_name=$(echo "$line_content" | cut -d'=' -f1)
    var_value=$(echo "$line_content" | cut -d'=' -f2-)
    
    # Vérifier si la valeur contient des guillemets dans la valeur
    if echo "$var_value" | grep -E '^".*"$' > /dev/null; then
        # La valeur est entourée de guillemets (NORMAL)
        inner_value=$(echo "$var_value" | sed 's/^"\(.*\)"$/\1/')
        
        # Vérifier si le contenu lui-même commence par des guillemets
        if [[ "$inner_value" == \"* ]]; then
            echo -e "${RED}[L$line_number] $var_name=$var_value${NC}"
            echo -e "${RED}         ⚠️  PROBLÈME: Guillemets en trop dans la valeur !${NC}"
            echo -e "${YELLOW}         Valeur réelle qui sera utilisée: $inner_value${NC}"
        else
            echo -e "${GREEN}[L$line_number]${NC} $var_name=$var_value"
        fi
    else
        # Pas de guillemets (ACCEPTABLE pour les URLs)
        echo -e "${GREEN}[L$line_number]${NC} $var_name=$var_value"
    fi
done

echo ""
echo -e "${YELLOW}Test de format des URLs:${NC}"
echo "-------------------------------------------"

# Extraire et afficher les URLs de redirection
SIGN_IN_URL=$(grep 'NEXT_PUBLIC_CLERK_SIGN_IN_URL' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"')
SIGN_UP_URL=$(grep 'NEXT_PUBLIC_CLERK_SIGN_UP_URL' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"')
AFTER_SIGN_IN=$(grep 'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"')
AFTER_SIGN_UP=$(grep 'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"')

echo ""
echo "SIGN_IN_URL:        [$SIGN_IN_URL]"
echo "SIGN_UP_URL:        [$SIGN_UP_URL]"
echo "AFTER_SIGN_IN_URL:  [$AFTER_SIGN_IN]"
echo "AFTER_SIGN_UP_URL:  [$AFTER_SIGN_UP]"

echo ""
echo -e "${YELLOW}URL complète attendue après connexion:${NC}"
echo "https://sorami.app${AFTER_SIGN_IN}"

if [[ "$AFTER_SIGN_IN" == \"* ]]; then
    echo -e "${RED}⚠️  ERREUR: L'URL contient des guillemets !${NC}"
    echo -e "${RED}Résultat: https://sorami.app/${AFTER_SIGN_IN}${NC}"
    echo ""
    echo -e "${YELLOW}Solution: Exécutez ./fix-env-redirect.sh${NC}"
else
    echo -e "${GREEN}✓ Format correct${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
