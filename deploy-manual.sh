#!/bin/bash

# 🚀 Script de déploiement manuel Sorami Frontend
# Ce script peut être exécuté directement sur le VPS ou en local avec SSH

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="sorami-frontend"
APP_DIR="/home/sorami/sorami"
PM2_CONFIG="ecosystem.config.js"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Déploiement Sorami Frontend${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}📂 Navigating to app directory...${NC}"
    cd "$APP_DIR"
fi

echo -e "${GREEN}✓${NC} Current directory: $(pwd)"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ ERROR: Node.js n'est pas installé!${NC}"
    echo -e "${YELLOW}Installez Node.js 20+ et PM2 puis réessayez.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js: $(node -v)"
echo -e "${GREEN}✓${NC} npm: $(npm -v)"

# Vérifier PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ ERROR: PM2 n'est pas installé!${NC}"
    echo -e "${YELLOW}Installation de PM2...${NC}"
    npm install -g pm2
fi

echo -e "${GREEN}✓${NC} PM2: $(pm2 -v)"

# Sauvegarder le commit actuel pour rollback
CURRENT_COMMIT=$(git rev-parse HEAD)
echo -e "${BLUE}📝 Current commit: ${CURRENT_COMMIT:0:7}${NC}"

# Récupérer les dernières modifications
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git fetch origin
git pull origin main

NEW_COMMIT=$(git rev-parse HEAD)
echo -e "${BLUE}📝 New commit: ${NEW_COMMIT:0:7}${NC}"

if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
    echo -e "${YELLOW}⚠️  No changes detected. Rebuilding anyway...${NC}"
fi

# Nettoyer les anciens fichiers
echo -e "${YELLOW}🧹 Cleaning old files...${NC}"
rm -rf node_modules .next 2>/dev/null || true

# Installer les dépendances
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --legacy-peer-deps

# Générer Prisma Client
echo -e "${YELLOW}🗄️  Generating Prisma Client...${NC}"
npx prisma generate

# Appliquer les migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
npx prisma migrate deploy

# Build de l'application
echo -e "${YELLOW}🏗️  Building application...${NC}"
npm run build

# Démarrer/Redémarrer PM2
echo -e "${YELLOW}🔄 Managing PM2 process...${NC}"

if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    echo -e "${BLUE}♻️  Process exists, reloading...${NC}"
    pm2 reload "$APP_NAME" --update-env
else
    echo -e "${BLUE}🆕 First deployment, starting new process...${NC}"
    pm2 start "$PM2_CONFIG" --env production
fi

# Sauvegarder la configuration PM2
pm2 save

# Afficher le statut
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo -e "${YELLOW}📊 PM2 Status:${NC}"
pm2 status "$APP_NAME"

echo ""
echo -e "${YELLOW}📝 Deployment Info:${NC}"
echo -e "  Commit: ${NEW_COMMIT:0:7}"
echo -e "  Branch: $(git rev-parse --abbrev-ref HEAD)"
echo -e "  Date: $(date '+%Y-%m-%d %H:%M:%S')"

echo ""
echo -e "${GREEN}🔗 Application: https://sorami.app${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Health check
echo ""
echo -e "${YELLOW}🏥 Performing health check...${NC}"
sleep 3

if curl -f -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Application is responding!${NC}"
else
    echo -e "${RED}⚠️  Application may not be responding yet. Check logs with: pm2 logs $APP_NAME${NC}"
fi

echo ""
echo -e "${YELLOW}💡 Useful commands:${NC}"
echo -e "  pm2 logs $APP_NAME       - View logs"
echo -e "  pm2 restart $APP_NAME    - Restart app"
echo -e "  pm2 stop $APP_NAME       - Stop app"
echo -e "  pm2 monit                - Monitor resources"
