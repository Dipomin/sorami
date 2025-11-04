#!/bin/bash

##############################################################################
# Quick Health Check - Sorami Frontend
# Usage: ./quick-check.sh
##############################################################################

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅${NC} $2"
    else
        echo -e "${RED}❌${NC} $2"
    fi
}

echo "🔍 Quick Health Check - Sorami Frontend"
echo "========================================"
echo ""

# Nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅${NC} Nginx running"
else
    echo -e "${RED}❌${NC} Nginx NOT running"
fi

# PM2
if pm2 describe sorami-frontend > /dev/null 2>&1; then
    STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="sorami-frontend") | .pm2_env.status' 2>/dev/null || echo "unknown")
    if [ "$STATUS" == "online" ]; then
        echo -e "${GREEN}✅${NC} PM2 app online"
    else
        echo -e "${RED}❌${NC} PM2 app NOT online (status: $STATUS)"
    fi
else
    echo -e "${RED}❌${NC} PM2 app NOT found"
fi

# Next.js
CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$CODE" == "200" ] || [ "$CODE" == "301" ] || [ "$CODE" == "302" ]; then
    echo -e "${GREEN}✅${NC} Next.js responding (HTTP $CODE)"
else
    echo -e "${RED}❌${NC} Next.js NOT responding (HTTP $CODE)"
fi

# External
EXT=$(curl -s -o /dev/null -w "%{http_code}" http://sorami.app 2>/dev/null || echo "000")
if [ "$EXT" == "200" ] || [ "$EXT" == "301" ] || [ "$EXT" == "302" ]; then
    echo -e "${GREEN}✅${NC} Site accessible (HTTP $EXT)"
else
    echo -e "${RED}❌${NC} Site NOT accessible (HTTP $EXT)"
fi

# Build
if [ -d "/home/sorami/sorami/.next" ]; then
    echo -e "${GREEN}✅${NC} Next.js build exists"
else
    echo -e "${RED}❌${NC} Next.js build MISSING"
fi

# Config
if [ -f "/etc/nginx/sites-enabled/sorami" ]; then
    echo -e "${GREEN}✅${NC} Nginx config enabled"
else
    echo -e "${RED}❌${NC} Nginx config NOT enabled"
fi

echo ""
echo "For detailed diagnosis, run: ./diagnose-404.sh"
echo "For automatic fix, run: ./fix-404.sh"
