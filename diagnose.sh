#!/bin/bash

# 🔍 Script de diagnostic Sorami Frontend
# Ce script vérifie et corrige les problèmes courants de déploiement

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_NAME="sorami-frontend"
APP_DIR="/home/sorami/sorami"
PORT=3000

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 Diagnostic Sorami Frontend${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Aller dans le répertoire de l'application
cd "$APP_DIR"

echo ""
echo -e "${YELLOW}📊 1. Vérification de l'environnement${NC}"
echo "-------------------------------------------"

# Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js: $(node -v)"
else
    echo -e "${RED}✗${NC} Node.js: Non installé"
fi

# npm
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓${NC} npm: $(npm -v)"
else
    echo -e "${RED}✗${NC} npm: Non installé"
fi

# PM2
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✓${NC} PM2: $(pm2 -v)"
else
    echo -e "${RED}✗${NC} PM2: Non installé"
    echo -e "${YELLOW}Installation de PM2...${NC}"
    npm install -g pm2
fi

echo ""
echo -e "${YELLOW}📁 2. Vérification des fichiers${NC}"
echo "-------------------------------------------"

# package.json
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json existe"
else
    echo -e "${RED}✗${NC} package.json manquant"
    exit 1
fi

# .env.production
if [ -f ".env.production" ]; then
    echo -e "${GREEN}✓${NC} .env.production existe"
else
    echo -e "${YELLOW}⚠${NC} .env.production manquant"
fi

# ecosystem.config.js
if [ -f "ecosystem.config.js" ]; then
    echo -e "${GREEN}✓${NC} ecosystem.config.js existe"
else
    echo -e "${RED}✗${NC} ecosystem.config.js manquant"
    exit 1
fi

# node_modules
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules existe"
else
    echo -e "${YELLOW}⚠${NC} node_modules manquant"
fi

# .next
if [ -d ".next" ]; then
    echo -e "${GREEN}✓${NC} .next build directory existe"
else
    echo -e "${RED}✗${NC} .next build directory manquant"
fi

echo ""
echo -e "${YELLOW}🔌 3. Vérification du port ${PORT}${NC}"
echo "-------------------------------------------"

if lsof -i :$PORT &> /dev/null; then
    echo -e "${GREEN}✓${NC} Port $PORT est utilisé"
    lsof -i :$PORT | tail -n +2
else
    echo -e "${RED}✗${NC} Port $PORT n'est pas utilisé (application non démarrée)"
fi

echo ""
echo -e "${YELLOW}📊 4. Statut PM2${NC}"
echo "-------------------------------------------"

if pm2 describe "$APP_NAME" &> /dev/null; then
    echo -e "${GREEN}✓${NC} Process PM2 existe"
    pm2 describe "$APP_NAME" | grep -E "status|restart|uptime|memory|cpu"
else
    echo -e "${RED}✗${NC} Process PM2 n'existe pas"
fi

echo ""
echo -e "${YELLOW}📋 5. Logs PM2 (dernières 50 lignes)${NC}"
echo "-------------------------------------------"

if pm2 describe "$APP_NAME" &> /dev/null; then
    echo -e "${BLUE}Logs d'erreur:${NC}"
    pm2 logs "$APP_NAME" --err --lines 20 --nostream 2>/dev/null || echo "Pas de logs d'erreur"
    
    echo ""
    echo -e "${BLUE}Logs de sortie:${NC}"
    pm2 logs "$APP_NAME" --out --lines 20 --nostream 2>/dev/null || echo "Pas de logs de sortie"
fi

echo ""
echo -e "${YELLOW}🌐 6. Test de connexion locale${NC}"
echo "-------------------------------------------"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✓${NC} Application répond (HTTP $HTTP_CODE)"
else
    echo -e "${RED}✗${NC} Application ne répond pas (HTTP $HTTP_CODE)"
fi

echo ""
echo -e "${YELLOW}🔧 7. Permissions des fichiers${NC}"
echo "-------------------------------------------"

OWNER=$(stat -c '%U' . 2>/dev/null || stat -f '%Su' .)
echo "Propriétaire actuel: $OWNER"

if [ "$OWNER" = "$(whoami)" ]; then
    echo -e "${GREEN}✓${NC} Permissions correctes"
else
    echo -e "${YELLOW}⚠${NC} Propriétaire différent de l'utilisateur actuel"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🛠️  Actions recommandées${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Proposer des solutions
if ! pm2 describe "$APP_NAME" &> /dev/null; then
    echo -e "${YELLOW}1.${NC} PM2 process n'existe pas. Lancer:"
    echo "   pm2 start ecosystem.config.js --env production"
    echo "   pm2 save"
fi

if [ ! -d ".next" ]; then
    echo -e "${YELLOW}2.${NC} Build manquant. Lancer:"
    echo "   npm run build"
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}3.${NC} Dépendances manquantes. Lancer:"
    echo "   npm install --legacy-peer-deps"
fi

if [ "$HTTP_CODE" = "000" ] || [ "$HTTP_CODE" = "500" ]; then
    echo -e "${YELLOW}4.${NC} Application ne répond pas. Vérifier les logs:"
    echo "   pm2 logs $APP_NAME --lines 50"
    echo "   pm2 restart $APP_NAME"
fi

echo ""
echo -e "${GREEN}💡 Pour relancer complètement l'application:${NC}"
echo "   ./deploy-manual.sh"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
