#!/bin/bash

# 🔧 Script de correction des redirections Clerk
# Corrige le problème de guillemets dans les variables d'environnement

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/home/sorami/sorami"
ENV_FILE="$APP_DIR/.env.production"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 Correction des redirections Clerk${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$APP_DIR"

echo ""
echo -e "${YELLOW}1. Vérification du fichier .env.production${NC}"
echo "-------------------------------------------"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}✗${NC} Fichier .env.production non trouvé"
    exit 1
fi

echo -e "${GREEN}✓${NC} Fichier trouvé"

echo ""
echo -e "${YELLOW}2. Vérification des variables problématiques${NC}"
echo "-------------------------------------------"

# Chercher les lignes avec guillemets dans les valeurs
if grep -E 'NEXT_PUBLIC_CLERK.*URL.*=.*".*".*"' "$ENV_FILE"; then
    echo -e "${RED}✗${NC} Guillemets en trop détectés !"
else
    echo -e "${GREEN}✓${NC} Pas de guillemets en trop détectés"
fi

# Afficher les valeurs actuelles
echo ""
echo -e "${BLUE}Valeurs actuelles :${NC}"
grep -E 'NEXT_PUBLIC_CLERK.*URL' "$ENV_FILE" || echo "Aucune variable Clerk trouvée"

echo ""
echo -e "${YELLOW}3. Création d'un backup${NC}"
echo "-------------------------------------------"

cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✓${NC} Backup créé: $ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo -e "${YELLOW}4. Correction des variables${NC}"
echo "-------------------------------------------"

# Supprimer les guillemets en trop dans les valeurs
# Transformer: NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
# En:          NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
# Ou:          NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"

sed -i.tmp 's/NEXT_PUBLIC_CLERK_SIGN_IN_URL="\(.*\)"/NEXT_PUBLIC_CLERK_SIGN_IN_URL=\1/g' "$ENV_FILE"
sed -i.tmp 's/NEXT_PUBLIC_CLERK_SIGN_UP_URL="\(.*\)"/NEXT_PUBLIC_CLERK_SIGN_UP_URL=\1/g' "$ENV_FILE"
sed -i.tmp 's/NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="\(.*\)"/NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=\1/g' "$ENV_FILE"
sed -i.tmp 's/NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="\(.*\)"/NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=\1/g' "$ENV_FILE"

# Supprimer le fichier temporaire
rm -f "$ENV_FILE.tmp"

echo -e "${GREEN}✓${NC} Variables corrigées"

echo ""
echo -e "${BLUE}Nouvelles valeurs :${NC}"
grep -E 'NEXT_PUBLIC_CLERK.*URL' "$ENV_FILE"

echo ""
echo -e "${YELLOW}5. Redémarrage de l'application${NC}"
echo "-------------------------------------------"

if pm2 describe sorami-frontend > /dev/null 2>&1; then
    pm2 restart sorami-frontend --update-env
    echo -e "${GREEN}✓${NC} Application redémarrée"
else
    echo -e "${YELLOW}⚠${NC} PM2 process non trouvé. Démarrage..."
    pm2 start ecosystem.config.js --env production
    pm2 save
    echo -e "${GREEN}✓${NC} Application démarrée"
fi

echo ""
echo -e "${YELLOW}6. Test de connexion${NC}"
echo "-------------------------------------------"

sleep 3

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✓${NC} Application répond (HTTP $HTTP_CODE)"
else
    echo -e "${RED}✗${NC} Application ne répond pas (HTTP $HTTP_CODE)"
    echo -e "${YELLOW}Vérifiez les logs:${NC} pm2 logs sorami-frontend"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Correction terminée !${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}💡 Testez la connexion sur:${NC}"
echo "   https://sorami.app/sign-in"
echo ""
echo -e "${YELLOW}📋 Si le problème persiste:${NC}"
echo "   1. Vérifiez: cat $ENV_FILE | grep CLERK"
echo "   2. Logs PM2: pm2 logs sorami-frontend --lines 50"
echo ""
